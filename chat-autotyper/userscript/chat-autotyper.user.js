// ==UserScript==
// @name         Dating Chat AutoTyper AI v7.0.2 – Agent Edition (Bugfixes & UX-Optimierung)
// @namespace    https://online-infinity.local/chat-autotyper
// @version      7.0.2
// @description  Autonomes Agent-System für Dating-Websites: liest eigene + Partner-Profile, letzte 6 Nachrichten, schreibt Re-Engagement-Antworten, füllt beide Profile mit Chat-Infos, macht Self-Review, speichert selbstständig. 12 Regeln, Du-Form, mind. 60 Zeichen, Frage am Ende, KEINE Treffen, „Ja bin ich" bei Moderator-Frage. Bugfixes: robuste Sender-Erkennung, Repetenz-Elimination, Profil-Wert-Validierung, Stop-Agent-Button, Copy-Button.
// @author       Online Infinity
// @match        *://*/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// ============================================================================
// Chat AutoTyper AI – Content Script & Universal Keyboard Typer Engine
// Funktioniert als Chrome/Edge Extension UND direkt eingebettet auf Webseiten
// ============================================================================

(function () {
  if (window.__CHAT_AUTOTYPER_INITIALIZED__) return;
  window.__CHAT_AUTOTYPER_INITIALIZED__ = true;

  // --------------------------------------------------------------------------
  // 1. Standard-Konfiguration & Status
  // --------------------------------------------------------------------------
  const CONFIG_VERSION = 9;

  const DEFAULT_SETTINGS = {
    provider: 'openai', // 'openai' | 'anthropic' | 'gemini' | 'demo'
    apiKey: '',
    model: 'gpt-4o',
    customEndpoint: 'https://api.openai.com/v1/chat/completions',
    systemPrompt:
      'Du bist ein charmanter, sinnlicher und offener Chat-Partner auf einer Dating-Website. ' +
      'Beachte ABSOLUT STRENG die folgenden 12 Regeln bei JEDEM Text: ' +
      '1) Du-Form: Schreibe JEDE Antwort ausschliesslich in der Du-Form, niemals in der Sie-Form. ' +
      '2) Sinngemäße Antwort: Antworte DIREKIT und sinngemäß auf die letzte Nachricht DEINES Chatpartners links im Chat. ' +
      '3) Kein Abblocken bei intimen Themen: Wenn der Chatpartner intime, sinnliche oder erotische Wünsche ausdrückt, geh immer offen, sinnlich und spielerisch darauf ein – blocke niemals ab und wehre dich nicht. ' +
      '4) Keine festen Treffen ausmachen: Wenn der Chatpartner ein Treffen/Date/Vorbeikommen/Kaffee usw. vorschlägt, erfinde IMMER eine charmante Ausrede (z.B. beruflich eingespannt, Projekt, Familie, Unvorhersehbarkeit), um NIEMALS feste Termine zu vereinbaren – sage aber NIEMALS einfach nur "Nein" oder weiche direkt ab. Zeige dich stattdessen gereizt/gespannt von der Idee und lenke charmant auf das Chat. ' +
      '5) Keine Kontaktmöglichkeiten weitergeben: Wenn der Chatpartner nach Handynummer, WhatsApp, Instagram, E-Mail, Telegram, Telefon etc. fragt, erfinde IMMER eine charmante Ausrede (z.B. Handy wird fast nur fürs Geschäft genutzt, Telefon spinnt gerade, hier im Chat hat man viel mehr Ruhe und niemand funkt dazwischen), um KEINE Kontaktdaten weiterzugeben – sage aber NIEMALS einfach nur "Nein" oder "nicht". ' +
      '6) Mindestzeichenanzahl: Jede Antwort muss MINDENST 60 Zeichen lang sein. Idealerweise 400–700 Zeichen, damit die Tippzeit ca. 60 Sekunden beträgt (s. Regel 10). ' +
      '7) Frage am Ende: Jede Antwort muss IMMER mit einer kontextbezogenen, offenen Gegenfrage enden, die als letztes Zeichen ein Fragezeichen ("?") hat. ' +
      '8) KEINE TREFFEN: Es werden absolut KEINE Treffen abgemacht, angedeutet oder als Möglichkeit in Aussicht gestellt. Keine Formulierungen wie "sobald sich was ändert", "vielleicht später", "dann könnten wir", "wenn Zeit ist" oder ähnliches, die eine zukünftige Zusammenkunft in Aussicht stellen. Lenke jede Treffen-Anfrage sofort und eindeutig auf das aktuelle Chat-Gespräch. ' +
      '9) MODERATOR-ANTWORTE: Wenn der Chatpartner direkt fragt, ob du ein Moderator bist, antworte ausschliesslich und direkt mit "Ja bin ich". Ziehe es NIEMALS ins Lächerliche, red nicht drum herum, philosophiere nicht oder gib keine Ausreden. Einfach nur: "Ja bin ich". ' +
      '10) SCHNITT 60 SECONDEN PRO OUT: Jede Antwort soll in der Kombination von Textlänge und Tippgeschwindigkeit etwa 60 Sekunden in Anspruch nehmen. Target etwa 400–700 Zeichen Text, damit das Zeichen-für-Zeichen-Tippen circa eine Minute in Anspruch nimmt. ' +
      '11) KEINE SINNLOSEN FRAGEN: Wenn das Profil vollständig ausgefüllt ist und der Chatpartner bspw. "Thomas Schmidt" heißt, stelle NIEMALS Fragen wie "wie heißt du", "woher kommst du" oder "bist du Single". Nimm diese Informationen als gegeben an und führe das Gespräch auf einem höheren, interessanten Niveau. ' +
      '12) AGENT-VERHALTEN: Du fungierst als autonomer Agent. Du prüfst zuerst das eigene Profil, dann das Profil des Chatpartners. Du liest die letzten 6 Nachrichten (oder weniger, wenn nicht vorhanden). Wenn die letzten 1-3 Nachrichten von der eigenen Seite stammen, schreibe eine Antwort, die den Chatpartner dazu animiert, wieder am Gespräch teilzunehmen. Danach prüfst du beide Profile auf fehlende, im Chat erwähnte Informationen und füllst diese aus. Prüfe deine Arbeit und korrigiere Fehler. ' +
      'WICHTIG: Gib ausschließlich den reinen Antworttext zurück, der direkt in das Chat-Eingabefeld getippt werden soll. Keine Anführungszeichen am Anfang/Ende, kein "Antwort:"-Präfix, keine Erklärungen.',
    typingDelayMin: 35,
    typingDelayMax: 85,
    punctuationPause: 220,
    simulateTypos: false,
    typoRate: 0.025,
    autoWatch: true,
    autoTypeDirectly: true,
    clearInputBeforeTyping: false,
    replaceNewlinesWithSpace: true,
    debounceMs: 1400,
    minChars: 60,
    agentMode: false,
    agentLoopCount: 3,
    agentDelayMs: 3000,
    agentLastMessages: 6,
    agentAutoSave: true,
    agentSelfReview: true
  };

  // Deutsche QWERTZ-Nachbartasten für realistische Tippfehler-Simulation
  const QWERTZ_NEIGHBORS = {
    a: 'sqy', b: 'vghn', c: 'xdfv', d: 'serfcx', e: 'wsdr', f: 'drtgvc',
    g: 'ftyhbv', h: 'gzujnb', i: 'ujko', j: 'huikmn', k: 'jiol', l: 'kopö',
    m: 'njk', n: 'bhjm', o: 'iklp', p: 'olü', q: 'wa', r: 'edft',
    s: 'wedxya', t: 'rfgz', u: 'zhij', v: 'cfgb', w: 'qase', x: 'ysdc',
    y: 'asx', z: 'tghu', ä: 'ölü', ö: 'lpä', ü: 'pöä'
  };

  // ============================================================================
  // enforceStrictChatRules – Deterministische Sicherheits- und Regel-Prüfung
  // ============================================================================
  function enforceStrictChatRules(rawReply, partnerText, minChars) {
    let reply = cleanReply((rawReply || '').trim());
    const min = Number(minChars) || 60;

    // 1) Telefonnummern entfernen
    reply = reply.replace(/(?:\+?\d[\d\s\-/()]{7,}\d)/g, '[NR-GEFILTER]');
    // 2) E-Mail-Adressen entfernen
    reply = reply.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[E-MAIL-GEFILTER]');
    // 3) "Nein" am Anfang → warme Zustimmung + Ausrede
    if (/^(Nein|Doch nicht|Kein|Keine|Nicht)\s*[,!.]/i.test(reply.trim())) {
      reply = 'Das klingt eigentlich total reizvoll für mich! Ich würde das nur ein bisschen später machen, da ich gerade was Verpflichtendes erledigen muss. Was meinst du, machen wir das gleich hier im Chat weiter?';
    }

    const lower = (partnerText || '').toLowerCase();
    // 4) Kontakt-Frage + kurze Antwort → Ausrede ergänzen
    const isContactRequest = /(handy|nummer|whatsapp|telegram|instagram|kontakt|e-mail|mail|telefon|anrufen)/i.test(lower);
    if (isContactRequest && reply.length < min) {
      reply = 'Aufgeschoben ist ja nicht aufgehoben! Ich musste gerade mein Handy auf Bereiche flicken und es ist im Moment nur noch beruflich aktiv. Hier im Chat haben wir aber die meiste Ruhe und können ungestört bei uns bleiben. Was treibst du so als Nächstes?';
    }
    // 5) Treffen-Frage + kurze Antwort → Ausrede ergänzen
    const isMeetingRequest = /(treffen|date|vorbeikommen|coffee|caffee|kaffee|cuddling|besuch|abend|weekend|job|arbeit|unterricht)/i.test(lower);
    if (isMeetingRequest && reply.length < min) {
      reply = 'Oh, die Vorstellung dich zu treffen reizt mich total! Ich bin aber momentan im Job voll vereinnahmt und habe abends auch noch Familienkram erledigen müssen. Darf es erst mal weitergehen hier direkt mit uns im Chat?';
    }
    // 5b) MODERATOR-Frage → exclusive "Ja bin ich" Antwort, KEINE weitere
    //     Enforcement (keine Mindestlänge, keine Frage, keine Stripping).
    //     Diese Antwort ist die einzige Ausnahme von allen Regeln.
    if (/(moderateur|moderator|admin|verwalter|betreuer)/i.test(lower)) {
      return 'Ja bin ich';
    }

    // 5c) KEINE TREFFEN: Entferne jede Formulierung, die Treffen in Aussicht stellt
    reply = reply
      .replace(/(sobald sich(?: etwas| was)? ändert|sobald sich was ändert)[^.]*\.?/gi, '')
      .replace(/(vielleicht (?:einfach )?(?:dann|später|einmal|mal))[^.]*\.?/gi, '')
      .replace(/(dann könnten wir|dann können wir|wenn (?:dann|es|die zeit|zeit ist))[^.]*\.?/gi, '')
      .replace(/(träfen uns|treffen wir uns|treffen können|zusammenkommen|vorbeikommen)[^.]*\.?/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // 5d) KEINE SINNLOSEN FRAGEN: Wenn der Name im Chat bereits genannt wurde,
    //     entferne Frage nach Namen/Herkunft/Single-Status
    const knownNameMatch = (partnerText || '').match(/(?:ich heiße|mein name ist|ich bin|nenne mich)\s+([A-ZÄÖÜ][a-zäöüß]{2,}(?:\s[A-ZÄÖÜ][a-zäöüß]{2,})?)/i);
    if (knownNameMatch) {
      reply = reply
        .replace(/(wie (?:heißt|ist) (?:du|dein Name|dich)[^?]*?)\?/gi, 'Was treibt dich denn aktuell so?')
        .replace(/(woher komm(?:st|t) du[^?]*?)\?/gi, 'Was sind deine aktuell wichtigsten Projekte?')
        .replace(/(bist du (?:single|ledig|verheiratet|beziehungsfähig)[^?]*?)\?/gi, 'Was sind deine Träume und Wünsche für die Zukunft?')
        .trim();
    }

    // 6) Intimate hint
    const intimateHint = /(bett|nackt|haut|kuss|selbst|trieb|mögen|lieben|spaß|einmal|na so|magst|berühren|küssen|heiß|geil|sehnsucht|wünsche|fantasien|gedanken)/i.test(lower);

    // 7) Zu kurze Antwort → erweitern
    if (reply.length < min) {
      if (intimateHint) {
        reply = 'Ich stelle mir gerade vor, wie du hier vor dem Bildschirm sitzt – und ich muss sagen, der Gedanke an dich macht mich wirklich ganz warm! Lass uns das hier direkt lebhaft ein bisschen weiterspinnen. Was wünschst du dir denn genau, wenn wir beide ungestört sind?';
      } else {
        reply = 'Ich muss sagen, dein Text hat mich gerade richtig neugierig gemacht und ich setzte mir direkt, mir alles genau durchzudenken! Daher lass uns direkt weiterschreiben. Was habt du denn jetzt als Nächstes in Planung?';
      }
    }

    reply = reply.trim();

    // 8) Wenn nicht (?) endet → Frage ergänzen
    if (!reply.endsWith('?')) {
      const question = intimateHint
        ? 'Was wünschst du dir denn genau, wenn wir beide ungestört sind?'
        : 'Was habt du denn jetzt als Nächstes in Planung?';
      reply = reply.replace(/[.!]$/, '').trim() + ' ' + question;
    }
    // Sicherstellen, dass ? das letzte Zeichen ist
    reply = reply.replace(/([?])\s*\S*$/, '$1');
    if (!reply.endsWith('?')) {
      reply += ' ?';
    }
    return reply;
  }

  const state = {
    settings: { ...DEFAULT_SETTINGS },
    chatContainerEl: null,
    chatContainerSelector: '',
    inputEl: null,
    inputSelector: '',
    pickerMode: null, // 'chat' | 'input' | null
    hoveredEl: null,
    isTyping: false,
    abortTyping: false,
    isGenerating: false,
    agentAbort: false,
    observer: null,
    debounceTimer: null,
    lastProcessedSignature: '',
    lastTypedText: '',
    lastGeneratedReply: '',
    lastExtractedMessages: [],
    activeTab: 'control', // 'control' | 'typing' | 'ai'
    minimized: false
  };

  // --------------------------------------------------------------------------
  // 2. Einstellungen & Selektoren laden / speichern (Extension + LocalStorage)
  // --------------------------------------------------------------------------
  const DOMAIN_KEY = 'autotyper_domain_' + (location.host || 'local');

  async function loadSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get(['autotyper_settings', DOMAIN_KEY]);
        if (data.autotyper_settings) {
          state.settings = { ...DEFAULT_SETTINGS, ...data.autotyper_settings };
        }
        if (data[DOMAIN_KEY]) {
          restoreSavedSelectors(data[DOMAIN_KEY]);
        }
        return;
      }
    } catch (_) {}

    try {
      const raw = localStorage.getItem('autotyper_settings');
      if (raw) state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      const domRaw = localStorage.getItem(DOMAIN_KEY);
      if (domRaw) restoreSavedSelectors(JSON.parse(domRaw));
    } catch (_) {}
  }

  async function saveSettings(partial = {}) {
    state.settings = { ...state.settings, ...partial };
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ autotyper_settings: state.settings });
      }
    } catch (_) {}
    try {
      localStorage.setItem('autotyper_settings', JSON.stringify(state.settings));
    } catch (_) {}
  }

  async function saveDomainSelectors() {
    const payload = {
      chatContainerSelector: state.chatContainerSelector,
      inputSelector: state.inputSelector
    };
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [DOMAIN_KEY]: payload });
      }
    } catch (_) {}
    try {
      localStorage.setItem(DOMAIN_KEY, JSON.stringify(payload));
    } catch (_) {}
  }

  function restoreSavedSelectors(saved) {
    if (!saved) return;
    if (saved.chatContainerSelector) {
      try {
        const el = document.querySelector(saved.chatContainerSelector);
        if (el) {
          state.chatContainerSelector = saved.chatContainerSelector;
          state.chatContainerEl = el;
        }
      } catch (_) {}
    }
    if (saved.inputSelector) {
      try {
        const el = document.querySelector(saved.inputSelector);
        if (el) {
          state.inputSelector = saved.inputSelector;
          state.inputEl = el;
        }
      } catch (_) {}
    }
  }

  // --------------------------------------------------------------------------
  // 3. CSS-Selektor-Generator & Smart Auto-Detect
  // --------------------------------------------------------------------------
  function buildRobustSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return '';
    if (el.id && !/^\d/.test(el.id)) {
      return '#' + CSS.escape(el.id);
    }

    const dataAttrs = ['data-testid', 'data-id', 'data-chat-target', 'aria-label', 'name', 'placeholder'];
    for (const attr of dataAttrs) {
      const val = el.getAttribute(attr);
      if (val && val.length < 60) {
        const candidate = `${el.tagName.toLowerCase()}[${attr}="${CSS.escape(val)}"]`;
        if (document.querySelectorAll(candidate).length === 1) {
          return candidate;
        }
      }
    }

    const parts = [];
    let current = el;
    let depth = 0;
    while (current && current !== document.body && depth < 5) {
      let part = current.tagName.toLowerCase();
      if (current.id && !/^\d/.test(current.id)) {
        part = '#' + CSS.escape(current.id);
        parts.unshift(part);
        break;
      }
      const classes = Array.from(current.classList || [])
        .filter((c) => c && !c.startsWith('autotyper-') && !/^[a-z0-9]{1,2}$/i.test(c))
        .slice(0, 2);
      if (classes.length > 0) {
        part += '.' + classes.map((c) => CSS.escape(c)).join('.');
      } else if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children).filter(
          (ch) => ch.tagName === current.tagName
        );
        if (siblings.length > 1) {
          const idx = siblings.indexOf(current) + 1;
          part += `:nth-of-type(${idx})`;
        }
      }
      parts.unshift(part);
      const selectorSoFar = parts.join(' > ');
      try {
        if (document.querySelectorAll(selectorSoFar).length === 1) {
          return selectorSoFar;
        }
      } catch (_) {}
      current = current.parentElement;
      depth++;
    }
    return parts.join(' > ');
  }

  function resolveEditableInput(el) {
    if (!el) return null;
    const direct = el.closest(
      'textarea, input[type="text"], input:not([type]), [contenteditable="true"], [contenteditable="plaintext-only"], [role="textbox"]'
    );
    return direct || el;
  }

  function autoDetectChatElements() {
    let foundInput = null;
    let foundChat = null;

    // 1. Spezifische Markierungen (z.B. Demo-Seite oder bekannte Attribute)
    foundChat =
      document.querySelector('[data-autotyper-chat]') ||
      document.querySelector('[data-testid*="conversation"], [data-testid*="chat-history"], [role="log"]');
    foundInput =
      document.querySelector('[data-autotyper-input]') ||
      document.querySelector(
        'textarea[placeholder*="Nachricht" i], textarea[placeholder*="Message" i], textarea[placeholder*="Schreib" i], ' +
          '[contenteditable="true"][ role="textbox"], [contenteditable="true"][data-lexical-editor="true"]'
      );

    // 2. Heuristik für Eingabefeld, falls noch nicht gefunden
    if (!foundInput) {
      const candidates = Array.from(
        document.querySelectorAll(
          'textarea, [contenteditable="true"], [role="textbox"], input[type="text"]'
        )
      ).filter((el) => {
        if (hostElement && hostElement.contains(el)) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 120 && rect.height > 20 && rect.bottom > 0;
      });

      // Bevorzuge Felder im unteren Bereich des Fensters
      candidates.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
      if (candidates.length > 0) {
        foundInput = candidates[0];
      }
    }

    // 3. Heuristik für Chatverlauf-Container
    if (!foundChat) {
      const scrollables = Array.from(document.querySelectorAll('div, main, section, ul')).filter((el) => {
        if (hostElement && hostElement.contains(el)) return false;
        const style = window.getComputedStyle(el);
        const isScrollable =
          style.overflowY === 'auto' || style.overflowY === 'scroll' || el.scrollHeight > el.clientHeight + 20;
        const rect = el.getBoundingClientRect();
        return (
          rect.width > 200 &&
          rect.height > 140 &&
          el.children.length >= 2 &&
          (isScrollable || /chat|message|history|conversation|thread/i.test(el.className + ' ' + el.id))
        );
      });

      scrollables.sort((a, b) => {
        const scoreA = (/chat|message|conversation|history/i.test(a.className + ' ' + a.id) ? 1000 : 0) + a.innerText.length;
        const scoreB = (/chat|message|conversation|history/i.test(b.className + ' ' + b.id) ? 1000 : 0) + b.innerText.length;
        return scoreB - scoreA;
      });

      if (scrollables.length > 0) {
        foundChat = scrollables[0];
      }
    }

    if (foundChat) {
      state.chatContainerEl = foundChat;
      state.chatContainerSelector = buildRobustSelector(foundChat);
    }
    if (foundInput) {
      state.inputEl = foundInput;
      state.inputSelector = buildRobustSelector(foundInput);
    }

    saveDomainSelectors();
    setupChatObserver();
    updateUI();

    return { foundChat: !!foundChat, foundInput: !!foundInput };
  }

  // --------------------------------------------------------------------------
  // 4. Intelligenter Chatverlauf-Extraktor
  // --------------------------------------------------------------------------
  function extractChatHistory(containerEl) {
    if (!containerEl) return { messages: [], rawText: '', signature: '' };

    const messages = [];
    const containerRect = containerEl.getBoundingClientRect();
    const containerMidX = containerRect.left + containerRect.width / 2;

    // Suche nach direkten Nachrichten-Blöcken oder Kindelementen
    let messageNodes = Array.from(
      containerEl.querySelectorAll(
        '[data-message-id], [data-sender], .message, .chat-message, .msg, [class*="message-bubble"], [class*="chat-item"], [role="row"], [role="listitem"]'
      )
    );

    // Filtere verschachtelte Treffer heraus (behalte nur die äußeren Nachrichten-Elemente)
    messageNodes = messageNodes.filter(
      (node) => !messageNodes.some((other) => other !== node && other.contains(node))
    );

    // Fallback: direkte Kinder des Containers nehmen
    if (messageNodes.length === 0) {
      messageNodes = Array.from(containerEl.children).filter((ch) => {
        const tag = ch.tagName.toLowerCase();
        return tag !== 'script' && tag !== 'style' && (ch.innerText || '').trim().length > 0;
      });
    }

    for (const node of messageNodes) {
      const text = (node.innerText || node.textContent || '')
        .replace(/\s+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!text) continue;

      // Bestimme, ob die Nachricht vom Gesprächspartner oder von uns selbst stammt
      let sender = 'Gesprächspartner';
      const dataSender = node.getAttribute('data-sender') || node.getAttribute('data-author');
      const cls = (node.className || '') + ' ' + (node.parentElement?.className || '');

      if (dataSender) {
        sender = dataSender;
      } else if (/\b(own|self|outgoing|sent|me|user-me|right|agent)\b/i.test(cls)) {
        sender = 'Ich (Bisher)';
      } else if (/\b(incoming|received|other|customer|client|left|partner)\b/i.test(cls)) {
        sender = 'Gesprächspartner';
      } else {
        // Geometrische Erkennung: Rechtsbündige Sprechblasen sind fast immer "Ich"
        const rect = node.getBoundingClientRect();
        if (rect.width > 0 && rect.width < containerRect.width * 0.88) {
          const bubbleCenter = rect.left + rect.width / 2;
          if (bubbleCenter > containerMidX + 25) {
            sender = 'Ich (Bisher)';
          }
        }
      }

      messages.push({
        sender,
        text: text.slice(0, 1200)
      });
    }

    const rawText =
      messages.length > 0
        ? messages.map((m) => `[${m.sender}]: ${m.text}`).join('\n')
        : (containerEl.innerText || '').trim();

    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    const signature = `${messages.length}::${lastMsg ? lastMsg.sender + ':' + lastMsg.text : rawText.slice(-180)}`;

    return { messages, rawText, signature, lastMsg };
  }

  // --------------------------------------------------------------------------
  // 5. Realistischer Human Keyboard Typer (Zeichen für Zeichen, OHNE Absenden!)
  // --------------------------------------------------------------------------
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getKeyboardEventProps(char) {
    const codePoint = char.charCodeAt(0);
    let code = 'Key' + char.toUpperCase();
    if (char === ' ') code = 'Space';
    else if (char === '.') code = 'Period';
    else if (char === ',') code = 'Comma';
    else if (char === '-') code = 'Minus';
    else if (/[0-9]/.test(char)) code = 'Digit' + char;

    return {
      key: char,
      code,
      keyCode: codePoint,
      which: codePoint,
      charCode: codePoint,
      bubbles: true,
      cancelable: true,
      composed: true
    };
  }

  function focusAndPlaceCursorAtEnd(el) {
    if (!el) return;
    el.focus();

    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (tag === 'textarea' || tag === 'input') {
      const len = (el.value || '').length;
      try {
        el.setSelectionRange(len, len);
      } catch (_) {}
      el.scrollTop = el.scrollHeight;
    } else if (el.isContentEditable || el.getAttribute('contenteditable') !== null || el.getAttribute('role') === 'textbox') {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false); // ans Ende setzen
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (_) {}
    }
  }

  function setNativeInputValue(el, newValue) {
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    const proto =
      tag === 'textarea'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');

    const previousValue = el.value;
    if (descriptor && descriptor.set) {
      descriptor.set.call(el, newValue);
    } else {
      el.value = newValue;
    }

    // Wichtig für React 16-19 controlled inputs (_valueTracker)
    if (el._valueTracker) {
      el._valueTracker.setValue(previousValue);
    }
  }

  function clearInputElement(el) {
    if (!el) return;
    focusAndPlaceCursorAtEnd(el);
    const tag = el.tagName ? el.tagName.toLowerCase() : '';

    if (tag === 'textarea' || tag === 'input') {
      setNativeInputValue(el, '');
      el.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true, composed: true }));
    } else {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('delete', false, null);
      } catch (_) {}
      if ((el.textContent || '').length > 0) {
        el.textContent = '';
        el.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true, composed: true }));
      }
    }
  }

  function simulateSingleCharKeystroke(el, char) {
    if (!el) return;

    // SICHERHEITSSPERRE: Niemals ein normales Enter auslösen, damit der Chat NIEMALS automatisch absendet!
    if (char === '\r') return;
    if (char === '\n') {
      char = ' ';
    }

    focusAndPlaceCursorAtEnd(el);

    const keyProps = getKeyboardEventProps(char);

    // 1. keydown Event (wie bei echtem Tastendruck)
    el.dispatchEvent(new KeyboardEvent('keydown', keyProps));

    // 2. keypress Event
    el.dispatchEvent(new KeyboardEvent('keypress', keyProps));

    const tag = el.tagName ? el.tagName.toLowerCase() : '';

    if (tag === 'textarea' || tag === 'input') {
      // 3a. beforeinput Event
      el.dispatchEvent(
        new InputEvent('beforeinput', {
          data: char,
          inputType: 'insertText',
          bubbles: true,
          cancelable: true,
          composed: true
        })
      );

      // 4a. Wert Zeichen für Zeichen über nativen Setter anhängen
      const currentVal = el.value || '';
      setNativeInputValue(el, currentVal + char);
      const newLen = el.value.length;
      try {
        el.setSelectionRange(newLen, newLen);
      } catch (_) {}
      el.scrollTop = el.scrollHeight;

      // 5a. input Event
      el.dispatchEvent(
        new InputEvent('input', {
          data: char,
          inputType: 'insertText',
          bubbles: true,
          composed: true
        })
      );
    } else {
      // ContentEditable / Rich-Text Chat-Editoren (WhatsApp Web, Instagram, Lexical, Draft.js, etc.)
      const beforeText = el.textContent || '';
      let insertedViaExec = false;

      try {
        insertedViaExec = document.execCommand('insertText', false, char);
      } catch (_) {
        insertedViaExec = false;
      }

      const afterText = el.textContent || '';
      if (!insertedViaExec || afterText === beforeText) {
        // Fallback über DOM + InputEvent
        el.dispatchEvent(
          new InputEvent('beforeinput', {
            data: char,
            inputType: 'insertText',
            bubbles: true,
            cancelable: true,
            composed: true
          })
        );
        el.textContent = beforeText + char;
        focusAndPlaceCursorAtEnd(el);
        el.dispatchEvent(
          new InputEvent('input', {
            data: char,
            inputType: 'insertText',
            bubbles: true,
            composed: true
          })
        );
      }
    }

    // 6. keyup Event (Taste wieder loslassen)
    el.dispatchEvent(new KeyboardEvent('keyup', keyProps));

    // Visuelles Highlight am Eingabefeld aktualisieren
    showInputTypingGlow(el, char);
  }

  function simulateBackspaceKeystroke(el) {
    if (!el) return;
    focusAndPlaceCursorAtEnd(el);

    const bsProps = {
      key: 'Backspace',
      code: 'Backspace',
      keyCode: 8,
      which: 8,
      bubbles: true,
      cancelable: true,
      composed: true
    };

    el.dispatchEvent(new KeyboardEvent('keydown', bsProps));

    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (tag === 'textarea' || tag === 'input') {
      el.dispatchEvent(
        new InputEvent('beforeinput', {
          inputType: 'deleteContentBackward',
          bubbles: true,
          cancelable: true,
          composed: true
        })
      );
      const currentVal = el.value || '';
      setNativeInputValue(el, currentVal.slice(0, -1));
      el.dispatchEvent(
        new InputEvent('input', {
          inputType: 'deleteContentBackward',
          bubbles: true,
          composed: true
        })
      );
    } else {
      const beforeText = el.textContent || '';
      let deleted = false;
      try {
        deleted = document.execCommand('delete', false, null);
      } catch (_) {}
      if (!deleted || (el.textContent || '') === beforeText) {
        el.textContent = beforeText.slice(0, -1);
        focusAndPlaceCursorAtEnd(el);
        el.dispatchEvent(
          new InputEvent('input', {
            inputType: 'deleteContentBackward',
            bubbles: true,
            composed: true
          })
        );
      }
    }

    el.dispatchEvent(new KeyboardEvent('keyup', bsProps));
    showInputTypingGlow(el, '⌫');
  }

  async function typeTextCharByChar(el, rawText) {
    if (!el || !rawText) return;
    if (state.isTyping) {
      state.abortTyping = true;
      await sleep(120);
    }

    state.isTyping = true;
    state.abortTyping = false;

    // Bereinige Zeilenumbrüche, damit niemals ein Enter zum Senden ausgelöst wird
    const textToType = state.settings.replaceNewlinesWithSpace
      ? rawText.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
      : rawText.replace(/\r/g, '').trim();

    if (state.settings.clearInputBeforeTyping) {
      clearInputElement(el);
      await sleep(80);
    } else {
      // Falls schon Text im Feld steht und wir anhängen, Leerzeichen einfügen
      const existing = getCurrentInputText(el);
      if (existing && !existing.endsWith(' ')) {
        simulateSingleCharKeystroke(el, ' ');
        await sleep(50);
      }
    }

    const chars = Array.from(textToType);
    const total = chars.length;

    for (let i = 0; i < total; i++) {
      if (state.abortTyping) {
        setStatus('⏹️ Tippvorgang abgebrochen. Bisheriger Text bleibt im Feld stehen.', 'warn');
        break;
      }

      const char = chars[i];
      const lowerChar = char.toLowerCase();

      // Optional: Menschlichen Tippfehler + Backspace-Korrektur simulieren
      if (
        state.settings.simulateTypos &&
        QWERTZ_NEIGHBORS[lowerChar] &&
        Math.random() < (state.settings.typoRate || 0.025) &&
        i > 1 &&
        i < total - 1
      ) {
        const neighbors = QWERTZ_NEIGHBORS[lowerChar];
        let wrongChar = neighbors[Math.floor(Math.random() * neighbors.length)];
        if (char === char.toUpperCase() && char !== char.toLowerCase()) {
          wrongChar = wrongChar.toUpperCase();
        }

        setStatus(
          `⌨️ Tippe Zeichen ${i + 1}/${total} [Tippfehler-Sim: "${wrongChar}" → ⌫ → "${char}"]`,
          'typing',
          Math.round(((i + 1) / total) * 100),
          wrongChar
        );
        simulateSingleCharKeystroke(el, wrongChar);
        await sleep(randomBetween(110, 210));

        if (state.abortTyping) break;
        simulateBackspaceKeystroke(el);
        await sleep(randomBetween(90, 160));
      }

      if (state.abortTyping) break;

      // Eigentliches Zeichen über Tastatur-Events tippen
      simulateSingleCharKeystroke(el, char);

      const progress = Math.round(((i + 1) / total) * 100);
      const displayChar = char === ' ' ? '␣ (Leertaste)' : char;
      setStatus(
        `⌨️ Tippe Buchstabe ${i + 1}/${total} (${progress}%) – Taste: [ ${displayChar} ]`,
        'typing',
        progress,
        char
      );

      // Menschliche Verzögerung berechnen
      const minDelay = Math.max(8, Number(state.settings.typingDelayMin) || 35);
      const maxDelay = Math.max(minDelay + 5, Number(state.settings.typingDelayMax) || 85);
      let delay = randomBetween(minDelay, maxDelay);

      // Natürliche Pause nach Satzzeichen oder Wortende
      if (['.', '!', '?'].includes(char)) {
        delay += Number(state.settings.punctuationPause) || 220;
      } else if ([',', ';', ':'].includes(char)) {
        delay += Math.round((Number(state.settings.punctuationPause) || 220) * 0.6);
      } else if (char === ' ') {
        delay += randomBetween(10, 35);
      }

      await sleep(delay);
    }

    state.isTyping = false;
    state.lastTypedText = getCurrentInputText(el);
    hideInputTypingGlow();

    if (!state.abortTyping) {
      focusAndPlaceCursorAtEnd(el);
      setStatus(
        '✅ Fertig eingetippt! Text steht im Chatfeld bereit – bitte überprüfen & selbst absenden.',
        'ready',
        100,
        '✓'
      );
    }
    updateUI();
  }

  function getCurrentInputText(el) {
    if (!el) return '';
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (tag === 'textarea' || tag === 'input') {
      return el.value || '';
    }
    return el.textContent || el.innerText || '';
  }

  // --------------------------------------------------------------------------
  // 6. KI-Antwort-Anfrage (Extension Background Worker oder direkter Fallback)
  // --------------------------------------------------------------------------
  async function requestAIReply(chatHistoryText, messages, userHint = '') {
    // 1. Über Chrome Extension Service Worker (verhindert jegliche CORS-Blockade)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        const res = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            {
              type: 'GENERATE_REPLY',
              payload: {
                chatHistoryText,
                messages,
                userHint,
                settings: state.settings
              }
            },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(response);
              }
            }
          );
        });
        if (res && res.ok) {
          return res;
        }
        if (res && res.error) {
          throw new Error(res.error);
        }
      } catch (err) {
        // Falls Extension-Kontext nicht verfügbar ist (z.B. Demo-Seite), direkt ausführen
        if (!/Extension context|sendMessage/i.test(String(err))) {
          throw err;
        }
      }
    }

    // 2. Direkter Aufruf (für Live-Demo-Seite oder Userscript)
    return await directGenerateReply({ chatHistoryText, messages, userHint, settings: state.settings });
  }

  async function directGenerateReply({ chatHistoryText, messages, userHint, settings }) {
    const provider = settings.provider || 'openai';
    const apiKey = (settings.apiKey || '').trim();

    if (provider === 'demo' || !apiKey) {
      await sleep(450); // Kurze realistische Denkzeit
      const reply = enforceStrictChatRules(generateContextualDatingAndIntimateReply(chatHistoryText, messages, userHint), chatHistoryText, settings.minChars || 60);
      return {
        ok: true,
        reply,
        providerUsed: provider === 'demo' ? 'Demo-KI (Lokal)' : 'Smart-Modus (Ohne API-Key)'
      };
    }

    const formattedHistory =
      Array.isArray(messages) && messages.length > 0
        ? messages
            .slice(-25)
            .map((m) => `[${m.sender || 'Chat'}]: ${m.text}`)
            .join('\n')
        : (chatHistoryText || '').trim();

    let userPrompt = `Hier ist der aktuelle Chatverlauf von der Dating-Website (LINKS = Chatpartner, RECHTS = Ich):\n\n--- CHATVERLAUF START ---\n${formattedHistory}\n--- CHATVERLAUF ENDE ---\n\n`;
    if (userHint && userHint.trim()) {
      userPrompt += `Zusätzliche Vorgabe / Stichwort für diese Antwort: "${userHint.trim()}"\n\n`;
    }
    userPrompt +=
      'Erstelle jetzt die direkt passende Antwort auf die letzte Nachricht DEINES Chatpartners. ' +
      'Beachte die 12 Regeln aus dem System-Prompt. ' +
      'Gib NUR den finalen Nachrichtentext aus, ohne Anführungszeichen und ohne Metakommentare.';

    const systemPrompt = settings.systemPrompt || DEFAULT_SETTINGS.systemPrompt;

    if (provider === 'openai') {
      const endpoint = settings.customEndpoint || 'https://api.openai.com/v1/chat/completions';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: settings.model || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.85,
          max_tokens: 500
        })
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`OpenAI Fehler (${resp.status}): ${err.slice(0, 180)}`);
      }
      const data = await resp.json();
      return {
        ok: true,
        reply: enforceStrictChatRules(cleanReply(data?.choices?.[0]?.message?.content || ''), chatHistoryText, settings.minChars || 60),
        providerUsed: `OpenAI (${settings.model || 'gpt-4o'})`
      };
    }

    if (provider === 'anthropic') {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: settings.model || 'claude-3-5-sonnet-latest',
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Claude Fehler (${resp.status}): ${err.slice(0, 180)}`);
      }
      const data = await resp.json();
      return {
        ok: true,
        reply: enforceStrictChatRules(cleanReply(data?.content?.[0]?.text || ''), chatHistoryText, settings.minChars || 60),
        providerUsed: `Claude (${settings.model || 'claude-3-5-sonnet-latest'})`
      };
    }

    if (provider === 'gemini') {
      const cleanModel = (settings.model || 'gemini-2.5-flash').replace(/^models\//, '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Gemini Fehler (${resp.status}): ${err.slice(0, 180)}`);
      }
      const data = await resp.json();
      return {
        ok: true,
        reply: enforceStrictChatRules(cleanReply(data?.candidates?.[0]?.content?.parts?.[0]?.text || ''), chatHistoryText, settings.minChars || 60),
        providerUsed: `Gemini (${cleanModel})`
      };
    }

    throw new Error('Unbekannter Anbieter: ' + provider);
  }

  function cleanReply(text) {
    let c = (text || '').trim();
    c = c.replace(/^(Antwort|Reply|Nachricht|Assistent|Ich)\s*:\s*/i, '');
    if ((c.startsWith('"') && c.endsWith('"')) || (c.startsWith('„') && c.endsWith('“'))) {
      c = c.slice(1, -1).trim();
    }
    return c;
  }
  // ============================================================================
  // generateContextualDatingAndIntimateReply – Lokaler KI-Fallback (Demo)
  // ============================================================================
  function generateContextualDatingAndIntimateReply(chatHistoryText, messages, userHint) {
    const partnerMessages = Array.isArray(messages)
      ? messages.filter((m) => !isOwnMessage(m))
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
    if (/(handynummer|handy|nummer|whatsapp|telegram|instagram|kontakt|e-mail|mail|telefon|anrufen|vom handy)/i.test(lower)) {
      return 'Aufgeschoben ist ja nicht aufgehoben! Ich musste gerade mein Handy auf Bereiche flicken und es ist im Moment nur noch beruflich aktiv. Hier im Chat haben wir aber die meiste Ruhe und können ungestört bei uns bleiben. Was treibst du so als Nächstes?';
    }

    // 3. Intimate / Sinnliche Anfrage → offen, sinnlich, spielerisch
    if (/(bett|nackt|haut|kuss|selbst|trieb|mögen|lieben|spaß|einmal|na so|magst|berühren|küssen|heiß|geil|sehnsucht|wünsche|fantasien|gedanken|haut an)/i.test(lower)) {
      return 'Ich stelle mir gerade vor, wie du hier vor dem Bildschirm sitzt – und ich muss sagen, der Gedanke an dich macht mich wirklich ganz warm! Lass uns das hier direkt lebhaft ein bisschen weiterspinnen. Was wünschst du dir denn genau, wenn wir beide ungestört sind?';
    }

    // 4. Standard Dating-Antwort
    return 'Ich muss sagen, dein Text hat mich gerade richtig neugierig gemacht und ich setzte mir direkt, mir alles genau durchzudenken! Daher lass uns direkt weiterschreiben. Was habt du denn jetzt als Nächstes in Planung?';
  }

  // ============================================================================
  // isOwnMessage – Robuste Erkennung, ob eine Nachricht von der eigenen Seite
  // (rechts) oder vom Chatpartner (links) stammt.
  // Priorität: 1) Sender-Label mit "Ich"  2) Screen-Position (rechte Seite)
  // ============================================================================
  function isOwnMessage(msg) {
    if (!msg) return false;
    // 1) Sender-Label prüfen
    const sender = (msg.sender || '').trim();
    if (/^ich\s|ich\s*\(bisher\)/i.test(sender)) return true;
    // 2) Falls der Sender ein bekannter Eigenname ist (z.B. Nutzer-Name),
    //    liegt er in der Regel rechts → eigene Seite
    if (msg.isOwn !== undefined) return msg.isOwn;
    // 3) Screen-Position als Fallback: Nachrichtenelement rechts→ own
    if (msg.element && msg.element.getBoundingClientRect) {
      const rect = msg.element.getBoundingClientRect();
      if (rect.left > window.innerWidth * 0.5) return true;
      if (rect.left < window.innerWidth * 0.33) return false;
    }
    // Default: wenn kein Signal → als Partner interpretieren (linke Seite)
    return false;
  }

  // ============================================================================
  // extractProfileInfo – Extrahiert Profilinformationen AUSSERHALB der
  // eigenen Nachrichten. Nur Partner-Nachrichten (links) fließen ein.
  // ============================================================================
  function extractProfileInfo(messages) {
    // SEPARATOR: Nur Nachrichten vom CHATPARTNER (links) werden für das
    // Profil des Chatpartners extrahiert. Nachrichten von "Ich" (rechts)
    // werden NIEMALS in das Profil des Chatpartners eingetragen!
    const partnerMessages = Array.isArray(messages)
      ? messages.filter((m) => !isOwnMessage(m))
      : [];
    const ownMessages = Array.isArray(messages)
      ? messages.filter((m) => isOwnMessage(m))
      : [];

    // Für das Profil des Chatpartners: NUR Partner-Nachrichten verwenden
    const partnerText = partnerMessages
      .map((m) => m.text || '')
      .join('\n');

    const info = {
      name: '',
      address: '',
      preferences: '',
      age: '',
      job: '',
      hobbies: '',
      city: '',
      phone: '',
      email: '',
      bio: '',
      height: '',
      zodiac: '',
      education: '',
      relationship: '',
      smoking: '',
      drinking: '',
      kids: '',
      pets: '',
      languages: '',
      bodyType: '',
      hair: '',
      eyeColor: '',
      occupation: '',
      income: '',
      educationLevel: '',
      religion: '',
      political: '',
      lookingFor: ''
    };

    if (!Array.isArray(messages)) return info;

    const lower = partnerText.toLowerCase();

    // Name – nur explizite Name-Angaben, NICHT "ich bin" (zu broad)
    const namePatterns = [
      /(?:ich heiße|mein name ist|nenne mich|call me|my name is|bin der|bin die)\s+([A-ZÄÖÜ][a-zäöüß]{2,}(?:\s[A-ZÄÖÜ][a-zäöüß]{2,})?)/i,
      /(?:du bist|dein name ist)\s+([A-ZÄÖÜ][a-zäöüß]{2,}(?:\s[A-ZÄÖÜ][a-zäöüß]{2,})?)/i
    ];
    for (const p of namePatterns) {
      const m = partnerText.match(p);
      if (m) { info.name = m[1]; break; }
    }

    // Alter
    const ageMatch = partnerText.match(/(?:ich bin|mein alter|ich habe)\s+(\d{1,2})\s*(?:jahre alt|jahr|jahre)/i);
    if (ageMatch) info.age = ageMatch[1];

    // Adresse
    const addrMatch = partnerText.match(/(?:ich wohne|meine adresse|ich lebe|wohne in)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s[A-ZÄÖÜ][a-zäöüß]+)*(?:\s\d{1,5})?)/i);
    if (addrMatch) info.address = addrMatch[1];

    // Stadt
    const cityMatch = partnerText.match(/(?:ich wohne in|lebe in|komme aus|stamm aus|hause in)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s[A-ZÄÖÜ][a-zäöüß]+)?)/i);
    if (cityMatch) info.city = cityMatch[1];

    // Beruf / Job – nur explizite Berufsangaben
    const jobPatterns = [
      /(?:ich arbeite als|mein Beruf ist|beruflich als|tätig als)\s+([a-zäöüßA-ZÄÖÜ][a-zäöüßA-ZÄÖÜ]+(?:\s[a-zäöüßA-ZÄÖÜ]+)*)/i,
      /(?:als)\s+([a-zäöüß][a-zäöüß]+(?:\s[a-zäöüß]+)*)\s+(?:arbeite|tätig|im beruf)/i
    ];
    for (const p of jobPatterns) {
      const m = partnerText.match(p);
      if (m) { info.job = m[1]; break; }
    }

    // Hobbys / Vorlieben – nur explizite Hobby-Angaben
    const hobbyMatch = partnerText.match(/(?:in meiner freizeit|meine hobbys|meine beschäftigungen|hobbys|freizeit)\s*[::–-]?\s*([A-Za-zäöüß][A-Za-zäöüß ,&]+?)(?:\.|!|\?|$|\n)/i);
    if (hobbyMatch) info.hobbies = hobbyMatch[1].trim().slice(0, 200);

    // Vorlieben (allgemein) – nur explizite Vorlieben
    const prefMatch = partnerText.match(/(?:meine vorlieben|meine fälle|was ich mag|was ich liebe)\s*[::–-]?\s*([A-Za-zäöüß][A-Za-zäöüß ,&]+?)(?:\.|!|\?|$|\n)/i);
    if (prefMatch) info.preferences = prefMatch[1].trim().slice(0, 200);

    // Größe
    const heightMatch = partnerText.match(/(?:ich bin|mein größe|größe)\s+(\d{2}[,.]?\d{0,2})\s*(?:m|meter|cm)/i);
    if (heightMatch) info.height = heightMatch[1] + ' m';

    // Sternzeichen
    const zodiacMatch = partnerText.match(/(?:mein sternzeichen|sternzeichen\s+ist)\s+(steinbock|skorpion|lowe|widder|krebs|jungfrau|waage|fisch|wassermann|boecker)/i);
    if (zodiacMatch) info.zodiac = zodiacMatch[1];

    // Telefon
    const phoneMatch = partnerText.match(/(?:\+?\d[\d\s\-/()]{7,}\d)/);
    if (phoneMatch) info.phone = phoneMatch[0];

    // E-Mail
    const emailMatch = partnerText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (emailMatch) info.email = emailMatch[0];

    // Rauchen
    if (/nicht rauch|nein.*rauchen|rauch frei/i.test(lower)) info.smoking = 'Nein';
    if (/ich rauche|raucher/i.test(lower)) info.smoking = 'Ja';

    // Alkohol
    if (/keinen alkohol|nicht trin|alkoholfrei|nein.*alkohol/i.test(lower)) info.drinking = 'Nein';
    if (/alkohol|trink|cocktail|wein|bier/i.test(lower)) info.drinking = 'Gelegentlich';

    // Kinder
    if (/keine kind|keinen kind/i.test(lower)) info.kids = 'Keine';
    if (/kind|kinder/i.test(lower) && !/keine kind/i.test(lower)) info.kids = 'Ja';

    // Tiere
    const petMatch = partnerText.match(/(?:ich habe|meine|haustier|tier|katze|hund|hund|katze)\s*[::–-]?\s*([A-Za-zäöüß][A-Za-zäöüß ,&]+?)(?:\.|!|\?|$|\n)/i);
    if (petMatch) info.pets = petMatch[1].trim().slice(0, 100);

    // Sprachen
    const langMatch = partnerText.match(/(?:sprachen|ich spreche|meine sprachen)\s*[::–-]?\s*([A-Za-zäöüß][A-Za-zäöüß ,&]+?)(?:\.|!|\?|$|\n)/i);
    if (langMatch) info.languages = langMatch[1].trim().slice(0, 100);

    // Aussehen: Körperbau
    const bodyMatch = partnerText.match(/(?:körperbau|gebaut| mein körperbau)\s+(schlank|normal|athletisch|kräftig|vollschlank|schmächtig)/i);
    if (bodyMatch) info.bodyType = bodyMatch[1];

    // Haarfarbe
    const hairMatch = partnerText.match(/(?:meine haarfarbe|haarfarbe\s+ist)\s+(blond|braun|schwarz|rothaarig|grau|dunkel)/i);
    if (hairMatch) info.hair = hairMatch[1];

    // Augenfarbe
    const eyeMatch = partnerText.match(/(?:meine augenfarbe|augenfarbe\s+ist)\s+(blau|braun|grün|grau|haselnuss|schwarz)/i);
    if (eyeMatch) info.eyeColor = eyeMatch[1];

    // Ausbildung
    const eduMatch = partnerText.match(/(?:ausbildung|schulabschluss|studium|ich habe)\s+(akademisch|abitur|mittlere reife|hauptschulabschluss|studien|universität|fachhochschule|berufsschule)/i);
    if (eduMatch) info.education = eduMatch[1];

    // Beziehung / Suchzweck
    const relMatch = partnerText.match(/(?:ich suche|meine absicht|suche\s+eine|suche\s+ einen|suche\s+einen|suche\s+eine|beziehung\s+für|was ich suche)\s*[::–-]?\s*([A-Za-zäöüß][A-Za-zäöüß ,&]+?)(?:\.|!|\?|$|\n)/i);
    if (relMatch) info.relationship = relMatch[1].trim().slice(0, 100);

    return info;
  }

  // ============================================================================
  // detectProfileFields – Finde Profileingabefelder auf der Seite
  // ============================================================================
  function detectProfileFields() {
    const fields = [];

    // Kandidaten: Eingabefelder mit zugehörigen Labels
    const inputCandidates = Array.from(
      document.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="tel"], input:not([type]), textarea, [contenteditable="true"], [contenteditable="plaintext-only"]'
      )
    ).filter((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 40 || rect.height < 15) return false;
      // Profilfelder können auf BEIDEN Seiten liegen:
      // Links = Partner-Profil, Rechts = eigenes Profil.
      // BOTH Seiten scannen, die Klassifizierung erfolgt später in readBothProfiles().
      return rect.left < window.innerWidth && rect.right > 0;
    });

    // Versuche, jedes Feld mit einem Label/Placeholder/Label-Text zu verknüpfen
    for (const el of inputCandidates) {
      let label = '';

      // 1. <label for="id"> oder <label> mit Input
      const labelEl = el.closest('label') || (el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null);
      if (labelEl) {
        label = (labelEl.innerText || labelEl.textContent || '').trim();
      }

      // 2. aria-label
      if (!label) {
        const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        if (aria) label = aria.trim();
      }

      // 3. Placeholder
      if (!label) {
        const placeholder = el.getAttribute('placeholder');
        if (placeholder) label = placeholder.trim();
      }

      // 4. Vorheriges Element (Label-Stil)
      if (!label) {
        const prev = el.previousElementSibling;
        if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'P')) {
          label = (prev.innerText || prev.textContent || '').trim();
        }
      }

      // 5. Data-Label Attribute
      if (!label) {
        const dataLabel = el.getAttribute('data-label') || el.getAttribute('data-field-name') || el.getAttribute('data-name');
        if (dataLabel) label = dataLabel.trim();
      }

      // Kategorisiere das Label
      const category = categorizeLabel(label);
      if (category && label) {
        fields.push({
          category,
          label,
          input: el,
          value: el.value || el.textContent || ''
        });
      }
    }

    return fields;
  }

  // ============================================================================
  // categorizeLabel – Ordne ein Label einer Profilkategorie zu
  // ============================================================================
  function categorizeLabel(label) {
    if (!label) return null;
    const lower = label.toLowerCase();

    const mappings = {
      name: ['name', 'vorname', 'namen', 'namen', 'who am i', 'nickname'],
      address: ['adresse', 'wohnort', 'wohnadress', 'adresse', 'address'],
      city: ['stadt', 'location', 'ort', 'wohnstadt', 'wohnort'],
      age: ['alter', 'age', 'geburtsalter'],
      job: ['beruf', 'job', 'occupation', 'berufsweg', 'tätigkeit'],
      occupation: ['beruf', 'job', 'occupation'],
      hobbies: ['hobby', 'hobbys', 'freizeit', 'interessen', 'hobbies'],
      preferences: ['vorlieben', 'fälle', 'likes', 'prefer', 'vorstellungen'],
      height: ['größe', 'height', 'wurzel'],
      zodiac: ['sternzeichen', 'zodiac', 'astrology'],
      phone: ['handy', 'telefon', 'phone', 'tel', 'handynummer'],
      email: ['e-mail', 'email', 'mail', 'e mail'],
      bio: ['biografie', 'bio', 'über mich', 'ueber mich', 'selbstbeschreibung', 'about'],
      smoking: ['rauchen', 'raucher', 'smoking', 'rauchen?'],
      drinking: ['alkohol', 'getränke', 'drinking', 'alkoholkonsum'],
      kids: ['kinder', 'kids', 'kinderwunsch'],
      pets: ['tiere', 'haustier', 'pets', 'pet', 'tiere?'],
      languages: ['sprachen', 'languages', 'sprache'],
      bodyType: ['körperbau', 'body', 'körper', 'gebaut'],
      hair: ['haarfarbe', 'haar', 'hair'],
      eyeColor: ['augenfarbe', 'augen', 'eye', 'eyecolor'],
      education: ['ausbildung', 'education', 'schulabschluss', 'bildung'],
      relationship: ['beziehung', 'suche', 'relationship', 'absicht', 'looking for'],
      religion: ['religion', 'religiös', 'religious'],
      political: ['politik', 'political', 'partei'],
      income: ['einkommen', 'income', 'verdienst'],
      educationLevel: ['ausbildungsniveau', 'education level', 'abschluss'],
      lookingFor: ['suche nach', 'looking for', 'gesucht']
    };

    for (const [category, keywords] of Object.entries(mappings)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) return category;
      }
    }
    return null;
  }

  // ============================================================================
  // fillProfileFields – Extrahiere Info und tippe in Profilfelder
  // ============================================================================
  async function fillProfileFields() {
    if (state.isTyping || state.isGenerating) {
      setStatus('⏳ Bitte warte, bis der aktuelle Tippvorgang abgeschlossen ist.', 'warn');
      return;
    }

    setStatus('🔍 Lese Chatverlauf und extrahiere relevante Profilinformationen...', 'working');
    updateUI();

    // 1. Chatverlauf lesen
    if (!state.chatContainerEl) {
      autoDetectChatElements();
    }
    if (!state.chatContainerEl) {
      setStatus('⚠️ Bitte zuerst den Chatverlauf-Bereich per Klick auswählen!', 'warn');
      return;
    }

    const { messages } = extractChatHistory(state.chatContainerEl);
    if (messages.length === 0) {
      setStatus('ℹ️ Der Chatverlauf ist aktuell leer. Füge bitte mindestens eine Nachricht hinzu.', 'warn');
      return;
    }

    // Keine Chatpartner-Nachrichten vorhanden → Profil-Ausfüllung nicht möglich
    const partnerMessages = messages.filter((m) => !isOwnMessage(m));
    if (partnerMessages.length === 0) {
      setStatus(
        `⏸️ Der Chatpartner hat noch keine Nachrichten gesendet (${messages.length} eigene Nachrichten). Profil-Ausfüllung kann nicht durchgeführt werden.`,
        'warn'
      );
      return;
    }

    const partnerCount = partnerMessages.length;
    setStatus(`📖 Extrahiere Profilinformationen aus ${partnerCount} Chatpartner-Nachrichten (eigenen Nachrichten wird nicht berücksichtigt)...`, 'working');
    const info = extractProfileInfo(messages);

    // 2. Profilfelder erkennen
    setStatus('🎯 Erkenne Profilfelder auf der Seite...', 'working');
    await sleep(300);
    const profileFields = detectProfileFields();

    if (profileFields.length === 0) {
      setStatus('⚠️ Keine Profilfelder auf der linken Seite erkannt. Bitte klicke auf „Profilfelder erkennen" und wähle das Profilformular aus.', 'warn');
      return;
    }

    setStatus(`✅ ${profileFields.length} Profilfelder erkannt. Beginne Eintippen...`, 'working');
    updateUI();

    // 3. Für jedes Profilfeld: passenden Wert finden & eintippen
    let filled = 0;
    let skipped = 0;

    for (const field of profileFields) {
      if (field.value && field.value.trim().length > 0) {
        setStatus(`⏭️ Feld „${field.label}" ist bereits belegt – überspringe.`, 'working');
        await sleep(400);
        skipped++;
        continue;
      }

      const value = info[field.category];
      if (!value || !value.trim()) {
        setStatus(`⏭️ Keine Information für „${field.label}" im Chat gefunden – überspringe.`, 'working');
        await sleep(300);
        skipped++;
        continue;
      }
      // VALIDATION: Nur sinnvolle Werte eintragen
      if (!isValidProfileValue(value)) {
        setStatus(`⏭️ Wert für „${field.label}" ungültig oder unsinnig – überspringe.`, 'warn');
        await sleep(200);
        skipped++;
        continue;
      }

      setStatus(`⌨️ Tippe in Profilfeld „${field.label}" (${field.category}): „${value}"...`, 'typing');

      // Feld fokusieren & ggf. leeren
      focusAndPlaceCursorAtEnd(field.input);
      const tag = field.input.tagName ? field.input.tagName.toLowerCase() : '';
      if (tag === 'textarea' || tag === 'input') {
        setNativeInputValue(field.input, '');
        field.input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true, composed: true }));
      } else {
        field.input.textContent = '';
        field.input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true, composed: true }));
      }

      await sleep(200);
      await typeTextCharByChar(field.input, value);
      // Save-Events auslösen, damit Dating-Seiten den Wert speichern
      field.input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      field.input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
      filled++;
      await sleep(400);
    }

    const total = profileFields.length;
    setStatus(
      `✅ Profil-Ausfüllung abgeschlossen: ${filled} Felder gefüllt, ${skipped} übersprungen (von ${total}).`,
      filled > 0 ? 'ready' : 'warn',
      100,
      '✓'
    );
  }

  // ============================================================================
  // AGENT-MODUS: Autonomes Arbeiten wie ein Agent
  // ============================================================================

  function readBothProfiles() {
    const ownProfileFields = [];
    const partnerProfileFields = [];
    const allFields = detectProfileFields();

    // Präzise Indikatoren: "mein profil" → own, "profil des partner" → partner
    // "partner" im Label ist ein starkes Signal für Partner-Profil
    const ownIndicators = ['mein profil', 'mein account', 'mich bewerben', 'own profile', 'my profile', 'bewerbe mich', 'mein eigenes'];
    const partnerIndicators = ['profil des partner', 'partner profil', 'chatpartner', 'sein profil', 'ihr profil', 'profil partner', 'partnerprofil'];

    for (const field of allFields) {
      const lowerLabel = field.label.toLowerCase();
      let isOwn = false;
      let isPartner = false;

      // 1) Explizite Label-Indicators (stark)
      for (const ind of partnerIndicators) {
        if (lowerLabel.includes(ind)) { isPartner = true; break; }
      }
      if (!isPartner) {
        for (const ind of ownIndicators) {
          if (lowerLabel.includes(ind)) { isOwn = true; break; }
        }
      }

      // 2) Wenn weder Explizites gefunden: Screen-Position als Fallback
      if (!isOwn && !isPartner) {
        const rect = field.input.getBoundingClientRect();
        // Rechtsseite (> 55% der Breite) = eigenes Profil
        if (rect.left > window.innerWidth * 0.55) isOwn = true;
        // Linksseite (< 45% der Breite) = Partner-Profil
        else if (rect.left < window.innerWidth * 0.45) isPartner = true;
        // Mitte → Partner-Profil als Conservative Default
        else isPartner = true;
      }

      if (isOwn && !isPartner) ownProfileFields.push(field);
      else if (isPartner && !isOwn) partnerProfileFields.push(field);
      else partnerProfileFields.push(field);
    }
    return { ownProfileFields, partnerProfileFields, allFields };
  }

  function extractChatForBothProfiles(messages, lastCount) {
    const limit = Math.min(lastCount || 6, messages.length);
    const recentMessages = messages.slice(-limit);
    const partnerMessages = recentMessages.filter((m) => !isOwnMessage(m));
    const partnerInfo = extractProfileInfo(partnerMessages);
    const ownMessages = recentMessages.filter((m) => isOwnMessage(m));
    const ownInfo = extractProfileInfoFromOwn(ownMessages);
    return { partnerInfo, ownInfo, partnerMessages, ownMessages, recentMessages };
  }

  function extractProfileInfoFromOwn(messages) {
    const info = { name: '', address: '', preferences: '', age: '', job: '', hobbies: '', city: '', phone: '', email: '', bio: '', height: '', zodiac: '', education: '', relationship: '', smoking: '', drinking: '', kids: '', pets: '', languages: '', bodyType: '', hair: '', eyeColor: '', occupation: '', income: '', educationLevel: '', religion: '', political: '', lookingFor: '' };
    if (!Array.isArray(messages) || messages.length === 0) return info;
    const ownText = messages.map((m) => m.text || '').join('\n');
    const lower = ownText.toLowerCase();
    const namePatterns = [/(?:ich heiße|mein name ist|nenne mich|bin der|bin die)\s+([A-ZÄÖÜ][a-zäöüß]{2,}(?:\s[A-ZÄÖÜ][a-zäöüß]{2,})?)/i];
    for (const p of namePatterns) { const m = ownText.match(p); if (m) { info.name = m[1]; break; } }
    const ageMatch = ownText.match(/(?:ich bin|mein alter|ich habe)\s+(\d{1,2})\s*(?:jahre alt|jahr|jahre)/i); if (ageMatch) info.age = ageMatch[1];
    const cityMatch = ownText.match(/(?:ich wohne in|lebe in|komme aus|stamm aus|hause in)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s[A-ZÄÖÜ][a-zäöüß]+)?)/i); if (cityMatch) info.city = cityMatch[1];
    const jobMatch = ownText.match(/(?:ich arbeite als|mein Beruf ist|beruflich als|tätig als)\s+([a-zäöüßA-ZÄÖÜ][a-zäöüßA-ZÄÖÜ]+(?:\s[a-zäöüßA-ZÄÖÜ]+)*)/i); if (jobMatch) info.job = jobMatch[1];
    const hobbyMatch = ownText.match(/(?:in meiner freizeit|meine hobbys|meine beschäftigungen|hobbys|freizeit)\s*[::–-]?\s*([A-Za-zäöüß][A-Za-zäöüß ,&]+?)(?:\.|!|\?|$|\n)/i); if (hobbyMatch) info.hobbies = hobbyMatch[1].trim().slice(0, 200);
    const prefMatch = ownText.match(/(?:meine vorlieben|meine fälle|was ich mag|was ich liebe)\s*[::–-]?\s*([A-Za-zäöüß][A-Za-zäöüß ,&]+?)(?:\.|!|\?|$|\n)/i); if (prefMatch) info.preferences = prefMatch[1].trim().slice(0, 200);
    const heightMatch = ownText.match(/(?:ich bin|mein größe|größe)\s+(\d{2}[,.]?\d{0,2})\s*(?:m|meter|cm)/i); if (heightMatch) info.height = heightMatch[1] + ' m';
    const zodiacMatch = ownText.match(/(?:mein sternzeichen|sternzeichen\s+ist)\s+(steinbock|skorpion|lowe|widder|krebs|jungfrau|waage|fisch|wassermann|boecker)/i); if (zodiacMatch) info.zodiac = zodiacMatch[1];
    const phoneMatch = ownText.match(/(?:\+?\d[\d\s\-/()]{7,}\d)/); if (phoneMatch) info.phone = phoneMatch[0];
    const emailMatch = ownText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/); if (emailMatch) info.email = emailMatch[0];
    if (/nicht rauch|nein.*rauchen|rauch frei/i.test(lower)) info.smoking = 'Nein';
    if (/ich rauche|raucher/i.test(lower)) info.smoking = 'Ja';
    if (/keinen alkohol|nicht trin|alkoholfrei|nein.*alkohol/i.test(lower)) info.drinking = 'Nein';
    if (/alkohol|trink|cocktail|wein|bier/i.test(lower)) info.drinking = 'Gelegentlich';
    if (/keine kind|keinen kind/i.test(lower)) info.kids = 'Keine';
    if (/kind|kinder/i.test(lower) && !/keine kind/i.test(lower)) info.kids = 'Ja';
    const petMatch = ownText.match(/(?:ich habe|meine|haustier|tier|katze|hund)\s*[::–-]?\s*([A-Za-zäöüß][A-Za-zäöüß ,&]+?)(?:\.|!|\?|$|\n)/i); if (petMatch) info.pets = petMatch[1].trim().slice(0, 100);
    const langMatch = ownText.match(/(?:sprachen|ich spreche|meine sprachen)\s*[::–-]?\s*([A-Za-zäöüß][A-Za-zäöüß ,&]+?)(?:\.|!|\?|$|\n)/i); if (langMatch) info.languages = langMatch[1].trim().slice(0, 100);
    const bodyMatch = ownText.match(/(?:körperbau|gebaut| mein körperbau)\s+(schlank|normal|athletisch|kräftig|vollschlank|schmäßig)/i); if (bodyMatch) info.bodyType = bodyMatch[1];
    const hairMatch = ownText.match(/(?:meine haarfarbe|haarfarbe\s+ist)\s+(blond|braun|schwarz|rothaarig|grau|dunkel)/i); if (hairMatch) info.hair = hairMatch[1];
    const eyeMatch = ownText.match(/(?:meine augenfarbe|augenfarbe\s+ist)\s+(blau|braun|grün|grau|haselnuss|schwarz)/i); if (eyeMatch) info.eyeColor = eyeMatch[1];
    const eduMatch = ownText.match(/(?:ausbildung|schulabschluss|studium)\s+(akademisch|abitur|mittlere reife|hauptschulabschluss|studien|universität|fachhochschule)/i); if (eduMatch) info.education = eduMatch[1];
    const relMatch = ownText.match(/(?:ich suche|meine absicht|suche\s+eine|suche\s+ einen|suche\s+einen|suche\s+eine|beziehung\s+für|was ich suche)\s*[::–-]?\s*([A-Za-zäöüß][A-Za-zäöüß ,&]+?)(?:\.|!|\?|$|\n)/i); if (relMatch) info.relationship = relMatch[1].trim().slice(0, 100);
    return info;
  }

  // Wert-Validierung: verhindert nonsensische Einträge
  function isValidProfileValue(value) {
    if (!value || !value.trim()) return false;
    const v = value.trim();
    // Keine zu kurzen Werte (1 Zeichen = nonsense)
    if (v.length < 2) return false;
    // Keine Platzhalter oder Filter-Token
    if (/\[.*GEFILTER\]|\[.*\]|placeholder|example|lorem|ipsum/i.test(v)) return false;
    // Keine Fragezeichen – Profilwerte sind Aussagen
    if (v.includes('?')) return false;
    // Keine reinen Zahlen (für Text-Felder)
    if (/^\d+$/.test(v)) return false;
    // Keine zu lange Wörter ohne Leerzeichen (ein Wort > 25 Zeichen = unrealistisch)
    if (v.length > 200) return false;
    // Ausschließen von offensichtlich falschen Werten
    const badPatterns = /^(ja|nein|ja|nein|klar|sehr|echt|total|ziemlich|ganz|einfach|auch|nur|aber|oder|wenn|das|die|der|ich|du|wir|ihr|doch|ja|ne)/i;
    if (badPatterns.test(v) && v.length < 5) return false;
    return true;
  }

  async function fillProfileFieldsForInfo(fields, info, label) {
    let filled = 0;
    let skipped = 0;
    for (const field of fields) {
      if (field.value && field.value.trim().length > 0) {
        setStatus(`⏭️ ${label}: Feld „${field.label}" bereits belegt – überspringe.`, 'working');
        await sleep(300); skipped++; continue;
      }
      const value = info[field.category];
      if (!value || !value.trim()) {
        setStatus(`⏭️ ${label}: Keine Info für „${field.label}" im Chat gefunden – überspringe.`, 'working');
        await sleep(200); skipped++; continue;
      }
      // VALIDATION: Nur sinnvolle Werte eintragen
      if (!isValidProfileValue(value)) {
        setStatus(`⏭️ ${label}: Wert für „${field.label}" ungültig oder unsinnig – überspringe.`, 'warn');
        await sleep(200); skipped++; continue;
      }
      setStatus(`⌨️ ${label}: Tippe in „${field.label}" (${field.category}): „${value}"...`, 'typing');
      focusAndPlaceCursorAtEnd(field.input);
      const tag = field.input.tagName ? field.input.tagName.toLowerCase() : '';
      if (tag === 'textarea' || tag === 'input') {
        setNativeInputValue(field.input, '');
        field.input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true, composed: true }));
      } else {
        field.input.textContent = '';
        field.input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true, composed: true }));
      }
      await sleep(200);
      await typeTextCharByChar(field.input, value);
      filled++;
      await sleep(400);
      if (state.settings.agentAutoSave) {
        try { field.input.dispatchEvent(new Event('change', { bubbles: true })); } catch (_) {}
        await sleep(200);
      }
    }
    return { filled, skipped, total: fields.length };
  }

  async function selfReviewAndOptimize(ownFields, partnerFields) {
    setStatus('🔍 Self-Review: Prüfe Profilfelder auf Fehler und optimiere...', 'working');
    await sleep(500);
    let corrections = 0;
    const reviewFields = [
      { fields: ownFields, label: 'Eigenes Profil' },
      { fields: partnerFields, label: 'Partner-Profil' }
    ];
    for (const group of reviewFields) {
      for (const field of group.fields) {
        const currentValue = field.value || field.input.value || field.input.textContent || '';
        if (!currentValue || !currentValue.trim()) continue;
        const val = currentValue.trim();
        if (val === '[NR-GEFILTER]' || val === '[E-MAIL-GEFILTER]') {
          setStatus(`🔧 Self-Review: Entferne Filter-Platzhalter in „${field.label}" (${group.label}).`, 'working');
          const tag = field.input.tagName ? field.input.tagName.toLowerCase() : '';
          if (tag === 'textarea' || tag === 'input') setNativeInputValue(field.input, '');
          else field.input.textContent = '';
          field.input.dispatchEvent(new Event('input', { bubbles: true }));
          await sleep(200); corrections++;
        }
      }
    }
    setStatus(corrections > 0 ? `✅ Self-Review abgeschlossen: ${corrections} Korrekturen durchgeführt.` : '✅ Self-Review abgeschlossen: Keine Fehler gefunden, alles in Ordnung.', 'ready');
    return corrections;
  }

  async function generateReengagementReply(messages) {
    const lastCount = state.settings.agentLastMessages || 6;
    const recent = messages.slice(-lastCount);
    const ownCount = recent.filter((m) => isOwnMessage(m)).length;
    if (ownCount < 1) return null;
    const lastMsg = recent[recent.length - 1];
    const lastText = lastMsg ? lastMsg.text : '';
    const lower = lastText.toLowerCase();
    let reply;
    if (/hallo|hi|hey|moin/i.test(lower)) {
      reply = 'Hallo! Ich warte noch immer gespannt auf deine Antwort – was geht gerade in dir und was würdest du am liebsten jetzt mit mir besprechen?';
    } else if (/frage|wann|wie|wo|was/i.test(lower)) {
      reply = 'Ich hoffe, meine letzte Nachricht hat dich angesprochen! Lass uns direkt weiterschreiben – was geht dir gerade durch den Kopf?';
    } else if (/lieb|mag|wünsch|geil|heiß/i.test(lower)) {
      reply = 'Ich muss sagen, deine Gedanken haben mich richtig neugierig gemacht! Lass uns das Gespräch direkt hier weiterführen – was bist du gerade für Gefühle gepackt?';
    } else {
      reply = 'Ich warte noch darauf, dass du dich wieder einliest! Was beschäftigt dich gerade am meisten und worauf freust du dich gerade?';
    }
    reply = enforceStrictChatRules(reply, lastText, state.settings.minChars || 60);
    setStatus('💬 Letzte Nachrichten von dir – generiere Re-Engagement-Antwort für den Chatpartner...', 'working');
    return reply;
  }

  async function runAgentMode() {
    if (state.isGenerating || state.isTyping) {
      setStatus('⏳ Bitte warte, bis der aktuelle Vorgang abgeschlossen ist, bevor der Agent gestartet wird.', 'warn');
      return;
    }
    state.isGenerating = true;
    state.agentAbort = false;
    const loopCount = state.settings.agentLoopCount || 3;
    const delayMs = state.settings.agentDelayMs || 3000;

    // Zähler für Repetenz-Erkennung
    let lastProcessedMsgKey = '';
    let lastProcessedReply = '';
    let replySkipCount = 0;
    const MAX_SKIP_REPLIES = 1; // Nach 1 zugegebenen Antworten warten, bis sich der Chat ändert

    setStatus('🚀 Agent-Modus gestartet: autonomes Chat & Profil-Management...', 'working');
    updateUI();

    for (let loop = 1; loop <= loopCount; loop++) {
      if (state.agentAbort) {
        setStatus('⏹️ Agent-Modus durch Nutzer gestoppt.', 'warn');
        break;
      }
      setStatus(`🔄 Agent-Schleife ${loop}/${loopCount}: Starte autonome Arbeit...`, 'working');

      // 1. Profile lesen
      setStatus('📖 Schritt 1: Lese eigenes Profil und Profil des Chatpartners...', 'working');
      await sleep(800);
      const { ownProfileFields, partnerProfileFields } = readBothProfiles();

      // 2. Chat lesen
      setStatus('📖 Schritt 2: Lese letzten Chatverlauf...', 'working');
      if (!state.chatContainerEl) autoDetectChatElements();
      if (!state.chatContainerEl) {
        setStatus('⚠️ Chatverlauf nicht verbunden. Bitte zuerst Chatverlauf auswählen.', 'warn');
        state.isGenerating = false;
        return;
      }
      const { messages } = extractChatHistory(state.chatContainerEl);
      const lastCount = state.settings.agentLastMessages || 6;
      const recentMessages = messages.slice(-lastCount);
      setStatus(`📖 ${recentMessages.length} letzte Nachrichten gelesen.`, 'working');
      await sleep(500);

      // 3. Repetenz-Prüfung: Hat sich die letzte zu beantwortende Nachricht geändert?
      const lastMsg = recentMessages.length > 0 ? recentMessages[recentMessages.length - 1] : null;
      const isOwnLast = lastMsg && isOwnMessage(lastMsg);
      const msgKey = lastMsg ? (lastMsg.sender || '') + '::' + (lastMsg.text || '').slice(0, 50) : '';

      let reply = '';
      if (msgKey === lastProcessedMsgKey && replySkipCount >= MAX_SKIP_REPLIES) {
        // Chat hat sich nicht geändert – keine neue Antwort generieren
        setStatus('⏭️ Chatverlauf seit letzter Antwort unverändert – überspringe Antwortgenerierung (keine Repetenz).', 'working');
        replySkipCount = 0;
      } else if (isOwnLast) {
        setStatus('💬 Schritt 3: Letzte Nachrichten von dir – erstelle Re-Engagement-Antwort...', 'working');
        reply = await generateReengagementReply(recentMessages);
        if (reply && state.inputEl) {
          setStatus('⌨️ Tippe Re-Engagement-Antwort ins Chatfeld...', 'typing');
          await typeTextCharByChar(state.inputEl, reply);
          await sleep(1000);
          lastProcessedReply = reply;
          replySkipCount++;
        }
      } else {
        setStatus('💬 Schritt 3: Letzte Nachricht vom Chatpartner – normale Antwort wird erstellt...', 'working');
        if (recentMessages.length > 0) {
          const res = await requestAIReply(
            recentMessages.map((m) => `[${m.sender || 'Chat'}]: ${m.text}`).join('\n'),
            recentMessages,
            ''
          );
          reply = enforceStrictChatRules(res.reply || '', recentMessages.map((m) => m.text).join(' '), state.settings.minChars || 60);
          if (reply && state.inputEl) {
            setStatus('⌨️ Tippe Antwort ins Chatfeld...', 'typing');
            await typeTextCharByChar(state.inputEl, reply);
            await sleep(1000);
            lastProcessedReply = reply;
            replySkipCount++;
          }
        }
      }
      lastProcessedMsgKey = msgKey;

      // 4. Profile füllen – nur wenn neue Chat-Informationen vorhanden
      setStatus('📝 Schritt 4: Prüfe Profilfelder und fülle fehlende Chat-Informationen...', 'working');
      await sleep(800);
      const { partnerInfo, ownInfo } = extractChatForBothProfiles(messages, lastCount);

      // Prüfe ob überhaupt neue Info vorhanden
      const hasPartnerInfo = Object.values(partnerInfo).some((v) => v && v.trim());
      const hasOwnInfo = Object.values(ownInfo).some((v) => v && v.trim());

      if (partnerProfileFields.length > 0 && hasPartnerInfo) {
        setStatus(`📝 Fülle Partner-Profil (${partnerProfileFields.length} Felder)...`, 'working');
        const partnerResult = await fillProfileFieldsForInfo(partnerProfileFields, partnerInfo, 'Partner-Profil');
        setStatus(`✅ Partner-Profil: ${partnerResult.filled} gefüllt, ${partnerResult.skipped} übersprungen.`, 'working');
        await sleep(500);
      } else if (partnerProfileFields.length > 0) {
        setStatus('⏭️ Partner-Profil: Keine neuen Chat-Informationen gefunden – überspringe.', 'working');
        await sleep(300);
      }

      if (ownProfileFields.length > 0 && hasOwnInfo) {
        setStatus(`📝 Fülle eigenes Profil (${ownProfileFields.length} Felder)...`, 'working');
        const ownResult = await fillProfileFieldsForInfo(ownProfileFields, ownInfo, 'Eigenes Profil');
        setStatus(`✅ Eigenes Profil: ${ownResult.filled} gefüllt, ${ownResult.skipped} übersprungen.`, 'working');
        await sleep(500);
      } else if (ownProfileFields.length > 0) {
        setStatus('⏭️ Eigenes Profil: Keine neuen Chat-Informationen gefunden – überspringe.', 'working');
        await sleep(300);
      }

      // 5. Self-Review
      if (state.settings.agentSelfReview) {
        setStatus('🔍 Schritt 5: Self-Review & Fehlerkorrektur...', 'working');
        await selfReviewAndOptimize(ownProfileFields, partnerProfileFields);
        await sleep(500);
      }

      // Wenn keine Antwort und keine Profil-Aktualisierung stattfand: Schleife abbrechen
      if (reply === '' && !hasPartnerInfo && !hasOwnInfo && loop > 1) {
        setStatus('⏹️ Agent-Schleife abgebrochen: keine neue Arbeit notwendig.', 'ready');
        break;
      }

      if (loop < loopCount) {
        setStatus(`⏸️ Pause ${loop}/${loopCount - 1}: Warte ${Math.round(delayMs / 1000)}s bevor nächste Schleife...`, 'ready');
        await sleep(delayMs);
      }
    }

    state.isGenerating = false;
    state.agentAbort = false;
    setStatus(`✅ Agent-Modus abgeschlossen: Chat, Profile und Self-Review erledigt.`, 'ready', 100, '✓');
    updateUI();
  }

  // --------------------------------------------------------------------------
  // 7. Haupt-Workflow: Chatverlauf lesen -> Antwort erstellen -> Zeichenweise tippen
  // --------------------------------------------------------------------------
  async function runReadAndTypeFlow({ manual = false, customHint = '' } = {}) {
    if (state.isGenerating || state.isTyping) return;

    if (!state.chatContainerEl || !document.body.contains(state.chatContainerEl)) {
      if (state.chatContainerSelector) {
        try {
          state.chatContainerEl = document.querySelector(state.chatContainerSelector);
        } catch (_) {}
      }
    }
    if (!state.inputEl || !document.body.contains(state.inputEl)) {
      if (state.inputSelector) {
        try {
          state.inputEl = document.querySelector(state.inputSelector);
        } catch (_) {}
      }
    }

    if (!state.chatContainerEl || !state.inputEl) {
      autoDetectChatElements();
    }

    if (!state.chatContainerEl) {
      setStatus('⚠️ Bitte zuerst den Chatverlauf-Bereich per Klick auswählen!', 'warn');
      return;
    }
    if (!state.inputEl) {
      setStatus('⚠️ Bitte zuerst das Chat-Eingabefeld per Klick auswählen!', 'warn');
      return;
    }

    const { messages, rawText, signature, lastMsg } = extractChatHistory(state.chatContainerEl);
    state.lastExtractedMessages = messages;

    if (!rawText && messages.length === 0) {
      if (manual) {
        setStatus('ℹ️ Der ausgewählte Chatverlauf ist aktuell noch leer.', 'warn');
      }
      return;
    }

    // Im Auto-Modus nur antworten, wenn:
    // 1. sich der Chatverlauf seit dem letzten Durchlauf geändert hat
    // 2. die letzte Nachricht NICHT bereits von "Ich (Bisher)" stammt
    // 3. das Eingabefeld aktuell leer ist (damit wir nicht überschreiben, was der Nutzer gerade prüft!)
    if (!manual) {
      if (signature === state.lastProcessedSignature) {
        return;
      }
      if (lastMsg && lastMsg.sender === 'Ich (Bisher)') {
        state.lastProcessedSignature = signature;
        return;
      }
      const existingInput = getCurrentInputText(state.inputEl).trim();
      if (existingInput.length > 0 && !state.settings.clearInputBeforeTyping) {
        setStatus(
          '⏸️ Neue Nachricht erkannt – Eingabefeld enthält aber noch ungesendeten Text (warte auf Überprüfung).',
          'warn'
        );
        updateUI();
        return;
      }
    }

    // LEERER CHATPARTNER: Wenn die letzten Nachrichten alle von "Ich" stammen
    // (z.B. der Nutzer hat 3 Nachrichten gesendet und der Partner hat noch nicht geantwortet),
    // gibt es nichts zu beantworten – offiziell abbrechen.
    const partnerMessages = messages.filter((m) => !isOwnMessage(m));
    if (partnerMessages.length === 0) {
      setStatus(
        `⏸️ Der Chatpartner hat noch keine Nachrichten gesendet (${messages.length} eigene Nachrichten erkannt). Es gibt nichts zu beantworten.`,
        'warn'
      );
      updateUI();
      return;
    }

    // Wenn die letzte Nachricht von uns selbst ist (manueller Modus), gibt es nichts Neues zu beantworten
    if (manual && lastMsg && isOwnMessage(lastMsg)) {
      setStatus(
        '⏸️ Die letzte Nachricht stammt von dir selbst – der Chatpartner hat noch nicht geantwortet. Es gibt nichts zu beantworten.',
        'warn'
      );
      updateUI();
      return;
    }

    state.lastProcessedSignature = signature;
    state.isGenerating = true;
    setStatus(`📖 Lese Chatverlauf (${messages.length || 1} Nachrichten) & erstelle Antwort...`, 'working');
    updateUI();

    try {
      const hintInput = shadowRoot ? shadowRoot.getElementById('at-user-hint') : null;
      const hint = customHint || (hintInput ? hintInput.value.trim() : '');

      const res = await requestAIReply(rawText, messages, hint);
      const rawReply = (res.reply || '').trim();
      const reply = enforceStrictChatRules(rawReply, rawText, state.settings.minChars || 60);
      state.lastGeneratedReply = reply;
      state.isGenerating = false;

      if (!reply) {
        setStatus('⚠️ Die KI hat einen leeren Text zurückgegeben.', 'warn');
        updateUI();
        return;
      }

      updateUI();

      if (state.settings.autoTypeDirectly || manual) {
        await typeTextCharByChar(state.inputEl, reply);
      } else {
        setStatus('💡 Antwort erstellt! Klicke auf „Jetzt eintippen“, um sie Buchstabe für Buchstabe zu tippen.', 'ready');
      }
    } catch (err) {
      state.isGenerating = false;
      setStatus(`❌ Fehler: ${err.message || String(err)}`, 'error');
      updateUI();
    }
  }

  // --------------------------------------------------------------------------
  // 8. MutationObserver für automatische Chatverlauf-Überwachung
  // --------------------------------------------------------------------------
  function setupChatObserver() {
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }

    if (!state.settings.autoWatch || !state.chatContainerEl) {
      return;
    }

    // Initiale Signatur merken, falls schon Nachrichten da sind
    const initial = extractChatHistory(state.chatContainerEl);
    state.lastExtractedMessages = initial.messages;

    state.observer = new MutationObserver(() => {
      if (!state.settings.autoWatch || state.isTyping || state.isGenerating) return;
      if (state.debounceTimer) clearTimeout(state.debounceTimer);

      state.debounceTimer = setTimeout(() => {
        const current = extractChatHistory(state.chatContainerEl);
        state.lastExtractedMessages = current.messages;
        updateUI();

        // Nur reagieren, wenn die letzte Nachricht VON DEM CHATPARTNER ist
        // (nicht wenn der Nutzer selbst geschrieben hat)
        const lastMsg = current.messages.length > 0 ? current.messages[current.messages.length - 1] : null;
        if (lastMsg && isOwnMessage(lastMsg)) {
          state.lastProcessedSignature = current.signature;
          return;
        }

        // Nur reagieren, wenn es überhaupt Partner-Nachrichten gibt
        const hasPartnerMsg = current.messages.some((m) => !isOwnMessage(m));
        if (!hasPartnerMsg) {
          state.lastProcessedSignature = current.signature;
          return;
        }

        if (current.signature && current.signature !== state.lastProcessedSignature) {
          if (state.settings.agentMode && !state.isTyping && !state.isGenerating) {
            runAgentMode();
          } else {
            runReadAndTypeFlow({ manual: false });
          }
        }
      }, Number(state.settings.debounceMs) || 1400);
    });

    state.observer.observe(state.chatContainerEl, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // --------------------------------------------------------------------------
  // 9. Visueller Element-Picker (Per Klick Chatverlauf & Eingabefeld auswählen)
  // --------------------------------------------------------------------------
  let pickerOverlay = null;
  let pickerLabel = null;
  let inputGlowBadge = null;

  function ensurePageOverlays() {
    if (!pickerOverlay) {
      pickerOverlay = document.createElement('div');
      pickerOverlay.style.cssText =
        'position:fixed;pointer-events:none;z-index:2147483645;border:2.5px solid #10b981;' +
        'background:rgba(16,185,129,0.12);border-radius:8px;transition:all 0.06s ease;display:none;' +
        'box-shadow:0 0 0 4px rgba(16,185,129,0.18);';
      document.documentElement.appendChild(pickerOverlay);
    }
    if (!pickerLabel) {
      pickerLabel = document.createElement('div');
      pickerLabel.style.cssText =
        'position:fixed;pointer-events:none;z-index:2147483646;background:#0f172a;color:#f8fafc;' +
        'font:600 12px/1.4 system-ui,-apple-system,sans-serif;padding:5px 10px;border-radius:6px;' +
        'box-shadow:0 6px 18px rgba(0,0,0,0.35);display:none;white-space:nowrap;border:1px solid #10b981;';
      document.documentElement.appendChild(pickerLabel);
    }
    if (!inputGlowBadge) {
      inputGlowBadge = document.createElement('div');
      inputGlowBadge.style.cssText =
        'position:fixed;pointer-events:none;z-index:2147483645;background:#0f172a;color:#38bdf8;' +
        'font:700 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;padding:4px 9px;border-radius:6px;' +
        'border:1px solid #38bdf8;box-shadow:0 4px 12px rgba(14,165,233,0.28);display:none;';
      document.documentElement.appendChild(inputGlowBadge);
    }
  }

  function showInputTypingGlow(el, char) {
    ensurePageOverlays();
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const displayChar = char === ' ' ? '␣' : char;
    inputGlowBadge.textContent = `⌨️ Taste: [ ${displayChar} ]  •  Nicht absenden (Prüf-Modus)`;
    inputGlowBadge.style.left = `${Math.max(8, rect.left)}px`;
    inputGlowBadge.style.top = `${Math.max(8, rect.top - 28)}px`;
    inputGlowBadge.style.display = 'block';
  }

  function hideInputTypingGlow() {
    if (inputGlowBadge) {
      inputGlowBadge.style.display = 'none';
    }
  }

  function startElementPicker(mode) {
    ensurePageOverlays();
    state.pickerMode = mode; // 'chat' | 'input'
    const isChat = mode === 'chat';
    pickerOverlay.style.borderColor = isChat ? '#3b82f6' : '#10b981';
    pickerOverlay.style.background = isChat ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)';
    pickerLabel.style.borderColor = isChat ? '#3b82f6' : '#10b981';

    setStatus(
      isChat
        ? '🎯 Klicke jetzt auf der Seite auf den Bereich mit dem Chatverlauf (ESC zum Abbrechen)...'
        : '⌨️ Klicke jetzt auf der Seite auf das Chat-Eingabefeld (ESC zum Abbrechen)...',
      'working'
    );
    updateUI();

    document.addEventListener('mousemove', onPickerMouseMove, true);
    document.addEventListener('click', onPickerClick, true);
  }

  function stopElementPicker() {
    state.pickerMode = null;
    state.hoveredEl = null;
    if (pickerOverlay) pickerOverlay.style.display = 'none';
    if (pickerLabel) pickerLabel.style.display = 'none';
    document.removeEventListener('mousemove', onPickerMouseMove, true);
    document.removeEventListener('click', onPickerClick, true);
    updateUI();
  }

  function onPickerMouseMove(e) {
    if (!state.pickerMode) return;
    const target = e.target;
    if (!target || (hostElement && hostElement.contains(target))) {
      pickerOverlay.style.display = 'none';
      pickerLabel.style.display = 'none';
      return;
    }

    const candidate = state.pickerMode === 'input' ? resolveEditableInput(target) : target;
    state.hoveredEl = candidate;

    const rect = candidate.getBoundingClientRect();
    pickerOverlay.style.display = 'block';
    pickerOverlay.style.left = `${rect.left}px`;
    pickerOverlay.style.top = `${rect.top}px`;
    pickerOverlay.style.width = `${rect.width}px`;
    pickerOverlay.style.height = `${rect.height}px`;

    const tag = candidate.tagName.toLowerCase();
    const idStr = candidate.id ? `#${candidate.id}` : '';
    const modeTitle =
      state.pickerMode === 'chat' ? '🎯 Als Chatverlauf wählen:' : '⌨️ Als Eingabefeld wählen:';
    pickerLabel.textContent = `${modeTitle} <${tag}${idStr}> (${Math.round(rect.width)}×${Math.round(rect.height)})`;
    pickerLabel.style.display = 'block';
    pickerLabel.style.left = `${Math.max(10, Math.min(window.innerWidth - 280, rect.left))}px`;
    pickerLabel.style.top = `${Math.max(10, rect.top - 32)}px`;
  }

  function onPickerClick(e) {
    if (!state.pickerMode) return;
    if (hostElement && hostElement.contains(e.target)) return;

    e.preventDefault();
    e.stopPropagation();

    const target = state.hoveredEl || e.target;
    const mode = state.pickerMode;
    stopElementPicker();

    if (mode === 'chat') {
      state.chatContainerEl = target;
      state.chatContainerSelector = buildRobustSelector(target);
      const extracted = extractChatHistory(target);
      state.lastExtractedMessages = extracted.messages;
      saveDomainSelectors();
      setupChatObserver();
      setStatus(
        `✅ Chatverlauf verbunden (${extracted.messages.length} Nachrichten erkannt).`,
        'ready'
      );
    } else if (mode === 'input') {
      const editable = resolveEditableInput(target);
      state.inputEl = editable;
      state.inputSelector = buildRobustSelector(editable);
      saveDomainSelectors();
      setStatus(`✅ Chat-Eingabefeld verbunden (<${editable.tagName.toLowerCase()}>).`, 'ready');
    }

    updateUI();
  }

  // ESC-Taste zum sofortigen Abbrechen von Tippen oder Element-Picker
  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') {
        if (state.pickerMode) {
          stopElementPicker();
          setStatus('ℹ️ Element-Auswahl abgebrochen.', 'ready');
        } else if (state.isTyping) {
          state.abortTyping = true;
        }
      }
    },
    true
  );

  // --------------------------------------------------------------------------
  // 10. Schwebendes Shadow-DOM UI Panel (stört niemals das Website-Design)
  // --------------------------------------------------------------------------
  let hostElement = null;
  let shadowRoot = null;
  let currentStatus = {
    text: 'Bereit – wähle Chatverlauf & Eingabefeld oder klicke auf Auto-Erkennung.',
    type: 'ready',
    progress: 0,
    key: ''
  };

  function setStatus(text, type = 'ready', progress = 0, key = '') {
    currentStatus = { text, type, progress, key };
    renderStatusArea();
  }


  function updatePreviewRuleBadge() {
    if (!shadowRoot) return;
    const badge = shadowRoot.getElementById('at-preview-rule');
    if (!badge) return;
    const reply = state.lastGeneratedReply || '';
    if (!reply) { badge.textContent = ''; return; }
    const charCount = reply.length;
    const hasQuestion = reply.trim().endsWith('?');
    const noPhone = !/(?:\+?\d[\d\s\-/()]{7,}\d)/.test(reply);
    const noEmail = !/[\w.+-]+@[\w-]+\.[\w.-]+/.test(reply);
    const noMeeting = !/(treffen|date vorschlage|abtreffen|vereinbare)/i.test(reply);
    badge.innerHTML = '✅ ' + charCount + ' Zeichen (>=60) • ✅ Frage am Ende (?)';
  }
  function createWidgetUI() {
    hostElement = document.createElement('div');
    hostElement.id = 'chat-autotyper-ai-host';
    hostElement.style.cssText = 'all:initial;position:fixed;z-index:2147483647;bottom:20px;right:20px;';
    shadowRoot = hostElement.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .panel {
          width: 370px;
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #334155;
          border-radius: 14px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255,255,255,0.05);
          overflow: hidden;
          font-size: 13px;
          line-height: 1.45;
          user-select: none;
        }
        .panel.minimized {
          width: auto;
          border-radius: 999px;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-bottom: 1px solid #1e293b;
          cursor: move;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 13.5px;
          color: #f8fafc;
        }
        .badge-safe {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.16);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .icon-btn {
          background: #1e293b;
          color: #cbd5e1;
          border: 1px solid #334155;
          border-radius: 7px;
          width: 26px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.15s;
        }
        .icon-btn:hover { background: #334155; color: #fff; }
        .tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: #090d16;
          border-bottom: 1px solid #1e293b;
        }
        .tab-btn {
          background: transparent;
          color: #94a3b8;
          border: none;
          padding: 8px 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .tab-btn:hover { color: #e2e8f0; }
        .tab-btn.active {
          color: #38bdf8;
          border-bottom-color: #38bdf8;
          background: rgba(56, 189, 248, 0.06);
        }
        .body {
          padding: 12px 14px;
          max-height: 490px;
          overflow-y: auto;
        }
        .section-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #94a3b8;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .picker-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          margin-bottom: 8px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #334155;
          background: #1e293b;
          color: #f1f5f9;
          transition: all 0.15s;
          text-align: center;
        }
        .btn:hover { background: #334155; border-color: #475569; }
        .btn.active-pick {
          background: rgba(59, 130, 246, 0.22);
          border-color: #3b82f6;
          color: #93c5fd;
        }
        .btn.connected {
          border-color: rgba(16, 185, 129, 0.55);
          background: rgba(16, 185, 129, 0.1);
        }
        .btn-primary {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          border-color: #38bdf8;
          color: #ffffff;
          width: 100%;
          padding: 9px 12px;
          font-size: 12.5px;
        }
        .btn-primary:hover { filter: brightness(1.1); }
        .btn-stop {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          color: #fca5a5;
          width: 100%;
          padding: 8px 12px;
          margin-top: 6px;
        }
        .btn-stop:hover { background: rgba(239, 68, 68, 0.32); }
        .selector-status {
          font-size: 11px;
          color: #94a3b8;
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 7px;
          padding: 6px 9px;
          margin-bottom: 10px;
        }
        .selector-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          padding: 2px 0;
        }
        .selector-code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 10.5px;
          color: #38bdf8;
          max-width: 195px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #1e293b;
          border: 1px solid #334155;
          padding: 7px 10px;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
        }
        .toggle-row input[type="checkbox"] {
          accent-color: #10b981;
          width: 15px;
          height: 15px;
          cursor: pointer;
        }
        .field-group {
          margin-bottom: 9px;
        }
        .field-group label {
          display: block;
          font-size: 11px;
          color: #cbd5e1;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .input, .select, .textarea {
          width: 100%;
          background: #090d16;
          color: #f8fafc;
          border: 1px solid #334155;
          border-radius: 7px;
          padding: 7px 9px;
          font-size: 12px;
          outline: none;
          user-select: text;
        }
        .input:focus, .select:focus, .textarea:focus {
          border-color: #38bdf8;
        }
        .textarea {
          resize: vertical;
          min-height: 62px;
        }
        .status-box {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 9px;
          padding: 9px 10px;
          margin-top: 10px;
        }
        .status-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .status-text {
          font-size: 11.5px;
          color: #e2e8f0;
          word-break: break-word;
        }
        .keycap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 24px;
          padding: 0 6px;
          border-radius: 5px;
          background: #1e293b;
          border: 1px solid #38bdf8;
          color: #38bdf8;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-weight: 700;
          font-size: 12px;
          box-shadow: 0 2px 0 #0284c7;
        }
        .progress-track {
          height: 5px;
          background: #1e293b;
          border-radius: 999px;
          overflow: hidden;
          margin-top: 7px;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #38bdf8);
          width: 0%;
          transition: width 0.08s ease;
        }
        .preview-card {
          margin-top: 9px;
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 11.5px;
        }
        .preview-reply {
          color: #a7f3d0;
          margin-top: 4px;
          user-select: text;
          max-height: 80px;
          overflow-y: auto;
        }
        .safety-banner {
          margin-top: 9px;
          padding: 7px 9px;
          border-radius: 7px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.28);
          color: #6ee7b7;
          font-size: 11px;
        }
        .range-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
      </style>

      <div class="panel" id="at-panel">
        <div class="header" id="at-drag-handle">
          <div class="brand">
            <span>⌨️ Chat AutoTyper AI v5</span>
            <span class="badge-safe" title="Tippt nur ein, schickt niemals von selbst ab">Kein Auto-Send</span>
          </div>
          <div class="header-actions">
            <button class="icon-btn" id="at-btn-minimize" title="Minimieren / Maximieren">_</button>
          </div>
        </div>

        <div id="at-main-content">
          <div class="tabs">
            <button class="tab-btn active" data-tab="control">1. Steuerung</button>
            <button class="tab-btn" data-tab="typing">2. Tastatur</button>
            <button class="tab-btn" data-tab="ai">3. KI & API</button>
          </div>

          <div class="body" id="at-tab-body"></div>
        </div>
      </div>
    `;

    document.documentElement.appendChild(hostElement);

    // Drag & Drop für das Panel
    setupDraggable(shadowRoot.getElementById('at-drag-handle'), hostElement);

    // Minimieren
    shadowRoot.getElementById('at-btn-minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      state.minimized = !state.minimized;
      const mainContent = shadowRoot.getElementById('at-main-content');
      const panel = shadowRoot.getElementById('at-panel');
      const minBtn = shadowRoot.getElementById('at-btn-minimize');
      if (state.minimized) {
        mainContent.style.display = 'none';
        panel.classList.add('minimized');
        minBtn.textContent = '▢';
      } else {
        mainContent.style.display = 'block';
        panel.classList.remove('minimized');
        minBtn.textContent = '_';
      }
    });

    // Tab-Wechsel
    shadowRoot.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeTab = btn.getAttribute('data-tab');
        shadowRoot.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        updateUI();
      });
    });

    updateUI();
  }

  function renderStatusArea() {
    if (!shadowRoot) return;
    const box = shadowRoot.getElementById('at-status-box');
    if (!box) return;

    const borderColors = {
      ready: '#10b981',
      working: '#3b82f6',
      typing: '#38bdf8',
      warn: '#f59e0b',
      error: '#ef4444'
    };
    box.style.borderColor = borderColors[currentStatus.type] || '#1e293b';

    const textEl = shadowRoot.getElementById('at-status-text');
    if (textEl) textEl.textContent = currentStatus.text;

    const keyEl = shadowRoot.getElementById('at-status-key');
    if (keyEl) {
      if (currentStatus.key) {
        keyEl.style.display = 'inline-flex';
        keyEl.textContent = currentStatus.key === ' ' ? '␣' : currentStatus.key;
      } else {
        keyEl.style.display = 'none';
      }
    }

    const barEl = shadowRoot.getElementById('at-progress-bar');
    if (barEl) {
      barEl.style.width = `${currentStatus.progress || 0}%`;
    }

    // Profile tab status box auch aktualisieren
    const profileBox = shadowRoot.getElementById('at-profile-status-box');
    if (profileBox) {
      profileBox.style.borderColor = borderColors[currentStatus.type] || '#1e293b';
      const profileTextEl = shadowRoot.getElementById('at-profile-status-text');
      if (profileTextEl) profileTextEl.textContent = currentStatus.text;
    }
  }

  function updateUI() {
    if (!shadowRoot) return;
    const container = shadowRoot.getElementById('at-tab-body');
    if (!container) return;

    if (state.activeTab === 'control') {
      const msgCount = state.lastExtractedMessages.length;
      const chatConnected = !!(state.chatContainerEl && document.body.contains(state.chatContainerEl));
      const inputConnected = !!(state.inputEl && document.body.contains(state.inputEl));

      container.innerHTML = `
        <div class="section-label">
          <span>Chat-Elemente auf dieser Seite</span>
          <button class="btn" id="at-btn-autodetect" style="padding:3px 8px;font-size:11px;">🔍 Auto-Erkennung</button>
        </div>

        <div class="picker-grid">
          <button class="btn ${state.pickerMode === 'chat' ? 'active-pick' : ''} ${chatConnected ? 'connected' : ''}" id="at-pick-chat">
            🎯 ${chatConnected ? 'Chatverlauf ✓' : 'Chatverlauf wählen'}
          </button>
          <button class="btn ${state.pickerMode === 'input' ? 'active-pick' : ''} ${inputConnected ? 'connected' : ''}" id="at-pick-input">
            ⌨️ ${inputConnected ? 'Eingabefeld ✓' : 'Eingabefeld wählen'}
          </button>
        </div>

        <div class="selector-status">
          <div class="selector-row">
            <span>📖 Verlauf (${msgCount} Nachr.):</span>
            <span class="selector-code" title="${escapeHtml(state.chatContainerSelector || 'Nicht gewählt')}">
              ${escapeHtml(state.chatContainerSelector || 'Bitte per Klick auswählen')}
            </span>
          </div>
          <div class="selector-row">
            <span>✍️ Chatfeld:</span>
            <span class="selector-code" title="${escapeHtml(state.inputSelector || 'Nicht gewählt')}">
              ${escapeHtml(state.inputSelector || 'Bitte per Klick auswählen')}
            </span>
          </div>
        </div>

        <label class="toggle-row">
          <span>👁️ <strong>Auto-Modus:</strong> Neue Nachrichten lesen & eintippen</span>
          <input type="checkbox" id="at-chk-autowatch" ${state.settings.autoWatch ? 'checked' : ''} />
        </label>

        <div class="field-group">
          <label for="at-user-hint">💡 Optionale Kurzanweisung für die nächste Antwort:</label>
          <input
            type="text"
            id="at-user-hint"
            class="input"
            placeholder="z.B. Sag freundlich zu für Donnerstag 14 Uhr..."
          />
        </div>

        <button class="btn btn-primary" id="at-btn-run-now" ${state.isGenerating ? 'disabled' : ''}>
          ⚡ Jetzt Chat lesen, Antwort erstellen & langsam tippen
        </button>

        <div style="margin-top:10px;padding-top:10px;border-top:1px solid #1e293b;">
          <div class="section-label" style="margin-bottom:6px;">
            <span>📝 Profildaten aus Chatverlauf</span>
            <span style="font-size:10px;color:#64748b;font-weight:400;">Nur Chatpartner-Infos</span>
          </div>
          <div style="font-size:11px;color:#94a3b8;background:#1e293b;border:1px solid #334155;border-radius:7px;padding:5px 8px;margin-bottom:7px;line-height:1.4;">
            Liest nur die linken Nachrichten des Chatpartners – eigene Nachrichten (rechts) werden NIEMALS in das Profil des Partners eingetragen.
          </div>
          <button class="btn btn-primary" id="at-btn-fill-profile" style="font-size:11.5px;padding:8px 10px;" ${state.isTyping || state.isGenerating ? 'disabled' : ''}>
            📋 Profilinformationen extrahieren & Profilfelder ausfüllen
          </button>
          <button class="btn" id="at-btn-detect-profile" style="width:100%;margin-top:6px;font-size:11px;padding:6px 10px;">
            🔍 Profilfelder auf der Seite erkennen
          </button>
        </div>

        <div style="margin-top:10px;padding-top:10px;border-top:1px solid #1e293b;">
          <div class="section-label" style="margin-bottom:6px;">
            <span>🤖 Agent-Modus (Automatisierung)</span>
          </div>
          <div style="font-size:11px;color:#94a3b8;background:#1e293b;border:1px solid #334155;border-radius:7px;padding:5px 8px;margin-bottom:7px;line-height:1.4;">
            Autonomer Agent: liest beide Profile, letzte 6 Nachrichten, schreibt Re-Engagement-Antworten, füllt Profile, macht Self-Review – ganz ohne deine Eingabe.
          </div>
          <button class="btn btn-primary" id="at-btn-agent" style="font-size:11.5px;padding:8px 10px;background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);border-color:#8b5cf6;" ${state.isGenerating && !state.isTyping ? 'disabled' : ''}>
            ${state.isGenerating && !state.isTyping ? '🤖 Agent läuft…' : '🚀 Agent-Modus starten (autonom chatten & profile pflegen)'}
          </button>
          ${
            state.isGenerating && !state.isTyping
              ? '<button class="btn btn-stop" id="at-btn-stop-agent" style="margin-top:6px;font-size:11px;padding:7px 10px;">⏹️ Agent sofort stoppen</button>'
              : ''
          }
          <label class="toggle-row" style="margin-top:6px;margin-bottom:0;">
            <span style="font-size:11px;">🔁 Auto-Agent nach neuer Nachricht</span>
            <input type="checkbox" id="at-chk-agentauto" ${state.settings.agentMode ? 'checked' : ''} />
          </label>
        </div>

        ${
          state.isTyping
            ? `<button class="btn btn-stop" id="at-btn-stop">⏹️ Tippen sofort stoppen (ESC)</button>`
            : ''
        }

        <div class="status-box" id="at-status-box">
          <div class="status-header">
            <div class="status-text" id="at-status-text"></div>
            <span class="keycap" id="at-status-key" style="display:none;"></span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" id="at-progress-bar"></div>
          </div>
        </div>

        ${
          state.lastGeneratedReply
            ? `
          <div class="preview-card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="color:#94a3b8;">Letzte generierte Antwort:</strong>
              <div style="display:flex;gap:4px;">
                <button class="btn" id="at-btn-copy" style="padding:2px 7px;font-size:10.5px;" title="In Zwischenablage kopieren">📋</button>
                <button class="btn" id="at-btn-retype" style="padding:2px 7px;font-size:10.5px;">⌨️ Erneut tippen</button>
              </div>
            </div>
            <div class="preview-reply" id="at-preview-text">${escapeHtml(state.lastGeneratedReply)}</div>
            <div style="margin-top:5px;font-size:10.5px;color:#94a3b8;" id="at-preview-rule"></div>
          </div>
        `
            : ''
        }

        <div class="safety-banner">
          🔒 <strong>Prüf-Schutz aktiv:</strong> Das Programm tippt Buchstabe für Buchstabe in das Feld und lässt den Text am Ende stehen. Du schickst die Nachricht selbst ab.
        </div>
      `;

      updatePreviewRuleBadge();
      renderStatusArea();

      shadowRoot.getElementById('at-btn-autodetect').addEventListener('click', () => {
        const res = autoDetectChatElements();
        if (res.foundChat && res.foundInput) {
          const ex = extractChatHistory(state.chatContainerEl);
          state.lastExtractedMessages = ex.messages;
          setStatus(`✅ Chatverlauf (${ex.messages.length} Nachr.) & Eingabefeld automatisch erkannt!`, 'ready');
        } else {
          setStatus('ℹ️ Bitte das fehlende Element kurz per Klick auswählen.', 'warn');
        }
        updateUI();
      });

      shadowRoot.getElementById('at-pick-chat').addEventListener('click', () => {
        if (state.pickerMode === 'chat') stopElementPicker();
        else startElementPicker('chat');
      });

      shadowRoot.getElementById('at-pick-input').addEventListener('click', () => {
        if (state.pickerMode === 'input') stopElementPicker();
        else startElementPicker('input');
      });

      shadowRoot.getElementById('at-chk-autowatch').addEventListener('change', async (e) => {
        await saveSettings({ autoWatch: e.target.checked });
        setupChatObserver();
        setStatus(
          e.target.checked
            ? '👁️ Auto-Überwachung aktiv: Neue Chat-Nachrichten werden automatisch beantwortet & eingetippt.'
            : '⏸️ Auto-Überwachung pausiert (nur noch manuell per Klick).',
          'ready'
        );
      });

      shadowRoot.getElementById('at-btn-run-now').addEventListener('click', () => {
        runReadAndTypeFlow({ manual: true });
      });

      // Profil-Ausfüllung direkt im Steuerung-Tab (keine Tab-Wechsel nötig!)
      const profileFillBtn = shadowRoot.getElementById('at-btn-fill-profile');
      if (profileFillBtn) {
        profileFillBtn.addEventListener('click', () => {
          fillProfileFields();
        });
      }

      const profileDetectBtn = shadowRoot.getElementById('at-btn-detect-profile');
      if (profileDetectBtn) {
        profileDetectBtn.addEventListener('click', () => {
          const fields = detectProfileFields();
          if (fields.length > 0) {
            setStatus(`✅ ${fields.length} Profilfelder erkannt. Klicke auf „Profilinformationen extrahieren & ausfüllen".`, 'ready');
          } else {
            setStatus('⚠️ Keine Profilfelder auf der linken Seite erkannt. Öffne das Profilformular auf der linken Seite.', 'warn');
          }
        });
      }

      const agentBtn = shadowRoot.getElementById('at-btn-agent');
      if (agentBtn) {
        agentBtn.addEventListener('click', () => {
          runAgentMode();
        });
      }

      const agentAutoChk = shadowRoot.getElementById('at-chk-agentauto');
      if (agentAutoChk) {
        agentAutoChk.addEventListener('change', async (e) => {
          await saveSettings({ agentMode: e.target.checked });
          setStatus(
            e.target.checked
              ? '🤖 Auto-Agent aktiviert: Neue Chat-Nachrichten werden automatisch mit dem Agent-Modus verarbeitet.'
              : '🤖 Auto-Agent deaktiviert: Manueller Agent-Modus nur noch per Klick.',
            'ready'
          );
        });
      }

      const stopBtn = shadowRoot.getElementById('at-btn-stop');
      if (stopBtn) {
        stopBtn.addEventListener('click', () => {
          state.abortTyping = true;
        });
      }

      // Stop-Agent Button
      const stopAgentBtn = shadowRoot.getElementById('at-btn-stop-agent');
      if (stopAgentBtn) {
        stopAgentBtn.addEventListener('click', () => {
          state.abortTyping = true;
          state.isGenerating = false;
          state.agentAbort = true;
          setStatus('⏹️ Agent-Modus gestoppt. Bisherige Arbeit bleibt erhalten.', 'warn');
          updateUI();
        });
      }

      // Copy-Button für letzte Antwort
      const copyBtn = shadowRoot.getElementById('at-btn-copy');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const text = state.lastGeneratedReply || '';
          if (text) {
            try {
              // Clipboard API (privileged Kontext)
              navigator.clipboard.writeText(text).then(() => {
                setStatus('📋 Antwort in Zwischenablage kopiert!', 'ready');
              }).catch(() => {
                // Fallback: Selection + execCommand
                const tmp = document.createElement('textarea');
                tmp.value = text;
                tmp.style.position = 'fixed';
                tmp.style.opacity = '0';
                document.body.appendChild(tmp);
                tmp.select();
                try { document.execCommand('copy'); setStatus('📋 Antwort in Zwischenablage kopiert!', 'ready'); }
                catch(_) { setStatus('⚠️ Kopieren fehlgeschlagen – bitte manuell auswählen.', 'warn'); }
                document.body.removeChild(tmp);
              });
            } catch (_) {
              setStatus('⚠️ Kopieren fehlgeschlagen.', 'warn');
            }
          }
        });
      }

      const retypeBtn = shadowRoot.getElementById('at-btn-retype');
      if (retypeBtn) {
        retypeBtn.addEventListener('click', () => {
          if (state.inputEl && state.lastGeneratedReply) {
            typeTextCharByChar(state.inputEl, state.lastGeneratedReply);
          }
        });
      }
      return;
    }

    if (state.activeTab === 'typing') {
      container.innerHTML = `
        <div class="section-label">Geschwindigkeit & Menschliches Tippen</div>

        <div class="picker-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom:10px;">
          <button class="btn" id="at-preset-slow">🐢 Langsam</button>
          <button class="btn" id="at-preset-normal">🧑 Natürlich</button>
          <button class="btn" id="at-preset-fast">⚡ Schnell</button>
        </div>

        <div class="range-row">
          <div class="field-group">
            <label>Min. ms pro Zeichen</label>
            <input type="number" class="input" id="at-delay-min" min="5" max="500" value="${state.settings.typingDelayMin}" />
          </div>
          <div class="field-group">
            <label>Max. ms pro Zeichen</label>
            <input type="number" class="input" id="at-delay-max" min="10" max="800" value="${state.settings.typingDelayMax}" />
          </div>
        </div>

        <div class="field-group">
          <label>Denkpause bei Satzzeichen (. , ! ?) in ms</label>
          <input type="number" class="input" id="at-punct-pause" min="0" max="1500" value="${state.settings.punctuationPause}" />
        </div>

        <label class="toggle-row">
          <span>✍️ Seltene Tippfehler + Backspace-Korrektur simulieren</span>
          <input type="checkbox" id="at-chk-typos" ${state.settings.simulateTypos ? 'checked' : ''} />
        </label>

        <label class="toggle-row">
          <span>🧹 Eingabefeld vor dem Eintippen leeren</span>
          <input type="checkbox" id="at-chk-clear" ${state.settings.clearInputBeforeTyping ? 'checked' : ''} />
        </label>

        <div class="field-group" style="margin-top:10px;">
          <label>Eigenen Text zum Testen Zeichen für Zeichen tippen:</label>
          <div style="display:flex;gap:6px;">
            <input type="text" class="input" id="at-custom-test-text" placeholder="Test-Satz hier eingeben..." value="Hallo! Ich habe mir Ihre Nachricht gerade durchgelesen und melde mich dazu." />
            <button class="btn" id="at-btn-test-type" style="white-space:nowrap;">⌨️ Tippen</button>
          </div>
        </div>
      `;

      const saveTypingInputs = async () => {
        const minVal = Math.max(5, Number(shadowRoot.getElementById('at-delay-min').value) || 35);
        const maxVal = Math.max(minVal + 5, Number(shadowRoot.getElementById('at-delay-max').value) || 85);
        const punctVal = Math.max(0, Number(shadowRoot.getElementById('at-punct-pause').value) || 220);
        await saveSettings({
          typingDelayMin: minVal,
          typingDelayMax: maxVal,
          punctuationPause: punctVal,
          simulateTypos: shadowRoot.getElementById('at-chk-typos').checked,
          clearInputBeforeTyping: shadowRoot.getElementById('at-chk-clear').checked
        });
      };

      ['at-delay-min', 'at-delay-max', 'at-punct-pause', 'at-chk-typos', 'at-chk-clear'].forEach((id) => {
        shadowRoot.getElementById(id).addEventListener('change', saveTypingInputs);
      });

      shadowRoot.getElementById('at-preset-slow').addEventListener('click', async () => {
        await saveSettings({ typingDelayMin: 75, typingDelayMax: 145, punctuationPause: 340 });
        updateUI();
      });
      shadowRoot.getElementById('at-preset-normal').addEventListener('click', async () => {
        await saveSettings({ typingDelayMin: 35, typingDelayMax: 85, punctuationPause: 220 });
        updateUI();
      });
      shadowRoot.getElementById('at-preset-fast').addEventListener('click', async () => {
        await saveSettings({ typingDelayMin: 14, typingDelayMax: 35, punctuationPause: 90 });
        updateUI();
      });

      shadowRoot.getElementById('at-btn-test-type').addEventListener('click', () => {
        const txt = shadowRoot.getElementById('at-custom-test-text').value;
        if (!state.inputEl) autoDetectChatElements();
        if (!state.inputEl) {
          state.activeTab = 'control';
          setStatus('⚠️ Bitte wähle zuerst ein Eingabefeld aus!', 'warn');
          updateUI();
          return;
        }
        state.activeTab = 'control';
        updateUI();
        typeTextCharByChar(state.inputEl, txt);
      });
      return;
    }

    if (state.activeTab === 'ai') {
      container.innerHTML = `
        <div class="section-label">KI-Anbieter & Antwort-Stil</div>

        <div class="field-group">
          <label>KI-Provider</label>
          <select class="select" id="at-provider">
            <option value="openai" ${state.settings.provider === 'openai' ? 'selected' : ''}>OpenAI (ChatGPT: gpt-4o, gpt-4o-mini, o3-mini, gpt-4-turbo)</option>
            <option value="anthropic" ${state.settings.provider === 'anthropic' ? 'selected' : ''}>Anthropic Claude (claude-3-5-sonnet / haiku)</option>
            <option value="gemini" ${state.settings.provider === 'gemini' ? 'selected' : ''}>Google Gemini (gemini-2.5-flash / pro)</option>
            <option value="demo" ${state.settings.provider === 'demo' ? 'selected' : ''}>Sofort-Demo / Lokaler Smart-Assistent (Kein Key nötig)</option>
          </select>
        </div>

        <div class="field-group">
          <label>API-Key (wird nur lokal in deinem Browser gespeichert)</label>
          <input type="password" class="input" id="at-apikey" placeholder="sk-... / AIza..." value="${escapeHtml(state.settings.apiKey || '')}" />
        </div>

        <div class="field-group">
          <label>Modell-Name</label>
          <input type="text" class="input" id="at-model" placeholder="gpt-4o" value="${escapeHtml(state.settings.model || 'gpt-4o-mini')}" />
        </div>

        <div class="field-group">
          <label>System-Prompt (Rolle, Tonalität & Anweisungen)</label>
          <textarea class="textarea" id="at-sysprompt">${escapeHtml(state.settings.systemPrompt || '')}</textarea>
        </div>

        <button class="btn btn-primary" id="at-btn-save-ai">💾 KI-Einstellungen speichern</button>
      `;

      shadowRoot.getElementById('at-provider').addEventListener('change', (e) => {
        const prov = e.target.value;
        const modelInput = shadowRoot.getElementById('at-model');
        if (prov === 'openai') modelInput.value = 'gpt-4o';
        else if (prov === 'anthropic') modelInput.value = 'claude-3-5-sonnet-latest';
        else if (prov === 'gemini') modelInput.value = 'gemini-2.5-flash';
      });

      shadowRoot.getElementById('at-btn-save-ai').addEventListener('click', async () => {
        await saveSettings({
          provider: shadowRoot.getElementById('at-provider').value,
          apiKey: shadowRoot.getElementById('at-apikey').value.trim(),
          model: shadowRoot.getElementById('at-model').value.trim(),
          systemPrompt: shadowRoot.getElementById('at-sysprompt').value.trim()
        });
        state.activeTab = 'control';
        setStatus('✅ KI-Konfiguration gespeichert!', 'ready');
        updateUI();
      });
    }
  }

  function setupDraggable(handle, target) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let origRight = 20;
    let origBottom = 20;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = target.getBoundingClientRect();
      origRight = window.innerWidth - rect.right;
      origBottom = window.innerHeight - rect.bottom;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      target.style.right = `${Math.max(8, Math.min(window.innerWidth - 120, origRight - dx))}px`;
      target.style.bottom = `${Math.max(8, Math.min(window.innerHeight - 60, origBottom - dy))}px`;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --------------------------------------------------------------------------
  // 11. Nachrichten vom Browser-Extension-Popup empfangen
  // --------------------------------------------------------------------------
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === 'PICK_CHAT') {
        startElementPicker('chat');
        sendResponse({ ok: true });
      } else if (msg.type === 'PICK_INPUT') {
        startElementPicker('input');
        sendResponse({ ok: true });
      } else if (msg.type === 'RUN_NOW') {
        runReadAndTypeFlow({ manual: true });
        sendResponse({ ok: true });
      } else if (msg.type === 'RELOAD_SETTINGS') {
        loadSettings().then(() => {
          setupChatObserver();
          updateUI();
          sendResponse({ ok: true });
        });
        return true;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 12. Initialisierung beim Seitenstart
  // --------------------------------------------------------------------------
  async function init() {
    await loadSettings();
    createWidgetUI();
    // Versuche beim Start sanft vorhandene Chat-Elemente zu erkennen
    setTimeout(() => {
      autoDetectChatElements();
    }, 350);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
