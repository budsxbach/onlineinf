document.addEventListener('DOMContentLoaded', async () => {
  const providerEl = document.getElementById('provider');
  const apiKeyEl = document.getElementById('apiKey');
  const modelEl = document.getElementById('model');
  const systemPromptEl = document.getElementById('systemPrompt');
  const saveMsgEl = document.getElementById('save-msg');

  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (res) => {
    if (res && res.settings) {
      providerEl.value = res.settings.provider || 'openai';
      apiKeyEl.value = res.settings.apiKey || '';
      modelEl.value = res.settings.model || 'gpt-4o-mini';
      systemPromptEl.value = res.settings.systemPrompt || '';
    }
  });

  providerEl.addEventListener('change', () => {
    if (providerEl.value === 'openai') modelEl.value = 'gpt-4o-mini';
    else if (providerEl.value === 'anthropic') modelEl.value = 'claude-3-5-sonnet-latest';
    else if (providerEl.value === 'gemini') modelEl.value = 'gemini-2.5-flash';
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    const settings = {
      provider: providerEl.value,
      apiKey: apiKeyEl.value.trim(),
      model: modelEl.value.trim(),
      systemPrompt: systemPromptEl.value.trim()
    };
    chrome.runtime.sendMessage({ type: 'SAVE_SETTINGS', settings }, async () => {
      saveMsgEl.style.display = 'block';
      setTimeout(() => (saveMsgEl.style.display = 'none'), 2000);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'RELOAD_SETTINGS' });
      }
    });
  });

  async function sendToActiveTab(type) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type });
      window.close();
    }
  }

  document.getElementById('btn-pick-chat').addEventListener('click', () => sendToActiveTab('PICK_CHAT'));
  document.getElementById('btn-pick-input').addEventListener('click', () => sendToActiveTab('PICK_INPUT'));
  document.getElementById('btn-run-now').addEventListener('click', () => sendToActiveTab('RUN_NOW'));
});
