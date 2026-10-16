// ============================================================================
// Chat AutoTyper AI - Background Service Worker (Manifest V3)
// Führt KI-API-Anfragen (OpenAI, Claude, Gemini) im Hintergrund ohne CORS aus
// ============================================================================

const DEFAULT_SETTINGS = {
  provider: 'openai', // 'openai' | 'anthropic' | 'gemini' | 'demo'
  apiKey: '',
  model: 'gpt-4o-mini',
  customEndpoint: 'https://api.openai.com/v1/chat/completions',
  systemPrompt:
    'Du bist ein hilfreicher, freundlicher und professioneller Chat-Assistent. ' +
    'Lies den bisherigen Chatverlauf aufmerksam durch und verfasse die nächste passende Antwort. ' +
    'WICHTIG: Gib ausschließlich den reinen Antworttext zurück, der direkt in das Chat-Eingabefeld getippt werden soll. ' +
    'Keine Anführungszeichen am Anfang/Ende, kein "Antwort:"-Präfix, keine Erklärungen.',
  typingDelayMin: 35,
  typingDelayMax: 85,
  punctuationPause: 220,
  simulateTypos: false,
  typoRate: 0.02,
  autoWatch: true,
  autoTypeDirectly: true,
  clearInputBeforeTyping: false,
  widgetVisible: true
};

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get('autotyper_settings');
  if (!stored.autotyper_settings) {
    await chrome.storage.local.set({ autotyper_settings: DEFAULT_SETTINGS });
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
      sendResponse({ ok: true, settings: { ...DEFAULT_SETTINGS, ...(data.autotyper_settings || {}) } });
    });
    return true;
  }

  if (message.type === 'SAVE_SETTINGS') {
    chrome.storage.local.get('autotyper_settings').then(async (data) => {
      const merged = { ...DEFAULT_SETTINGS, ...(data.autotyper_settings || {}), ...(message.settings || {}) };
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
    const reply = generateSmartLocalReply(chatHistoryText, messages, userHint);
    return { reply, providerUsed: provider === 'demo' ? 'Demo-KI (Lokal)' : 'Smart-Fallback (Kein API-Key)' };
  }

  const systemPrompt = settings.systemPrompt || DEFAULT_SETTINGS.systemPrompt;
  const userPrompt = buildUserPrompt(chatHistoryText, messages, userHint);

  if (provider === 'openai') {
    const reply = await callOpenAI({
      apiKey,
      model: settings.model || 'gpt-4o-mini',
      endpoint: settings.customEndpoint || 'https://api.openai.com/v1/chat/completions',
      systemPrompt,
      userPrompt
    });
    return { reply: cleanReplyText(reply), providerUsed: `OpenAI (${settings.model || 'gpt-4o-mini'})` };
  }

  if (provider === 'anthropic') {
    const reply = await callAnthropic({
      apiKey,
      model: settings.model || 'claude-3-5-sonnet-latest',
      systemPrompt,
      userPrompt
    });
    return { reply: cleanReplyText(reply), providerUsed: `Claude (${settings.model || 'claude-3-5-sonnet-latest'})` };
  }

  if (provider === 'gemini') {
    const reply = await callGemini({
      apiKey,
      model: settings.model || 'gemini-2.5-flash',
      systemPrompt,
      userPrompt
    });
    return { reply: cleanReplyText(reply), providerUsed: `Gemini (${settings.model || 'gemini-2.5-flash'})` };
  }

  throw new Error(`Unbekannter KI-Anbieter: ${provider}`);
}

function buildUserPrompt(chatHistoryText, messages, userHint) {
  let formattedHistory = '';
  if (Array.isArray(messages) && messages.length > 0) {
    formattedHistory = messages
      .slice(-25)
      .map((m) => `[${m.sender || 'Chat'}]: ${m.text}`)
      .join('\n');
  } else {
    formattedHistory = (chatHistoryText || '').trim();
  }

  let prompt = `Hier ist der aktuelle Chatverlauf von der Website:\n\n--- CHATVERLAUF START ---\n${formattedHistory}\n--- CHATVERLAUF ENDE ---\n\n`;
  if (userHint && userHint.trim()) {
    prompt += `Zusätzliche Vorgabe / Stichwort für diese Antwort: "${userHint.trim()}"\n\n`;
  }
  prompt +=
    'Erstelle jetzt die direkt passende Antwort auf die letzte Nachricht im Chatverlauf. ' +
    'Gib NUR den finalen Nachrichtentext aus, ohne Anführungszeichen und ohne Metakommentare.';
  return prompt;
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
      temperature: 0.7,
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
        temperature: 0.7,
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

function generateSmartLocalReply(chatHistoryText, messages, userHint) {
  const lastMsg =
    Array.isArray(messages) && messages.length > 0
      ? messages[messages.length - 1].text
      : (chatHistoryText || '').split('\n').filter(Boolean).pop() || '';

  const lower = lastMsg.toLowerCase();

  if (userHint && userHint.trim()) {
    return `Vielen Dank für die Nachricht! Bezüglich Ihrer Anfrage: ${userHint.trim()}. Geben Sie mir gerne kurz Bescheid, ob das so für Sie passt.`;
  }

  if (lower.includes('termin') || lower.includes('wann') || lower.includes('zeit')) {
    return 'Vielen Dank für Ihre Anfrage! Wir hätten diese Woche am Donnerstag um 14:00 Uhr oder am Freitagvormittag um 10:30 Uhr noch einen freien Termin. Passt Ihnen einer dieser Zeitpunkte?';
  }
  if (lower.includes('preis') || lower.includes('kosten') || lower.includes('angebot')) {
    return 'Gerne erstelle ich Ihnen dazu ein transparentes und unverbindliches Angebot. Könnten Sie mir noch kurz den genauen Umfang bzw. Ihre Eckdaten schildern, damit ich alles passend kalkulieren kann?';
  }
  if (lower.includes('problem') || lower.includes('fehler') || lower.includes('funktioniert nicht') || lower.includes('hilfe')) {
    return 'Danke für den Hinweis! Ich schaue mir das sofort im Detail an. Könnten Sie mir kurz mitteilen, seit wann das Problem genau auftritt, damit wir es schnellstmöglich für Sie beheben können?';
  }
  if (lower.includes('hallo') || lower.includes('guten tag') || lower.includes('hi') || lower.includes('moin')) {
    return 'Hallo und herzlich willkommen! Wie kann ich Ihnen heute weiterhelfen?';
  }
  if (lower.includes('danke') || lower.includes('super') || lower.includes('perfekt')) {
    return 'Sehr gerne! Falls noch weitere Fragen auftauchen, melden Sie sich jederzeit bei mir.';
  }

  return 'Vielen Dank für Ihre Nachricht! Ich habe mir Ihr Anliegen gerade angesehen und kümmere mich direkt darum. Haben Sie dazu noch einen bestimmten Wunsch oder weitere Details für mich?';
}
