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
    typoRate: 0.025,
    autoWatch: true,
    autoTypeDirectly: true,
    clearInputBeforeTyping: false,
    replaceNewlinesWithSpace: true,
    debounceMs: 1400
  };

  // Deutsche QWERTZ-Nachbartasten für realistische Tippfehler-Simulation
  const QWERTZ_NEIGHBORS = {
    a: 'sqy', b: 'vghn', c: 'xdfv', d: 'serfcx', e: 'wsdr', f: 'drtgvc',
    g: 'ftyhbv', h: 'gzujnb', i: 'ujko', j: 'huikmn', k: 'jiol', l: 'kopö',
    m: 'njk', n: 'bhjm', o: 'iklp', p: 'olü', q: 'wa', r: 'edft',
    s: 'wedxya', t: 'rfgz', u: 'zhij', v: 'cfgb', w: 'qase', x: 'ysdc',
    y: 'asx', z: 'tghu', ä: 'ölü', ö: 'lpä', ü: 'pöä'
  };

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
      const reply = generateLocalContextualReply(chatHistoryText, messages, userHint);
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

    let userPrompt = `Hier ist der aktuelle Chatverlauf von der Website:\n\n--- CHATVERLAUF START ---\n${formattedHistory}\n--- CHATVERLAUF ENDE ---\n\n`;
    if (userHint && userHint.trim()) {
      userPrompt += `Zusätzliche Vorgabe / Stichwort für diese Antwort: "${userHint.trim()}"\n\n`;
    }
    userPrompt +=
      'Erstelle jetzt die direkt passende Antwort auf die letzte Nachricht im Chatverlauf. ' +
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
          model: settings.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
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
        reply: cleanReply(data?.choices?.[0]?.message?.content || ''),
        providerUsed: `OpenAI (${settings.model || 'gpt-4o-mini'})`
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
        reply: cleanReply(data?.content?.[0]?.text || ''),
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
        reply: cleanReply(data?.candidates?.[0]?.content?.parts?.[0]?.text || ''),
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

  function generateLocalContextualReply(chatHistoryText, messages, userHint) {
    const partnerMessages = Array.isArray(messages)
      ? messages.filter((m) => !/Ich/i.test(m.sender))
      : [];
    const lastObj =
      partnerMessages.length > 0
        ? partnerMessages[partnerMessages.length - 1]
        : Array.isArray(messages) && messages.length > 0
          ? messages[messages.length - 1]
          : null;

    const lastText = lastObj ? lastObj.text : (chatHistoryText || '').split('\n').filter(Boolean).pop() || '';
    const lower = lastText.toLowerCase();

    if (userHint && userHint.trim()) {
      return `Vielen Dank für Ihre Nachricht! ${userHint.trim()} – geben Sie mir gerne kurz Bescheid, ob das so für Sie passt.`;
    }

    if (lower.includes('termin') || lower.includes('besichtigung') || lower.includes('wann') || lower.includes('uhr')) {
      return 'Vielen Dank für Ihre Nachricht! Wir können Ihnen dafür sehr gerne am Donnerstag um 14:30 Uhr oder am Freitag um 10:00 Uhr einen Termin anbieten. Welcher Zeitpunkt passt Ihnen besser?';
    }
    if (lower.includes('angebot') || lower.includes('preis') || lower.includes('kosten') || lower.includes('euro')) {
      return 'Gerne stelle ich Ihnen ein passendes Angebot zusammen. Könnten Sie mir noch kurz die wichtigsten Eckdaten schicken, damit ich Ihnen heute noch eine genaue Kalkulation zusenden kann?';
    }
    if (lower.includes('lieferzeit') || lower.includes('versand') || lower.includes('bestellung') || lower.includes('paket')) {
      return 'Ich habe den Status Ihrer Bestellung gerade überprüft: Alles ist bereits in Bearbeitung und geht planmäßig morgen in den Versand. Sie erhalten die Sendungsnummer direkt per E-Mail.';
    }
    if (lower.includes('problem') || lower.includes('fehler') || lower.includes('funktioniert nicht') || lower.includes('defekt')) {
      return 'Vielen Dank für Ihren Hinweis! Ich habe das direkt an unser Technik-Team weitergegeben und wir kümmern uns umgehend darum. Tritt der Fehler bei Ihnen dauerhaft oder nur in einem bestimmten Schritt auf?';
    }
    if (lower.includes('hallo') || lower.includes('guten tag') || lower.includes('hi ') || lower.startsWith('hi')) {
      return 'Hallo! Schön, dass Sie uns schreiben. Wie kann ich Ihnen bei Ihrem Anliegen am besten weiterhelfen?';
    }
    if (lower.includes('danke') || lower.includes('perfekt') || lower.includes('super') || lower.includes('passt')) {
      return 'Sehr gerne, das freut mich! Falls Sie noch weitere Fragen haben, schreiben Sie mir jederzeit hier im Chat.';
    }

    return `Vielen Dank für Ihre Nachricht! Ich habe mir den aktuellen Stand gerade angesehen und bereite alles Weitere für Sie vor. Haben Sie dazu noch einen speziellen Änderungswunsch?`;
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

    state.lastProcessedSignature = signature;
    state.isGenerating = true;
    setStatus(`📖 Lese Chatverlauf (${messages.length || 1} Nachrichten) & erstelle Antwort...`, 'working');
    updateUI();

    try {
      const hintInput = shadowRoot ? shadowRoot.getElementById('at-user-hint') : null;
      const hint = customHint || (hintInput ? hintInput.value.trim() : '');

      const res = await requestAIReply(rawText, messages, hint);
      const reply = (res.reply || '').trim();
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

        if (current.signature && current.signature !== state.lastProcessedSignature) {
          runReadAndTypeFlow({ manual: false });
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
            <span>⌨️ Chat AutoTyper AI</span>
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
              <button class="btn" id="at-btn-retype" style="padding:2px 7px;font-size:10.5px;">⌨️ Erneut tippen</button>
            </div>
            <div class="preview-reply">${escapeHtml(state.lastGeneratedReply)}</div>
          </div>
        `
            : ''
        }

        <div class="safety-banner">
          🔒 <strong>Prüf-Schutz aktiv:</strong> Das Programm tippt Buchstabe für Buchstabe in das Feld und lässt den Text am Ende stehen. Du schickst die Nachricht selbst ab.
        </div>
      `;

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

      const stopBtn = shadowRoot.getElementById('at-btn-stop');
      if (stopBtn) {
        stopBtn.addEventListener('click', () => {
          state.abortTyping = true;
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
            <option value="openai" ${state.settings.provider === 'openai' ? 'selected' : ''}>OpenAI (ChatGPT: gpt-4o-mini / gpt-4o)</option>
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
          <input type="text" class="input" id="at-model" placeholder="gpt-4o-mini" value="${escapeHtml(state.settings.model || 'gpt-4o-mini')}" />
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
        if (prov === 'openai') modelInput.value = 'gpt-4o-mini';
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
