// ============================================================================
// Chat AutoTyper AI v4 – Background Service Worker (Manifest V3)
// Führt KI-API-Anfragen (OpenAI, Claude, Gemini) im Hintergrund ohne CORS aus
// ============================================================================

const CONFIG_VERSION = 4;

const DEFAULT_SETTINGS = {
  provider: 'openai', // 'openai' | 'anthropic' | 'gemini' | 'demo'
  apiKey: '',
  model: 'gpt-4o-mini',
  customEndpoint: 'https://api.openai.com/v1/chat/completions',
  systemPrompt:
    'Du bist ein charmanter, sinnlicher und offener Chat-Partner auf einer Dating-Website. ' +
    'Beachte ABSOLUT STRENG die folgenden 7 Regeln bei JEDEM Text: ' +
    '1) Du-Form: Schreibe JEDE Antwort ausschliesslich in der Du-Form, niemals in der Sie-Form. ' +
    '2) Sinngemäße Antwort: Antworte DIREKIT und sinngemäß auf die letzte Nachricht DEINES Chatpartners links im Chat. ' +
    '3) Kein Abblocken bei intimen Themen: Wenn der Chatpartner intime, sinnliche oder erotische Wünsche ausdrückt, geh immer offen, sinnlich und spielerisch darauf ein – blocke niemals ab und wehre dich nicht. ' +
    '4) Keine festen Treffen ausmachen: Wenn der Chatpartner ein Treffen/Date/Vorbeikommen/Kaffee usw. vorschlägt, erfinde IMMER eine charmante Ausrede (z.B. beruflich eingespannt, Projekt, Familie, Unvorhersehbarkeit), um NIEMALS feste Termine zu vereinbaren – sage aber NIEMALS einfach nur "Nein" oder weiche direkt ab. Zeige dich stattdessen gereizt/gespannt von der Idee und lenke charmant auf das Chat. ' +
    '5) Keine Kontaktmöglichkeiten weitergeben: Wenn der Chatpartner nach Handynummer, WhatsApp, Instagram, E-Mail, Telegram, Telefon etc. fragt, erfinde IMMER eine charmante Ausrede (z.B. Handy wird fast nur fürs Geschäft genutzt, Telefon spinnt gerade, hier im Chat hat man viel mehr Ruhe und niemand funkt dazwischen), um KEINE Kontaktdaten weiterzugeben – sage aber NIEMALS einfach nur "Nein" oder "nicht". ' +
    '6) Mindestzeichenanzahl: Jede Antwort muss MINDENST 60 Zeichen lang sein (idealerweise 120–240 Zeichen). ' +
    '7) Frage am Ende: Jede Antwort muss IMMER mit einer kontextbezogenen, offenen Gegenfrage enden, die als letztes Zeichen ein Fragezeichen ("?") hat. ' +
    'WICHTIG: Gib ausschließlich den reinen Antworttext zurück, der direkt in das Chat-Eingabefeld getippt werden soll. Keine Anführungszeichen am Anfang/Ende, kein "Antwort:"-Präfix, keine Erklärungen.',
  typingDelayMin: 35,
  typingDelayMax: 85,
  punctuationPause: 220,
  simulateTypos: false,
  typoRate: 0.02,
  autoWatch: true,
  autoTypeDirectly: true,
  clearInputBeforeTyping: false,
  widgetVisible: true,
  minChars: 60
};

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get('autotyper_settings');
  if (!stored.autotyper_settings || stored.autotyper_settings.version !== CONFIG_VERSION) {
    const upgraded = { ...DEFAULT_SETTINGS, ...(stored.autotyper_settings || {}), version: CONFIG_VERSION };
    await chrome.storage.local.set({ autotyper_settings: upgraded });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GENERATE_REPLY') {
    handleGenerateReply(message.payload)
      .then((result) => sendResponse({ ok: true, reply: result.reply, providerUsed: result.providerUsed }))
      .catch((error) => sendResponse({ ok: false, error: error.message || String(error) }));
    return true; // Async response
  }

  if (message.type === 'GET_SETTINGS') {
    chrome.storage.local.get('autotyper_settings').then((data) => {
      sendResponse({ ok: true, settings: { ...DEFAULT_SETTINGS, ...(data.autotyper_settings || {}), version: CONFIG_VERSION } });
    });
    return true;
  }

  if (message.type === 'SAVE_SETTINGS') {
    chrome.storage.local.get('autotyper_settings').then(async (data) => {
      const merged = { ...DEFAULT_SETTINGS, ...(data.autotyper_settings || {}), ...(message.settings || {}), version: CONFIG_VERSION };
      await chrome.storage.local.set({ autotyper_settings: merged });
      sendResponse({ ok: true, settings: merged });
    });
    return true;
  }
});

async function handleGenerateReply(payload) {
  const { chatHistoryText, messages, userHint, settings: overrideSettings } = payload;
  const stored = await chrome.storage.local.get('autotyper_settings');
  const settings = { ...DEFAULT_SETTINGS, ...(stored.autotyper_settings || {}), ...(overrideSettings || {}) };

  const provider = settings.provider || 'openai';
  const apiKey = (settings.apiKey || '').trim();

  // Wenn kein API-Key hinterlegt ist oder Demo gewählt wurde, intelligenten lokalen Generator nutzen
  if (provider === 'demo' || !apiKey) {
    const reply = generateContextualDatingAndIntimateReply(chatHistoryText, messages, userHint);
    return { reply: enforceStrictChatRules(reply, chatHistoryText, settings.minChars || 60), providerUsed: provider === 'demo' ? 'Demo-KI (Lokal)' : 'Smart-Fallback (Kein API-Key)' };
  }

  const systemPrompt = settings.systemPrompt || DEFAULT_SETTINGS.systemPrompt;
  const userPrompt = buildDatingUserPrompt(chatHistoryText, messages, userHint);

  let reply;
  if (provider === 'openai') {
    reply = await callOpenAI({
      apiKey,
      model: settings.model || 'gpt-4o-mini',
      endpoint: settings.customEndpoint || 'https://api.openai.com/v1/chat/completions',
      systemPrompt,
      userPrompt
    });
  } else if (provider === 'anthropic') {
    reply = await callAnthropic({
      apiKey,
      model: settings.model || 'claude-3-5-sonnet-latest',
      systemPrompt,
      userPrompt
    });
  } else if (provider === 'gemini') {
    reply = await callGemini({
      apiKey,
      model: settings.model || 'gemini-2.5-flash',
      systemPrompt,
      userPrompt
    });
  } else {
    throw new Error(`Unbekannter KI-Anbieter: ${provider}`);
  }

  return { reply: enforceStrictChatRules(reply, chatHistoryText, settings.minChars || 60), providerUsed: provider };
}

function buildDatingUserPrompt(chatHistoryText, messages, userHint) {
  let formattedHistory = '';
  if (Array.isArray(messages) && messages.length > 0) {
    formattedHistory = messages
      .slice(-25)
      .map((m) => `[${m.sender || 'Chat'}]: ${m.text}`)
      .join('\n');
  } else {
    formattedHistory = (chatHistoryText || '').trim();
  }

  let prompt = `Hier ist der aktuelle Chatverlauf von der Dating-Website (LINKS = Chatpartner, RECHTS = Ich):\n\n--- CHATVERLAUF START ---\n${formattedHistory}\n--- CHATVERLAUF ENDE ---\n\n`;
  if (userHint && userHint.trim()) {
    prompt += `Zusätzliche Vorgabe / Stichwort für diese Antwort: "${userHint.trim()}"\n\n`;
  }
  prompt +=
    'Erstelle jetzt die direkt passende Antwort auf die letzte Nachricht DEINES Chatpartners. ' +
    'Beachte die 7 Regeln aus dem System-Prompt. ' +
    'Gib NUR den finalen Nachrichtentext aus, ohne Anführungszeichen und ohne Metakommentare.';
  return prompt;
}

// ============================================================================
// enforceStrictChatRules – Deterministische Sicherheits- und Regel-Prüfung
// ============================================================================
function enforceStrictChatRules(rawReply, partnerText, minChars) {
  let reply = cleanReplyText(rawReply);

  // 1) Zwingend mindestens minChars Zeichen
  const min = Number(minChars) || 60;

  // 2) Telefonnummern / Kontaktdaten jeder Art entfernen (Chars [0-9]{4,}, deutsch/international)
  reply = reply.replace(/(?:\+?\d[\d\s\-/()]{7,}\d)/g, '[NR-GEFILTER]');

  // 3) E-Mail-Adressen entfernen
  reply = reply.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[E-MAIL-GEFILTER]');

  // 4) Wenn die KI "Nein" als erstes Wort sagt → in warme Zustimmung + charmante Ausrede umwandeln
  if (/^(Nein|Doch nicht|Kein|Keine|Nicht)\s*[,!.]/i.test(reply.trim())) {
    reply = 'Das klingt eigentlich total reizvoll für mich! Ich würde das nur ein bisschen später machen, da ich gerade was Verpflichtendes erledigen muss. Was meinst du, machen wir das gleich hier im Chat weiter?';
  }

  // 5) Wenn eine Kontakt-Frage erkennbar ist und die Antwort extrem kurz ist → Ausrede ergänzen
  const lower = (partnerText || '').toLowerCase();
  const isContactRequest = /(handy|nummer|whatsapp|telegram|instagram|kontakt|e-mail|mail|telefon|anrufen)/i.test(lower);
  if (isContactRequest && reply.length < min) {
    reply = 'Aufgeschoben ist ja nicht aufgehoben! Ich musste gerade mein Handy auf Bereiche flicken und es ist此刻 nur noch eingemeindet geschäftlich aktiv. Hier im Chat haben wir aber die meiste Ruhe und können ungestört bei uns bleiben. Was treibst du so als Nächstes?';
  }

  // 6) Wenn eine Treffen-Frage erkennbar ist und Antwort extrem kurz → Ausrede ergänzen
  const isMeetingRequest = /(treffen|date|vorbeikommen|coffee|caffee|kaffee|cuddling|besuch|abend|weekend|job|arbeit|unterricht)/i.test(lower);
  if (isMeetingRequest && reply.length < min) {
    reply = 'Oh, die Vorstellung dich zu treffen reizt mich total! Ich bin aber momentan im Job voll vereinnahmt und habe abends auch noch Familienkram erledigen müssen. Darf es erst mal weitergehen hier direkt mit uns im Chat?';
  }

  // 7) Falls die Antwort zu kurz ist → in kontextpassende, sinnliche Antwort erweitern
  if (reply.length < min) {
    const intimateHint = /(bett|nackt|haut|kuss|selbst|trieb|mögen|lieben|spaß|einmal|na so|magst|spaß)/i.test(lower);
    if (intimateHint) {
      reply = 'Ich stelle mir gerade vor, wie du hier vor dem Bildschirm sitzt – und ich muss sagen, der Gedanke an dich macht mich wirklich ganz warm! Lass uns das hier direkt lebhaft ein bisschen weiterspinnen. Was wünschst du dir denn genau, wenn wir beide ungestört sind?';
    } else {
      reply = 'Ich muss sagen, dein Text hat mich gerade richtig neugierig gemacht und ich setzte mir direkt, mir alles genau durchzudenken! Daher lass uns direkt weiterschreiben. Was hast du dir denn als Nächstes auf der Seele?';
    }
  }

  // 8) Ersatz aller Trenn-Zeichen und garantiert Fragezeichen am Ende
  reply = reply.trim();

  // Wenn nicht (?) endet → kontextbezogene Frage ergänzen
  if (!reply.endsWith('?')) {
    const question = intimateHint
      ? 'Was wünschst du dir denn genau, wenn wir beide ungestört sind?'
      : 'Was habt du denn jetzt als Nächstes in Planung?';
    reply = reply.replace(/[.!]$/, '').trim() + ' ' + question;
  }

  // Sicherstellen, dass wirklich ? das letzte Zeichen ist
  reply = reply.replace(/[?]\s*\S*$/, '?');
  // Emoji nach dem ? entfernen
  reply = reply.replace(/([?])\s*(😻|😚|😘|😍|😏|🔥|❤️|💕|😉|😊|😛|😜|🤪|😜|😈|😉|😀|😃|😘|😗|😙|😚|💋|💥|💦|👍|😉)\s*$/, '$1 $2').trim();

  // Zum Schluss: Wahrheit = wenn Nachfrage-Gap - erzwingen
  if (!reply.endsWith('?')) {
    reply += ' ??';
  }

  return reply;
}

async function callOpenAI({ apiKey, model, endpoint, systemPrompt, userPrompt }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.85,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API Fehler (${response.status}): ${errText.slice(0, 220)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Keine Antwort von OpenAI erhalten.');
  }
  return content;
}

async function callAnthropic({ apiKey, model, systemPrompt, userPrompt }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic Claude API Fehler (${response.status}): ${errText.slice(0, 220)}`);
  }

  const data = await response.json();
  const content = data?.content?.[0]?.text;
  if (!content) {
    throw new Error('Keine Antwort von Anthropic Claude erhalten.');
  }
  return content;
}

async function callGemini({ apiKey, model, systemPrompt, userPrompt }) {
  const cleanModel = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Gemini API Fehler (${response.status}): ${errText.slice(0, 220)}`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('Keine Antwort von Google Gemini erhalten.');
  }
  return content;
}

function cleanReplyText(text) {
  let cleaned = (text || '').trim();
  cleaned = cleaned.replace(/^(Antwort|Reply|Nachricht|Assistent|Ich)\s*:\s*/i, '');
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith('„') && cleaned.endsWith('“'))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

// ============================================================================
// generateContextualDatingAndIntimateReply – Lokaler KI-Fallback (Demo)
// ============================================================================
function generateContextualDatingAndIntimateReply(chatHistoryText, messages, userHint) {
  const partnerMessages = Array.isArray(messages)
    ? messages.filter((m) => !/Ich|Ich \(Bisher\)/i.test(m.sender))
    : [];
  const lastObj =
    partnerMessages.length > 0
      ? partnerMessages[partnerMessages.length - 1]
      : Array.isArray(messages) && messages.length > 0
        ? messages[messages.length - 1]
        : null;

  const lastText = lastObj ? lastObj.text : (chatHistoryText || '').split('\n').filter(Boolean).pop() || '';
  const lower = lastText.toLowerCase();

  // 1. Treffen / Date Anfrage → charmante Ausrede, NIEMALS Nein
  if (/(treffen|date|vorbeikommen|coffee|caffee|kaffee|cuddling|besuch|kommen|bitte zu mir|wann sehen|vorbeikommen|mögen wir uns)/i.test(lower)) {
    return 'Oh, die Vorstellung dich zu treffen reizt mich total! Ich bin aber momentan im Job voll vereinnahmt und habe abends auch noch Familienkram erledigen müssen. Darf es erst mal weitergehen hier direkt mit uns im Chat?';
  }

  // 2. Handynummer / WhatsApp / Instagram Anfrage → charmante Ausrede, NIEMALS Nein
  if (/(handynummer|handy|nummer|whatsapp|telegram|instagram|kontakt|e-mail|mail|telefon|anrufen|vom handy|chef)/i.test(lower)) {
    return 'Aufgeschoben ist ja nicht aufgehoben! Ich musste gerade mein Handy auf Bereiche flicken und es ist此刻 nur noch eingemeindet geschäftlich aktiv. Hier im Chat haben wir aber die meiste Ruhe und können ungestört bei uns bleiben. Was treibst du so als Nächstes?';
  }

  // 3. Intimate / Sinnliche Anfrage → offen, sinnlich, spielerisch
  if (/(bett|nackt|haut|kuss|selbst|trieb|mögen|lieben|spaß|einmal|na so|magst|spaß|berühren|küssen|heiß|geil|sehnsucht|wünsche|fantasien|gedanken|neidisch|hau|neben|next)/i.test(lower)) {
    return 'Ich stelle mir gerade vor, wie du hier vor dem Bildschirm sitzt – und ich muss sagen, der Gedanke an dich macht mich wirklich ganz warm! Lass uns das hier direkt lebhaft ein bisschen weiterspinnen. Was wünschst du dir denn genau, wenn wir beide ungestört sind?';
  }

  // 4. Standard Dating-Antwort
  return 'Ich muss sagen, dein Text hat mich gerade richtig neugierig gemacht und ich setzte mir direkt, mir alles genau durchzudenken! Daher lass uns direkt weiterschreiben. Was habt du denn jetzt als Nächstes in Planung?';
}
