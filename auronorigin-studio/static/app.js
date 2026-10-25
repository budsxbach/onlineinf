// AuronOrigin YouTube Video Studio Frontend Controller
const state = {
  bootstrap: null,
  dossier: null,
  blueprint: null,
  customMusicFileId: null,
  motifCache: new Map(),
  previewQueue: [],
  activePreviews: 0,
  modalTargetSceneIndex: null,
  modalCurrentDir: "",
  modalParentDir: "",
  activeRenderResult: null,
  activeCoverKey: "youtube_16x9",
  socialPreviewTimer: null,
};

const el = (id) => document.getElementById(id);

function showWorkflowStatus(title, detail) {
  const box = el("workflowStatusBanner");
  el("workflowStatusTitle").textContent = title;
  el("workflowStatusDetail").textContent = detail || "";
  box.classList.remove("hidden");
}

function hideWorkflowStatus() {
  el("workflowStatusBanner").classList.add("hidden");
}

function updateUsageHeader(settings) {
  if (!settings) return;
  const usage = settings.token_usage_total || { requests: 0, total_tokens: 0 };
  el("tokenUsageBadge").textContent =
    `${usage.requests || 0} Anfragen • ${(usage.total_tokens || 0).toLocaleString("de-DE")} Tokens`;

  if (settings.has_arena_key) {
    el("routerStatusDot").classList.add("verified");
    el("routerStatusText").textContent = `Arena Router aktiv (${settings.arena_model || "coding-router-preview"})`;
  }
}

function currentRawApiKey() {
  const val = el("arenaApiKey").value.trim();
  return val.startsWith("••••") ? "" : val;
}

// Live Browser-Side Single-Topic Pure-German Wikipedia Research (strictly 1 main article, zero topic mixing)
async function fetchLiveBrowserSources(topic) {
  const results = [];
  const clean = topic.trim();
  if (!clean) return results;

  try {
    const searchUrl = `https://de.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(clean)}&srlimit=1&format=json&origin=*`;
    const sResp = await fetch(searchUrl, { signal: AbortSignal.timeout(4500) });
    if (!sResp.ok) return results;
    const sData = await sResp.json();
    const bestTitle = sData?.query?.search?.[0]?.title;
    if (!bestTitle) return results;

    const extUrl = `https://de.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=2400&explaintext=1&titles=${encodeURIComponent(bestTitle)}&format=json&origin=*`;
    const eResp = await fetch(extUrl, { signal: AbortSignal.timeout(4500) });
    if (!eResp.ok) return results;
    const eData = await eResp.json();
    const pages = Object.values(eData?.query?.pages || {});
    for (const p of pages) {
      const extract = String(p.extract || "").replace(/\s+/g, " ").trim();
      if (p.title && extract.length > 40) {
        const sents = extract
          .split(/(?<=[.!?])\s+/)
          .filter((s) => s.length >= 38 && s.length <= 260 && !s.includes("=="))
          .slice(0, 4);
        for (const summary of sents) {
          results.push({
            title: p.title,
            summary,
            url: `https://de.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`,
            source: "Wikipedia DE (Hauptartikel)",
            kind: "FAKT",
          });
        }
      }
    }
  } catch (_) {}

  return results;
}

async function tryBrowserDirectArenaRouter(systemPrompt, userPrompt) {
  const rawKey = currentRawApiKey();
  if (!rawKey) return null;
  const gw = (el("arenaGatewayUrl").value || "https://api.preview.arena.ai").replace(/\/+$/, "");
  const model = el("arenaModel").value || "coding-router-preview";

  try {
    const resp = await fetch(`${gw}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${rawKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 6144,
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return null;
    return {
      text,
      prompt_tokens: data?.usage?.prompt_tokens || 0,
      completion_tokens: data?.usage?.completion_tokens || 0,
    };
  } catch (_) {
    return null;
  }
}

async function initStudio() {
  const resp = await fetch("/api/bootstrap");
  const data = await resp.json();
  state.bootstrap = data;

  const cfg = data.settings || {};
  if (cfg.arena_api_key_masked) {
    el("arenaApiKey").value = cfg.arena_api_key_masked;
  }
  el("arenaGatewayUrl").value = cfg.arena_gateway_url || "https://api.preview.arena.ai";
  populateModelDropdown(data.default_models || [], cfg.arena_model);

  populateVoiceCharacterDropdown(data.voice_profiles || [], cfg.voice_character || "wise_elder");
  const engVal = cfg.tts_engine && cfg.tts_engine !== "auto" && cfg.tts_engine !== "edge" ? cfg.tts_engine : "sage_neural";
  el("ttsEngine").value = engVal;
  el("browserVoiceSelect").value = cfg.browser_voice || "de_DE-thorsten-high";
  el("voiceDepth").value = cfg.voice_depth_semitones ?? -2.6;
  el("voiceDepthLabel").textContent = `${Number(el("voiceDepth").value).toFixed(1)} Halbtöne`;
  el("voiceWarmth").value = cfg.voice_warmth_db ?? 4.8;
  el("voiceWarmthLabel").textContent = `+${Number(el("voiceWarmth").value).toFixed(1)} dB`;
  el("voiceRate").value = cfg.voice_rate_pct ?? -16;
  el("voiceRateLabel").textContent = `${el("voiceRate").value}%`;
  el("voiceReverb").checked = cfg.voice_reverb !== false;
  syncVoiceUiVisibility();

  populateMusicDropdown(data.music_presets || [], cfg.music_preset || "dark_cosmos_cinematic");
  el("musicVolume").value = cfg.music_volume_db ?? -17;
  el("musicVolumeLabel").textContent = `${el("musicVolume").value} dB`;
  if (el("sceneImageModeSelect")) {
    el("sceneImageModeSelect").value = cfg.scene_image_mode || "auto_ai_brand";
  }

  el("includeIntro").checked = cfg.include_brand_intro !== false;
  el("includeOutro").checked = cfg.include_brand_outro !== false;
  el("includeWatermark").checked = cfg.include_watermark !== false;
  el("includeSubtitles").checked = cfg.include_subtitles !== false;
  el("includeGlitchSfx").checked = cfg.include_glitch_sfx !== false;
  el("editorialMode").value = cfg.editorial_mode || "fakten_mystery";

  updateUsageHeader(cfg);
  renderTopicSuggestions(data.topic_suggestions || []);
  renderHistory(data.history || []);

  if (data.topic_suggestions?.length) {
    const rndIdx = Math.floor(Math.random() * data.topic_suggestions.length);
    const pick = data.topic_suggestions[rndIdx];
    el("topicInput").value = pick.topic;
    await runResearchAndScript({ silentInit: true });
  }
}

function populateVoiceCharacterDropdown(profiles, selectedId) {
  const sel = el("voiceCharacterSelect");
  if (!sel || !profiles.length) return;
  sel.innerHTML = "";
  for (const p of profiles) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name || p.id;
    opt.dataset.description = p.description || "";
    opt.dataset.rate = String(p.default_rate_pct ?? -16);
    opt.dataset.depth = String(p.default_depth_semitones ?? -2.6);
    opt.dataset.warmth = String(p.default_warmth_db ?? 4.8);
    opt.dataset.browserVoice = p.browser_voice || "de_DE-thorsten-high";
    sel.appendChild(opt);
  }
  const target = [...sel.options].some((o) => o.value === selectedId) ? selectedId : "wise_elder";
  sel.value = target;
  updateVoiceCharacterHint();
}

function updateVoiceCharacterHint() {
  const sel = el("voiceCharacterSelect");
  const hint = el("voiceCharacterHint");
  if (!sel || !hint) return;
  const opt = sel.options[sel.selectedIndex];
  if (opt?.dataset?.description) {
    hint.textContent = opt.dataset.description;
  }
}

function syncVoiceUiVisibility() {
  const charVal = el("voiceCharacterSelect")?.value || "wise_elder";
  const engVal = el("ttsEngine")?.value || "sage_neural";
  const showEleven = charVal === "elevenlabs_custom" || engVal === "elevenlabs";
  if (el("elevenlabsExtra")) el("elevenlabsExtra").classList.toggle("hidden", !showEleven);
  if (el("browserVoiceRow")) el("browserVoiceRow").classList.toggle("hidden", engVal !== "browser_neural");
}

function populateMusicDropdown(presets, selectedId) {
  const sel = el("musicPreset");
  if (!sel || !presets.length) return;
  sel.innerHTML = "";
  for (const p of presets) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.label || p.id;
    opt.dataset.mood = p.mood || "";
    sel.appendChild(opt);
  }
  const target = [...sel.options].some((o) => o.value === selectedId) ? selectedId : "dark_cosmos_cinematic";
  sel.value = target;
  updateMusicMoodLabel();
}

function updateMusicMoodLabel() {
  const sel = el("musicPreset");
  const hint = el("musicMoodHint");
  if (!sel || !hint) return;
  const activeOpt = sel.options[sel.selectedIndex];
  hint.textContent = activeOpt?.dataset?.mood || "";
}

function populateModelDropdown(models, selectedId) {
  const sel = el("arenaModel");
  sel.innerHTML = "";
  for (const m of models) {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.name || m.id;
    sel.appendChild(opt);
  }
  if (selectedId && [...sel.options].some((o) => o.value === selectedId)) {
    sel.value = selectedId;
  }
}

function renderTopicSuggestions(items) {
  const wrap = el("topicChips");
  wrap.innerHTML = "";
  for (const item of items) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "topic-chip";
    btn.textContent = `[${item.pillar}] ${item.title}`;
    btn.addEventListener("click", () => {
      el("topicInput").value = item.topic;
      el("pillarSelect").value = item.pillar;
      el("editorialMode").value = item.mode || "fakten_mystery";
    });
    wrap.appendChild(btn);
  }
}

function renderDossier(dossier) {
  if (!dossier) return;
  state.dossier = dossier;
  el("dossierCard").classList.remove("hidden");
  el("dossierHeadline").textContent = dossier.headline_angle || dossier.topic;
  el("dossierPillarBadge").textContent = dossier.pillar || "AuronOrigin";

  const fList = el("dossierFactsList");
  fList.innerHTML = "";
  for (const f of dossier.verified_facts || []) {
    const li = document.createElement("li");
    li.textContent = f;
    fList.appendChild(li);
  }

  const mList = el("dossierMysteryList");
  mList.innerHTML = "";
  for (const m of dossier.mystery_interpretation || []) {
    const li = document.createElement("li");
    li.textContent = m;
    mList.appendChild(li);
  }

  const sWrap = el("dossierSourcesList");
  sWrap.innerHTML = "";
  for (const s of dossier.sources || []) {
    const tag = document.createElement(s.url ? "a" : "span");
    tag.className = "source-chip";
    tag.textContent = `${s.kind}: ${s.title.slice(0, 46)}${s.title.length > 46 ? "…" : ""}`;
    if (s.url) {
      tag.href = s.url;
      tag.target = "_blank";
      tag.rel = "noopener noreferrer";
    }
    sWrap.appendChild(tag);
  }
}

// Concurrency-limited motif preview loader (prevents HTTP socket queuing even with 20+ scenes)
function pumpPreviewQueue() {
  while (state.activePreviews < 2 && state.previewQueue.length > 0) {
    const job = state.previewQueue.shift();
    state.activePreviews++;
    job().finally(() => {
      state.activePreviews--;
      pumpPreviewQueue();
    });
  }
}

function fetchMotifPreviewUrl(sc, videoFormat) {
  const customImageId = sc.custom_image_id;
  if (customImageId) {
    return Promise.resolve(`/api/uploads/${encodeURIComponent(customImageId)}`);
  }

  if (!sc.visual_seed) {
    sc.visual_seed = Math.floor(100000 + Math.random() * 98000000);
  }
  const imgMode = el("sceneImageModeSelect")?.value || "auto_ai_brand";
  const motif = sc.visual_motif || "solar_eclipse_crown";
  const promptEn = sc.image_prompt_en || "";
  const key = `${motif}|${videoFormat}|${sc.visual_seed}|${imgMode}|${promptEn.slice(0, 64)}`;

  if (state.motifCache.has(key)) {
    return Promise.resolve(state.motifCache.get(key));
  }

  return new Promise((resolve) => {
    state.previewQueue.push(async () => {
      if (state.motifCache.has(key)) {
        resolve(state.motifCache.get(key));
        return;
      }
      try {
        const resp = await fetch("/api/preview-motif", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visual_motif: motif,
            video_format: videoFormat,
            visual_seed: sc.visual_seed,
            image_prompt_en: promptEn,
            scene_image_mode: imgMode,
            custom_image_id: null,
          }),
        });
        if (!resp.ok) {
          resolve("/brand-assets/watermark_clean.png");
          return;
        }
        const blob = await resp.blob();
        const objUrl = URL.createObjectURL(blob);
        state.motifCache.set(key, objUrl);
        resolve(objUrl);
      } catch (_) {
        resolve("/brand-assets/watermark_clean.png");
      }
    });
    pumpPreviewQueue();
  });
}

function updateEstimatedStats() {
  if (!state.blueprint) return;
  const scenes = state.blueprint.scenes || [];
  el("sceneCountBadge").textContent = String(scenes.length);
  let words = 0;
  let pauses = 0;
  for (const sc of scenes) {
    words += (sc.narration || "").trim().split(/\s+/).filter(Boolean).length;
    pauses += Number(sc.pause_after || 1.0);
  }
  const stingerSec = el("includeIntro").checked && scenes.length >= 2 ? 2.2 : 0;
  const outroSec = el("includeOutro").checked ? 5.5 : 0;
  const est = Math.round(words / 1.92 + pauses + stingerSec + outroSec);
  if (est >= 90) {
    const mins = Math.floor(est / 60);
    const secs = est % 60;
    el("estDurationBadge").textContent = `${mins} Min. ${secs} Sek.`;
  } else {
    el("estDurationBadge").textContent = `${est} Sek.`;
  }
}

function syncBlueprintFromDom() {
  if (!state.blueprint) return null;
  state.blueprint.title = el("videoTitleInput").value.trim() || state.blueprint.title;
  state.blueprint.thumbnail_text = el("thumbTextInput").value.trim().toUpperCase() || "DER CODE";
  state.blueprint.thumbnail_subtext = el("thumbSubInput").value.trim().toUpperCase();
  state.blueprint.video_format = el("videoFormat").value;
  state.blueprint.editorial_mode = el("editorialMode").value;
  if (el("pillarSelect").value) {
    state.blueprint.pillar = el("pillarSelect").value;
  }
  (state.blueprint.scenes || []).forEach((sc, idx) => {
    sc.scene_number = idx + 1;
  });
  return state.blueprint;
}

async function uploadImageBlobToBackend(fileOrBlob, fallbackName = "szene_bild.jpg") {
  const fd = new FormData();
  const fname = fileOrBlob.name || fallbackName;
  fd.append("file", fileOrBlob, fname);
  fd.append("kind", "image");
  const resp = await fetch("/api/upload/media", { method: "POST", body: fd });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) {
    throw new Error(data.detail || `Bild-Upload fehlgeschlagen (HTTP ${resp.status}).`);
  }
  return data;
}

async function uploadImageSourceToBackend(sourceStr) {
  const resp = await fetch("/api/upload/from-source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: sourceStr }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) {
    throw new Error(data.detail || `Quelle konnte nicht geladen werden (HTTP ${resp.status}).`);
  }
  return data;
}

function applyCustomImageToSceneUI(sc, card, uploadResult) {
  sc.custom_image_id = uploadResult.file_id;
  sc.custom_image_name = uploadResult.original_name || uploadResult.file_id;

  const thumbImg = card.querySelector(".scene-motif-thumb");
  const statusEl = card.querySelector(".scene-img-status");
  const clearBtn = card.querySelector(".scene-clear-img-btn");

  card.classList.add("has-custom-img");
  thumbImg.src = `${uploadResult.preview_url || `/api/uploads/${uploadResult.file_id}`}?t=${Date.now()}`;
  statusEl.textContent = `✓ ${sc.custom_image_name}`;
  statusEl.title = `Eigenes Bild aktiv: ${sc.custom_image_name}`;
  statusEl.classList.add("custom-active");
  clearBtn.classList.remove("hidden");
}

async function clearCustomImageOnSceneUI(sc, card) {
  sc.custom_image_id = "";
  sc.custom_image_name = "";

  const thumbImg = card.querySelector(".scene-motif-thumb");
  const statusEl = card.querySelector(".scene-img-status");
  const clearBtn = card.querySelector(".scene-clear-img-btn");

  card.classList.remove("has-custom-img");
  statusEl.textContent = `Auto-Unikat #${String(sc.visual_seed || "").slice(-4)}`;
  statusEl.title = "Automatisch generiertes AuronOrigin-Szenenbild (Dunkelblau & Gold)";
  statusEl.classList.remove("custom-active");
  clearBtn.classList.add("hidden");
  thumbImg.src = await fetchMotifPreviewUrl(sc, state.blueprint?.video_format || "9:16");
}

function buildSceneCardElement(sc, idx, bp) {
  if (!sc.visual_seed) {
    sc.visual_seed = Math.floor(100000 + Math.random() * 98000000);
  }
  const card = document.createElement("div");
  card.className = `scene-card${sc.custom_image_id ? " has-custom-img" : ""}`;
  card.dataset.sceneIndex = String(idx);

  const motifs = state.bootstrap?.visual_motifs || [];
  const motifOpts = motifs
    .map((m) => `<option value="${m.id}" ${m.id === sc.visual_motif ? "selected" : ""}>${m.label}</option>`)
    .join("");

  const motions = [
    ["zoom_in", "Kamera: Langsamer Zoom-In"],
    ["zoom_out", "Kamera: Kosmischer Zoom-Out"],
    ["pan_up", "Kamera: Aufwärtsschwenk"],
    ["drift_right", "Kamera: Sanfter Seitwärts-Drift"],
  ]
    .map(([v, lbl]) => `<option value="${v}" ${v === sc.camera_motion ? "selected" : ""}>${lbl}</option>`)
    .join("");

  const hasCustom = Boolean(sc.custom_image_id);
  const statusLabel = hasCustom
    ? `✓ ${sc.custom_image_name || "Eigenes Bild"}`
    : `Auto-Unikat #${String(sc.visual_seed).slice(-4)}`;

  card.innerHTML = `
    <div class="scene-preview-col">
      <img class="scene-motif-thumb" alt="Szene ${idx + 1}" title="Klicken zum Hochladen eines eigenen Bildes (oder per Drag & Drop ziehen)" />
      <input type="file" class="visually-hidden-file scene-img-input" />
      <div class="scene-img-btn-row">
        <button type="button" class="btn btn-secondary btn-xs sc-regen-img-btn" title="Neues einzigartiges AuronOrigin-Bild (Gold & Dunkelblau) für diese Szene generieren">🎲 Neu</button>
        <button type="button" class="btn btn-secondary btn-xs sc-pick-file-btn" title="Eigenes Bild über den Browser auswählen">📷 Datei</button>
        <button type="button" class="btn btn-secondary btn-xs sc-pick-any-btn" title="Eigenes Bild von PC-Ordner, USB-Laufwerk (/media, /mnt) oder Web-URL wählen">🗂️ PC/URL</button>
      </div>
      <div class="scene-img-status ${hasCustom ? "custom-active" : ""}" title="${escapeAttr(statusLabel)}">${escapeHtml(statusLabel)}</div>
      <button type="button" class="btn btn-ghost btn-xs scene-clear-img-btn ${hasCustom ? "" : "hidden"}" title="Eigenes Bild entfernen und generiertes AuronOrigin-Bild nutzen">↺ Auto-Bild</button>
    </div>
    <div class="scene-fields-col">
      <div class="scene-top-row">
        <span class="scene-num-pill">SZENE ${idx + 1}</span>
        <input type="text" class="sc-headline" value="${escapeAttr(sc.on_screen_headline || "")}" placeholder="DEUTSCHER CINZEL TITEL" />
        <input type="text" class="sc-badge" value="${escapeAttr(sc.fact_badge || "FAKT")}" placeholder="FAKT / DEUTUNG" title="Badge oben links" />
        <select class="sc-motif">${motifOpts}</select>
        <select class="sc-motion">${motions}</select>
        <div class="scene-row-actions">
          <button type="button" class="btn btn-ghost btn-xs sc-move-up" title="Szene nach oben schieben">↑</button>
          <button type="button" class="btn btn-ghost btn-xs sc-move-down" title="Szene nach unten schieben">↓</button>
          <button type="button" class="btn btn-ghost btn-xs sc-insert-after" title="Neue Szene direkt darunter einfügen">+</button>
          <button type="button" class="btn btn-ghost btn-xs sc-delete" title="Szene entfernen">✕</button>
        </div>
      </div>
      <textarea rows="2" class="sc-narration" placeholder="100 % deutscher Sprechertext dieser Szene…">${escapeHtml(sc.narration || "")}</textarea>
    </div>
  `;

  const thumbImg = card.querySelector(".scene-motif-thumb");
  const fileInput = card.querySelector(".scene-img-input");
  const regenImgBtn = card.querySelector(".sc-regen-img-btn");
  const pickFileBtn = card.querySelector(".sc-pick-file-btn");
  const pickAnyBtn = card.querySelector(".sc-pick-any-btn");
  const clearImgBtn = card.querySelector(".scene-clear-img-btn");
  const statusEl = card.querySelector(".scene-img-status");

  fetchMotifPreviewUrl(sc, bp.video_format || "9:16").then((u) => {
    thumbImg.src = u;
  });

  regenImgBtn.addEventListener("click", async () => {
    sc.custom_image_id = "";
    sc.custom_image_name = "";
    sc.visual_seed = Math.floor(100000 + Math.random() * 98000000);
    card.classList.remove("has-custom-img");
    clearImgBtn.classList.add("hidden");
    statusEl.classList.remove("custom-active");
    statusEl.textContent = "⏳ Generiere…";
    thumbImg.src = await fetchMotifPreviewUrl(sc, bp.video_format || "9:16");
    statusEl.textContent = `Auto-Unikat #${String(sc.visual_seed).slice(-4)}`;
  });

  const openNativeFilePicker = () => {
    // Always clear previous value so picking even the same filename fires 'change' every single time
    fileInput.value = "";
    fileInput.click();
  };

  pickFileBtn.addEventListener("click", openNativeFilePicker);
  thumbImg.addEventListener("click", openNativeFilePicker);

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    statusEl.textContent = "⏳ Lade Bild…";
    try {
      const res = await uploadImageBlobToBackend(file);
      applyCustomImageToSceneUI(sc, card, res);
    } catch (err) {
      statusEl.textContent = "⚠️ Fehler (nutze 🗂️ PC/URL)";
      alert(
        `Bild für Szene ${idx + 1} konnte über den Browser-Dialog nicht gelesen werden:\n${err.message}\n\n` +
        `Tipp für Ubuntu (Snap-Browser): Klicke auf „🗂️ PC / URL“, um Bilder direkt von jedem Ordner oder Laufwerk zu laden!`
      );
    } finally {
      fileInput.value = "";
    }
  });

  pickAnyBtn.addEventListener("click", () => {
    openUniversalImageModal(idx);
  });

  clearImgBtn.addEventListener("click", async () => {
    await clearCustomImageOnSceneUI(sc, card);
  });

  // Drag & Drop support (files from file manager OR image URLs/files dragged from browser)
  card.addEventListener("dragover", (e) => {
    e.preventDefault();
    card.classList.add("drag-over");
  });
  card.addEventListener("dragleave", () => {
    card.classList.remove("drag-over");
  });
  card.addEventListener("drop", async (e) => {
    e.preventDefault();
    card.classList.remove("drag-over");

    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      statusEl.textContent = "⏳ Lade Drop-Bild…";
      try {
        const res = await uploadImageBlobToBackend(droppedFile);
        applyCustomImageToSceneUI(sc, card, res);
      } catch (err) {
        statusEl.textContent = "⚠️ Fehler beim Laden";
        alert(`Drag & Drop Fehler bei Szene ${idx + 1}: ${err.message}`);
      }
      return;
    }

    const uriText = (e.dataTransfer?.getData("text/uri-list") || e.dataTransfer?.getData("text/plain") || "").trim();
    if (uriText) {
      const firstLine = uriText.split(/\r?\n/)[0].trim();
      statusEl.textContent = "⏳ Lade Quelle…";
      try {
        const res = await uploadImageSourceToBackend(firstLine);
        applyCustomImageToSceneUI(sc, card, res);
      } catch (err) {
        statusEl.textContent = "⚠️ Fehler beim Laden";
        alert(`Konnte gezogene Quelle für Szene ${idx + 1} nicht laden: ${err.message}`);
      }
    }
  });

  // Clipboard Paste (STRG+V) support directly on any scene card
  card.addEventListener("paste", async (e) => {
    const items = e.clipboardData?.items || [];
    for (const item of items) {
      if (item.type && item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (!blob) return;
        statusEl.textContent = "⏳ Füge Bild ein…";
        try {
          const res = await uploadImageBlobToBackend(blob, `zwischenablage_szene_${idx + 1}.png`);
          applyCustomImageToSceneUI(sc, card, res);
        } catch (err) {
          alert(`Zwischenablage-Bild Fehler: ${err.message}`);
        }
        return;
      }
    }
  });

  card.querySelector(".sc-headline").addEventListener("input", (e) => {
    sc.on_screen_headline = e.target.value.toUpperCase();
  });
  card.querySelector(".sc-badge").addEventListener("input", (e) => {
    sc.fact_badge = e.target.value.toUpperCase();
  });
  card.querySelector(".sc-motif").addEventListener("change", async (e) => {
    sc.visual_motif = e.target.value;
    sc.visual_seed = Math.floor(100000 + Math.random() * 98000000);
    if (!sc.custom_image_id) {
      statusEl.textContent = "⏳ Generiere…";
      thumbImg.src = await fetchMotifPreviewUrl(sc, bp.video_format || "9:16");
      statusEl.textContent = `Auto-Unikat #${String(sc.visual_seed).slice(-4)}`;
    }
  });
  card.querySelector(".sc-motion").addEventListener("change", (e) => {
    sc.camera_motion = e.target.value;
  });
  card.querySelector(".sc-narration").addEventListener("input", (e) => {
    sc.narration = e.target.value;
    updateEstimatedStats();
  });

  card.querySelector(".sc-move-up").addEventListener("click", () => {
    if (idx <= 0) return;
    const tmp = bp.scenes[idx - 1];
    bp.scenes[idx - 1] = bp.scenes[idx];
    bp.scenes[idx] = tmp;
    renderBlueprintEditor(bp);
  });

  card.querySelector(".sc-move-down").addEventListener("click", () => {
    if (idx >= bp.scenes.length - 1) return;
    const tmp = bp.scenes[idx + 1];
    bp.scenes[idx + 1] = bp.scenes[idx];
    bp.scenes[idx] = tmp;
    renderBlueprintEditor(bp);
  });

  card.querySelector(".sc-insert-after").addEventListener("click", () => {
    bp.scenes.splice(idx + 1, 0, {
      scene_number: idx + 2,
      phase: "VERTIEFUNG",
      fact_badge: "FAKT",
      on_screen_headline: `SZENE ${idx + 2}`,
      on_screen_subline: "AuronOrigin Analyse",
      narration: "Hier kannst du deinen gesprochenen Text für diese Szene eintragen.",
      pause_after: 0.85,
      visual_motif: "ouroboros_seal",
      camera_motion: "zoom_in",
      glitch_transition: true,
      custom_image_id: "",
      custom_image_name: "",
    });
    renderBlueprintEditor(bp);
  });

  card.querySelector(".sc-delete").addEventListener("click", () => {
    if (bp.scenes.length <= 2) {
      alert("Ein Video sollte mindestens 2 Szenen besitzen.");
      return;
    }
    bp.scenes.splice(idx, 1);
    renderBlueprintEditor(bp);
  });

  return card;
}

async function renderBlueprintEditor(bp) {
  state.blueprint = bp;
  el("videoTitleInput").value = bp.title || "";
  el("thumbTextInput").value = bp.thumbnail_text || "";
  el("thumbSubInput").value = bp.thumbnail_subtext || "";

  const container = el("scenesContainer");
  container.innerHTML = "";

  (bp.scenes || []).forEach((sc, idx) => {
    sc.scene_number = idx + 1;
    const card = buildSceneCardElement(sc, idx, bp);
    container.appendChild(card);
  });

  updateEstimatedStats();
  scheduleSocialPreviewRefresh();
}

function scheduleSocialPreviewRefresh() {
  if (state.socialPreviewTimer) clearTimeout(state.socialPreviewTimer);
  state.socialPreviewTimer = setTimeout(async () => {
    if (!state.blueprint?.scenes?.length) return;
    try {
      const bpSnap = {
        ...state.blueprint,
        title: el("videoTitleInput")?.value?.trim() || state.blueprint.title,
        thumbnail_text: el("thumbTextInput")?.value?.trim() || state.blueprint.thumbnail_text,
        thumbnail_subtext: el("thumbSubInput")?.value?.trim() || state.blueprint.thumbnail_subtext,
      };
      const resp = await fetch("/api/social-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint: bpSnap }),
      });
      const data = await resp.json();
      if (data?.ok && data.social_suite) {
        populateSocialPublishingSuite(data.social_suite, false);
      }
    } catch (_) {}
  }, 220);
}

function populateSocialPublishingSuite(suite, isExactRender = false) {
  if (!suite) return;
  const yt = suite.youtube || {};
  const tt = suite.tiktok || {};
  const ig = suite.instagram || {};
  const fb = suite.facebook || {};

  const setVal = (id, v) => {
    const node = el(id);
    if (node) node.value = v || "";
  };

  // YouTube
  setVal("ytMainTitle", yt.title);
  setVal("seoAltTitles", (yt.alt_titles || []).join("\n"));
  setVal("seoDescription", yt.description);
  setVal("seoPinnedComment", yt.pinned_comment);
  setVal("ytTagsCsv", yt.tags_csv);
  setVal("ytQuizBlock", yt.quiz_copy_paste);
  setVal("ytEndScreenBlock", yt.end_screen_copy_paste);
  setVal("seoTagsAndPoll", yt.community_poll_copy_paste);
  setVal("ytChecklistBlock", yt.upload_checklist);

  // TikTok
  setVal("ttCoverHeadline", tt.cover_headline);
  setVal("ttCaption", tt.caption);
  setVal("ttSearchKeywords", tt.search_seo_keywords);
  setVal("ttFirstComment", tt.first_comment);
  setVal(
    "ttSoundAndSeries",
    `Originalton: ${tt.original_sound_name || ""}\nSerie / Playlist: ${tt.series_name || ""}`
  );
  setVal("ttChecklist", tt.upload_checklist);

  // Instagram
  setVal("igCaption", ig.caption);
  setVal("igAltText", ig.alt_text);
  setVal("igPinnedComment", ig.pinned_comment);
  setVal("igPollBlock", ig.reel_poll_copy_paste);
  setVal(
    "igAudioAndTopics",
    `Original-Audio Name: ${ig.original_audio_name || ""}\n3 Themen hinzufügen (Add Topics): ${ig.recommended_topics || ""}`
  );
  setVal("igChecklist", ig.upload_checklist);

  // Facebook
  setVal("fbVideoTitle", fb.video_title);
  setVal("fbAbTitle", fb.ab_test_title);
  setVal("fbDescription", fb.description);
  setVal("fbFirstComment", fb.first_comment);
  setVal("fbAltText", fb.alt_text);
  setVal("fbChecklist", fb.upload_checklist);

  const badge = el("socialSyncBadge");
  if (badge) {
    badge.innerHTML = isExactRender
      ? "✅ <strong>Sekundengenau mit dem fertig gerenderten MP4-Video synchronisiert</strong> (exakte Kapitel, Quiz-Zeitstempel & Abspann-Zeitfenster)."
      : "⚡ <strong>Live-Vorschau aus deinem aktuellen Skript</strong> – alle Texte, YouTube-Quiz & Abspann sind sofort kopierfertig (nach dem Rendern werden Zeitstempel exakt ans MP4 angepasst).";
  }
}

function selectPlatformCover(coverKey) {
  const res = state.activeRenderResult;
  if (!res) return;
  state.activeCoverKey = coverKey;

  document.querySelectorAll("[data-cover-key]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-cover-key") === coverKey);
  });

  const coverUrls = res.cover_urls || {};
  const coversMeta = res.covers || {};
  const url = coverUrls[coverKey] || res.thumbnail_url;
  const info = coversMeta[coverKey] || { label: "YouTube Thumbnail (1280×720)" };

  if (url) {
    el("finalThumbnailImg").src = `${url}?t=${Date.now()}`;
    if (el("downloadActiveCoverBtn")) {
      el("downloadActiveCoverBtn").href = url;
    }
  }
  if (el("activeCoverHint")) {
    el("activeCoverHint").innerHTML =
      `<strong>${escapeHtml(info.label || coverKey)}</strong> – High-CTR &amp; Safe-Zone optimiert. Alle 9 Cover (inkl. YouTube A/B/C Test-Thumbnails) liegen im <code>.ZIP</code>-Paket unter <code>02_Covers_und_Thumbnails/</code>.`;
  }
}

// Universal PC-Folder & URL Picker Modal Logic
async function loadLocalBrowserDirectory(dirPath = "") {
  const listWrap = el("modalFileList");
  listWrap.innerHTML = `<div class="muted-note" style="padding:0.6rem;">Lade Ordnerinhalt…</div>`;
  try {
    const resp = await fetch("/api/local-browser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directory: dirPath || null }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      throw new Error(data.detail || "Ordner konnte nicht geöffnet werden.");
    }

    state.modalCurrentDir = data.current_dir;
    state.modalParentDir = data.parent_dir;
    el("modalCurrentDirInput").value = data.current_dir;

    const scWrap = el("modalShortcuts");
    scWrap.innerHTML = "";
    for (const scItem of data.shortcuts || []) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "topic-chip";
      b.textContent = scItem.label;
      b.addEventListener("click", () => loadLocalBrowserDirectory(scItem.path));
      scWrap.appendChild(b);
    }

    listWrap.innerHTML = "";
    const dirs = data.directories || [];
    const files = data.files || [];

    if (!dirs.length && !files.length) {
      listWrap.innerHTML = `<div class="muted-note" style="padding:0.7rem;">Keine Unterordner oder Bilder in diesem Verzeichnis gefunden.</div>`;
      return;
    }

    for (const d of dirs) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "browser-entry";
      row.innerHTML = `<span>📁 ${escapeHtml(d.name)}</span><span class="browser-entry-meta">Ordner öffnen →</span>`;
      row.addEventListener("click", () => loadLocalBrowserDirectory(d.path));
      listWrap.appendChild(row);
    }

    for (const f of files) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "browser-entry";
      row.innerHTML = `<span>🖼️ ${escapeHtml(f.name)}</span><span class="browser-entry-meta">${f.size_kb} KB • Auswählen</span>`;
      row.addEventListener("click", async () => {
        await applySourceForModalScene(f.path);
      });
      listWrap.appendChild(row);
    }
  } catch (err) {
    listWrap.innerHTML = `<div class="muted-note" style="padding:0.7rem;color:#e74c3c;">${escapeHtml(err.message)}</div>`;
  }
}

function openUniversalImageModal(sceneIdx) {
  state.modalTargetSceneIndex = sceneIdx;
  el("modalSceneTitle").textContent = `Eigenes Bild wählen für Szene ${sceneIdx + 1}`;
  el("modalSourceInput").value = "";
  el("imageSourceModal").classList.remove("hidden");
  loadLocalBrowserDirectory(state.modalCurrentDir || "");
}

function closeUniversalImageModal() {
  el("imageSourceModal").classList.add("hidden");
  state.modalTargetSceneIndex = null;
}

async function applySourceForModalScene(sourceStr) {
  const idx = state.modalTargetSceneIndex;
  if (idx === null || !state.blueprint?.scenes?.[idx]) return;

  const btn = el("modalApplySourceBtn");
  const prevTxt = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Lade…";
  try {
    const res = await uploadImageSourceToBackend(sourceStr);
    const sc = state.blueprint.scenes[idx];
    const cards = el("scenesContainer").querySelectorAll(".scene-card");
    const targetCard = cards[idx];
    if (targetCard) {
      applyCustomImageToSceneUI(sc, targetCard, res);
    } else {
      sc.custom_image_id = res.file_id;
      sc.custom_image_name = res.original_name || res.file_id;
      await renderBlueprintEditor(state.blueprint);
    }
    closeUniversalImageModal();
  } catch (err) {
    alert(`Bild konnte nicht übernommen werden:\n${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = prevTxt;
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

async function runResearchAndScript({ silentInit = false, autoDiscover = false } = {}) {
  const rawInput = autoDiscover ? "" : el("topicInput").value.trim();

  const desiredScenes = Math.max(2, Math.min(30, Number(el("sceneCountInput").value || 6)));
  el("sceneCountInput").value = String(desiredScenes);

  try {
    if (!silentInit) {
      showWorkflowStatus(
        rawInput
          ? `Schritt 1/2: Recherchiere fokussiert das Einzel-Thema „${rawInput}“…`
          : "Schritt 1/2: Wähle automatisch genau EIN spannendes Einzel-Thema aus…",
        "Prüfe Hauptquelle & Hintergrund – strikt ein Thema ohne News-Mix…"
      );
    }

    const browserSources = silentInit || !rawInput ? [] : await fetchLiveBrowserSources(rawInput);

    const resResp = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: rawInput,
        pillar: el("pillarSelect").value || null,
        editorial_mode: el("editorialMode").value,
        browser_sources: browserSources,
        arena_api_key: el("arenaApiKey").value.trim() || null,
        arena_gateway_url: el("arenaGatewayUrl").value,
        arena_model: el("arenaModel").value,
      }),
    });
    const resData = await resResp.json();
    if (!resResp.ok || !resData.ok) {
      throw new Error(resData.detail || "Recherche fehlgeschlagen.");
    }

    const resolvedTopic = resData.dossier?.topic || rawInput || "Quantenphysik & das Rätsel der Raumzeit";
    if (!rawInput || autoDiscover) {
      el("topicInput").value = resolvedTopic;
    }

    renderDossier(resData.dossier);
    updateUsageHeader(resData.settings);

    if (!silentInit) {
      showWorkflowStatus(
        `Schritt 2/2: Schreibe kurzes, verständliches Einzel-Thema-Skript (${desiredScenes} Szenen)…`,
        `100% Fokus: ${resolvedTopic.slice(0, 72)} • Modell: ${el("arenaModel").value}`
      );
    }

    let scriptResp = await fetch("/api/script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: resolvedTopic,
        dossier: resData.dossier,
        video_format: el("videoFormat").value,
        duration_target: el("durationTarget").value,
        scene_count: desiredScenes,
        editorial_mode: el("editorialMode").value,
        pillar: el("pillarSelect").value || resData.dossier.pillar,
        arena_api_key: el("arenaApiKey").value.trim() || null,
        arena_gateway_url: el("arenaGatewayUrl").value,
        arena_model: el("arenaModel").value,
      }),
    });
    let scriptData = await scriptResp.json();

    if (
      scriptData?.blueprint?.sandbox_network_restricted &&
      scriptData?.blueprint?.prompts_for_browser_router &&
      currentRawApiKey()
    ) {
      showWorkflowStatus(
        "Verbinde direkt über deinen Browser mit dem Arena Router…",
        "Sende deutschen AuronOrigin Showrunner-Prompt an Arena API…"
      );
      const p = scriptData.blueprint.prompts_for_browser_router;
      const direct = await tryBrowserDirectArenaRouter(p.system_prompt, p.user_prompt);
      if (direct?.text) {
        const normResp = await fetch("/api/script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: resolvedTopic,
            dossier: resData.dossier,
            video_format: el("videoFormat").value,
            duration_target: el("durationTarget").value,
            scene_count: desiredScenes,
            editorial_mode: el("editorialMode").value,
            pillar: el("pillarSelect").value || resData.dossier.pillar,
            arena_model: el("arenaModel").value,
            browser_raw_llm_text: direct.text,
            prompt_tokens: direct.prompt_tokens,
            completion_tokens: direct.completion_tokens,
          }),
        });
        const normData = await normResp.json();
        if (normData?.ok) {
          scriptData = normData;
        }
      }
    }

    if (scriptData?.ok && scriptData.blueprint) {
      await renderBlueprintEditor(scriptData.blueprint);
      updateUsageHeader(scriptData.settings);
      return scriptData.blueprint;
    }
    throw new Error("Skript konnte nicht erstellt werden.");
  } catch (err) {
    alert(`Fehler: ${err.message}`);
    return null;
  } finally {
    hideWorkflowStatus();
  }
}

async function synthesizeBrowserSceneAudioIfNeeded(scenes, progressCb) {
  const mode = el("ttsEngine").value;
  const charId = el("voiceCharacterSelect")?.value || "wise_elder";
  if (mode === "elevenlabs" || charId === "elevenlabs_custom") {
    return {};
  }

  // When 'sage_neural' is active, check whether backend neural TTS (Conrad/Florian/Killian) is reachable.
  // On Ubuntu PCs with internet, backend neural TTS runs directly so Browser-Thorsten NEVER overrides your chosen voice!
  if (mode === "sage_neural") {
    try {
      const probe = await fetch("/api/voice-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Auron bereit.",
          voice_character: charId,
          tts_engine: "sage_neural",
          voice_rate_pct: Number(el("voiceRate").value || -16),
          voice_depth_semitones: Number(el("voiceDepth").value || -2.6),
          voice_warmth_db: Number(el("voiceWarmth").value || 4.8),
          voice_reverb: el("voiceReverb").checked,
        }),
      });
      const ct = (probe.headers.get("content-type") || "").toLowerCase();
      if (probe.ok && ct.includes("audio/")) {
        return {};
      }
    } catch (_) {}
  }

  if (!window.AuronBrowserTTS?.synthesizeBrowserNeural) {
    return {};
  }

  const voiceId = el("browserVoiceSelect").value || "de_DE-thorsten-high";
  const ratePct = Number(el("voiceRate").value || -16);
  const lengthScaleOverride = 1.0 / Math.max(0.68, 1.0 + ratePct / 100.0);
  const uploadedMap = {};

  try {
    for (let i = 0; i < scenes.length; i++) {
      const text = (scenes[i].narration || "").trim();
      if (!text) continue;
      progressCb(
        Math.round(5 + ((i + 0.5) / scenes.length) * 28),
        `Erzeuge deutsche KI-Basisstimme + Alter-Weiser-Mastering für Szene ${i + 1}/${scenes.length}…`
      );
      const wavBlob = await window.AuronBrowserTTS.synthesizeBrowserNeural(
        { text, voiceId, lengthScaleOverride },
        (dl) => {
          if (dl.total > 0) {
            const mb = (dl.loaded / 1048576).toFixed(1);
            const tot = (dl.total / 1048576).toFixed(1);
            progressCb(8, `Lade deutsches KI-Sprachmodell einmalig (${mb} / ${tot} MB)…`);
          }
        }
      );
      const fd = new FormData();
      fd.append("file", wavBlob, `scene_${i + 1}.wav`);
      fd.append("kind", "audio");
      const up = await fetch("/api/upload/media", { method: "POST", body: fd });
      const upData = await up.json();
      if (upData.ok) {
        uploadedMap[String(i + 1)] = upData.file_id;
      }
    }
  } catch (err) {
    console.warn("Browser Neural TTS Hinweis (wechsle auf Backend-TTS):", err);
  }
  return uploadedMap;
}

async function runFullVideoRender() {
  const bp = syncBlueprintFromDom();
  if (!bp || !bp.scenes?.length) {
    alert("Bitte erstelle zuerst ein Skript oder gib oben ein Thema ein.");
    return;
  }

  const renderBtn = el("renderVideoBtn");
  const oneClickBtn = el("oneClickFullVideoBtn");
  renderBtn.disabled = true;
  oneClickBtn.disabled = true;

  const progBox = el("renderProgressBox");
  const progMsg = el("renderProgressMsg");
  const progPct = el("renderProgressPct");
  const progBar = el("renderProgressBar");
  progBox.classList.remove("hidden");

  const setProg = (pct, msg) => {
    progPct.textContent = `${pct}%`;
    progBar.style.width = `${pct}%`;
    progMsg.textContent = msg;
  };

  try {
    setProg(4, "Bereite deutsche Tonstimme & Audio-Mastering vor…");
    await saveCurrentSettingsQuietly();

    const uploadedSceneAudio = await synthesizeBrowserSceneAudioIfNeeded(bp.scenes, setProg);

    setProg(34, "Übergebe Szenen, eigene Bilder, Tonstimme & Soundtrack an die MP4-Render-Engine…");
    const startResp = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blueprint: bp,
        quality: el("renderQuality").value || "hd",
        uploaded_scene_audio: uploadedSceneAudio,
        custom_music_file_id: state.customMusicFileId,
        settings_override: gatherSettingsPayload(),
      }),
    });
    const startData = await startResp.json();
    if (!startResp.ok || !startData.ok) {
      throw new Error(startData.detail || "Render-Start fehlgeschlagen.");
    }

    const jobId = startData.job_id;
    while (true) {
      await new Promise((r) => setTimeout(r, 900));
      const pollResp = await fetch(`/api/jobs/${jobId}`);
      const pollData = await pollResp.json();
      const job = pollData.job;
      if (!job) break;

      const mappedPct = Math.max(35, job.progress || 35);
      setProg(mappedPct, job.message || "Rendere Video…");

      if (job.status === "completed" && job.result) {
        setProg(100, "Fertiggestellt! Dein YouTube-Video steht unten bereit.");
        displayCompletedResult(job.result);
        const bootResp = await fetch("/api/bootstrap");
        const bootData = await bootResp.json();
        renderHistory(bootData.history || []);
        el("outputCard").scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      }
      if (job.status === "failed") {
        throw new Error(job.error || job.message || "Unbekannter Render-Fehler.");
      }
    }
  } catch (err) {
    alert(`Video-Produktion fehlgeschlagen: ${err.message}`);
  } finally {
    renderBtn.disabled = false;
    oneClickBtn.disabled = false;
  }
}

function displayCompletedResult(res) {
  state.activeRenderResult = res;
  const outCard = el("outputCard");
  outCard.classList.remove("hidden");

  el("outputVideoTitle").textContent = res.title || "Fertiges AuronOrigin Video";
  el("outputTechMeta").textContent =
    `Säule: ${res.pillar} • Format: ${res.video_format} (${res.resolution}) • Länge: ${res.duration_sec} Sek. • Tonstimme: ${(res.tts_engines_used || []).join(", ")}`;

  const cacheBust = `?t=${Date.now()}`;
  const videoEl = el("finalVideoPlayer");
  videoEl.src = res.video_url + cacheBust;
  videoEl.load();

  el("downloadMp4Btn").href = res.video_url;
  el("downloadVoiceBtn").href = res.voiceover_url;
  el("downloadSrtBtn").href = res.srt_url;
  if (el("downloadFbSrtBtn")) el("downloadFbSrtBtn").href = res.fb_srt_url || res.srt_url;
  if (el("downloadVttBtn")) el("downloadVttBtn").href = res.vtt_url || res.srt_url;
  if (el("downloadTxtBtn")) el("downloadTxtBtn").href = res.transcript_url || res.srt_url;
  el("downloadZipBtn").href = res.zip_url;

  const defaultCover = res.video_format === "9:16" ? "youtube_shorts_9x16" : "youtube_16x9";
  selectPlatformCover(res.cover_urls?.[defaultCover] ? defaultCover : "youtube_16x9");

  if (res.social_suite) {
    populateSocialPublishingSuite(res.social_suite, true);
  } else {
    scheduleSocialPreviewRefresh();
  }
}

function renderHistory(items) {
  const wrap = el("historyList");
  if (!items.length) {
    wrap.innerHTML = `<p class="muted-note">Noch keine gerenderten Videos vorhanden. Starte oben deine erste Produktion!</p>`;
    return;
  }
  wrap.innerHTML = "";
  for (const it of items) {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <strong>${escapeHtml(it.title || "AuronOrigin Video")}</strong>
      <span class="history-meta">${escapeHtml(it.pillar || "")} • ${escapeHtml(it.resolution || "")} • ${it.duration_sec || 0}s</span>
      <div class="download-strip">
        <a href="${it.video_url}" class="btn btn-gold btn-xs" download>MP4 laden</a>
        <a href="${it.zip_url}" class="btn btn-secondary btn-xs" download>ZIP-Paket</a>
        <button type="button" class="btn btn-ghost btn-xs hist-open-btn">Im Player öffnen</button>
      </div>
    `;
    div.querySelector(".hist-open-btn").addEventListener("click", async () => {
      const r = await fetch(`/api/jobs/${it.job_id}`);
      const d = await r.json();
      if (d?.job?.result) {
        displayCompletedResult(d.job.result);
        el("outputCard").scrollIntoView({ behavior: "smooth" });
      }
    });
    wrap.appendChild(div);
  }
}

function gatherSettingsPayload() {
  return {
    arena_api_key: el("arenaApiKey").value.trim(),
    arena_gateway_url: el("arenaGatewayUrl").value,
    arena_model: el("arenaModel").value,
    voice_character: el("voiceCharacterSelect")?.value || "wise_elder",
    tts_engine: el("ttsEngine").value,
    browser_voice: el("browserVoiceSelect").value,
    voice_rate_pct: Number(el("voiceRate").value),
    voice_depth_semitones: Number(el("voiceDepth")?.value ?? -2.6),
    voice_warmth_db: Number(el("voiceWarmth")?.value ?? 4.8),
    voice_reverb: el("voiceReverb").checked,
    elevenlabs_api_key: el("elevenlabsKey").value.trim() || undefined,
    elevenlabs_voice_id: el("elevenlabsVoiceId").value.trim() || undefined,
    music_preset: el("musicPreset").value,
    music_volume_db: Number(el("musicVolume").value),
    scene_image_mode: el("sceneImageModeSelect")?.value || "auto_ai_brand",
    include_brand_intro: el("includeIntro").checked,
    include_brand_outro: el("includeOutro").checked,
    include_watermark: el("includeWatermark").checked,
    include_subtitles: el("includeSubtitles").checked,
    include_glitch_sfx: el("includeGlitchSfx").checked,
    editorial_mode: el("editorialMode").value,
  };
}

async function saveCurrentSettingsQuietly() {
  const resp = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gatherSettingsPayload()),
  });
  const data = await resp.json();
  if (data.ok) updateUsageHeader(data.settings);
}

// Event Listeners
el("durationTarget").addEventListener("change", () => {
  const val = el("durationTarget").value;
  if (val === "short_60") {
    el("sceneCountInput").value = "6";
  } else if (val === "mid_180") {
    el("sceneCountInput").value = "8";
    el("videoFormat").value = "16:9";
  } else if (val === "long_300") {
    el("sceneCountInput").value = "10";
    el("videoFormat").value = "16:9";
  } else if (val === "docu_540") {
    el("sceneCountInput").value = "18";
    el("videoFormat").value = "16:9";
  }
});

el("videoFormat").addEventListener("change", () => {
  if (state.blueprint) {
    state.blueprint.video_format = el("videoFormat").value;
    renderBlueprintEditor(state.blueprint);
  }
});

el("toggleApiPanelBtn").addEventListener("click", () => {
  const body = el("apiPanelBody");
  const hidden = body.classList.toggle("hidden");
  el("toggleApiPanelBtn").textContent = hidden ? "Aufklappen" : "Einklappen";
});

el("toggleKeyVisBtn").addEventListener("click", () => {
  const inp = el("arenaApiKey");
  inp.type = inp.type === "password" ? "text" : "password";
});

el("verifyKeyBtn").addEventListener("click", async () => {
  const fb = el("apiVerifyFeedback");
  fb.textContent = "Prüfe Arena API-Key & lade verfügbare Router-Modelle…";
  const resp = await fetch("/api/arena/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      arena_api_key: el("arenaApiKey").value.trim(),
      arena_gateway_url: el("arenaGatewayUrl").value,
    }),
  });
  const data = await resp.json();
  if (data.models) {
    populateModelDropdown(data.models, el("arenaModel").value);
  }
  if (data.ok) {
    fb.textContent = `✓ ${data.message}`;
    el("routerStatusDot").classList.add("verified");
    el("routerStatusText").textContent = `Arena Router verbunden (${el("arenaModel").value})`;
  } else {
    fb.textContent = `⚠️ ${data.error || "Prüfung fehlgeschlagen."}`;
  }
});

if (el("voiceCharacterSelect")) {
  el("voiceCharacterSelect").addEventListener("change", () => {
    const sel = el("voiceCharacterSelect");
    const opt = sel.options[sel.selectedIndex];
    if (opt?.dataset) {
      if (opt.dataset.depth) {
        el("voiceDepth").value = opt.dataset.depth;
        el("voiceDepthLabel").textContent = `${Number(opt.dataset.depth).toFixed(1)} Halbtöne`;
      }
      if (opt.dataset.warmth) {
        el("voiceWarmth").value = opt.dataset.warmth;
        el("voiceWarmthLabel").textContent = `+${Number(opt.dataset.warmth).toFixed(1)} dB`;
      }
      if (opt.dataset.rate) {
        el("voiceRate").value = opt.dataset.rate;
        el("voiceRateLabel").textContent = `${opt.dataset.rate}%`;
      }
      if (opt.dataset.browserVoice && el("browserVoiceSelect")) {
        el("browserVoiceSelect").value = opt.dataset.browserVoice;
      }
    }
    updateVoiceCharacterHint();
    syncVoiceUiVisibility();
    saveCurrentSettingsQuietly();
  });
}

el("ttsEngine").addEventListener("change", () => {
  syncVoiceUiVisibility();
  saveCurrentSettingsQuietly();
});

if (el("voiceDepth")) {
  el("voiceDepth").addEventListener("input", () => {
    el("voiceDepthLabel").textContent = `${Number(el("voiceDepth").value).toFixed(1)} Halbtöne`;
  });
  el("voiceDepth").addEventListener("change", saveCurrentSettingsQuietly);
}

if (el("voiceWarmth")) {
  el("voiceWarmth").addEventListener("input", () => {
    el("voiceWarmthLabel").textContent = `+${Number(el("voiceWarmth").value).toFixed(1)} dB`;
  });
  el("voiceWarmth").addEventListener("change", saveCurrentSettingsQuietly);
}

el("voiceRate").addEventListener("input", () => {
  el("voiceRateLabel").textContent = `${el("voiceRate").value}%`;
});
el("voiceRate").addEventListener("change", saveCurrentSettingsQuietly);
el("voiceReverb").addEventListener("change", saveCurrentSettingsQuietly);

el("musicVolume").addEventListener("input", () => {
  el("musicVolumeLabel").textContent = `${el("musicVolume").value} dB`;
});

el("musicPreset").addEventListener("change", () => {
  const val = el("musicPreset").value;
  el("customMusicRow").classList.toggle("hidden", val !== "custom");
  updateMusicMoodLabel();
  const player = el("musicPreviewPlayer");
  if (!player.classList.contains("hidden") && val !== "none" && val !== "custom") {
    player.src = `/api/music-preview/${encodeURIComponent(val)}`;
    player.play().catch(() => {});
  } else if (val === "none") {
    player.pause();
    player.classList.add("hidden");
  }
});

el("customMusicInput").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", "audio");
  const r = await fetch("/api/upload/media", { method: "POST", body: fd });
  const d = await r.json();
  if (d.ok) {
    state.customMusicFileId = d.file_id;
    const player = el("musicPreviewPlayer");
    player.src = `/api/uploads/${encodeURIComponent(d.file_id)}`;
    player.classList.remove("hidden");
  }
});

el("previewMusicBtn").addEventListener("click", async () => {
  const preset = el("musicPreset").value;
  if (preset === "none") {
    alert("Aktuell ist „Keine Hintergrundmusik“ ausgewählt. Wähle oben einen Soundtrack zum Anhören aus.");
    return;
  }
  const player = el("musicPreviewPlayer");
  const expectedSrc =
    preset === "custom" && state.customMusicFileId
      ? `/api/uploads/${encodeURIComponent(state.customMusicFileId)}`
      : `/api/music-preview/${encodeURIComponent(preset)}`;

  if (preset === "custom" && !state.customMusicFileId) {
    alert("Bitte wähle zuerst eine eigene MP3/WAV-Datei aus.");
    return;
  }

  player.classList.remove("hidden");
  if (!player.src.endsWith(expectedSrc)) {
    player.src = expectedSrc;
    await player.play().catch(() => {});
  } else if (player.paused) {
    await player.play().catch(() => {});
  } else {
    player.pause();
  }
});

el("previewVoiceBtn").addEventListener("click", async () => {
  const btn = el("previewVoiceBtn");
  const sampleText =
    state.blueprint?.scenes?.[0]?.narration ||
    "Manche Wahrheiten liegen nicht im Verborgenen, weil niemand hinsieht … sondern weil wir verlernt haben, die Zeichen der Zeit in Ruhe zu deuten.";
  btn.disabled = true;
  btn.textContent = "⏳ Erzeuge Weiser-Stimme…";

  try {
    await saveCurrentSettingsQuietly();
    const charId = el("voiceCharacterSelect")?.value || "wise_elder";
    const ratePct = Number(el("voiceRate").value || -16);
    const depthSt = Number(el("voiceDepth")?.value ?? -2.6);
    const warmthDb = Number(el("voiceWarmth")?.value ?? 4.8);
    const reverbOn = el("voiceReverb").checked;

    const resp = await fetch("/api/voice-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: sampleText,
        voice_character: charId,
        tts_engine: el("ttsEngine").value,
        voice_rate_pct: ratePct,
        voice_depth_semitones: depthSt,
        voice_warmth_db: warmthDb,
        voice_reverb: reverbOn,
        elevenlabs_api_key: el("elevenlabsKey").value.trim() || undefined,
        elevenlabs_voice_id: el("elevenlabsVoiceId").value.trim() || undefined,
      }),
    });

    const ct = (resp.headers.get("content-type") || "").toLowerCase();
    let finalWavBlob = null;

    if (resp.ok && ct.includes("audio/")) {
      finalWavBlob = await resp.blob();
    } else if (window.AuronBrowserTTS?.synthesizeBrowserNeural) {
      btn.textContent = "⏳ Lade lokale KI-Stimme & Mastering…";
      const voiceId = el("browserVoiceSelect").value || "de_DE-thorsten-high";
      const lengthScaleOverride = 1.0 / Math.max(0.68, 1.0 + ratePct / 100.0);
      const rawWav = await window.AuronBrowserTTS.synthesizeBrowserNeural({
        text: sampleText,
        voiceId,
        lengthScaleOverride,
      });
      const fd = new FormData();
      fd.append("file", rawWav, "preview_raw.wav");
      fd.append("voice_character", charId);
      fd.append("voice_depth_semitones", String(depthSt));
      fd.append("voice_warmth_db", String(warmthDb));
      fd.append("voice_reverb", String(reverbOn));
      const mResp = await fetch("/api/voice-preview-master", { method: "POST", body: fd });
      if (mResp.ok) {
        finalWavBlob = await mResp.blob();
      } else {
        finalWavBlob = rawWav;
      }
    }

    if (finalWavBlob) {
      const player = el("voicePreviewPlayer");
      player.src = URL.createObjectURL(finalWavBlob);
      player.classList.remove("hidden");
      await player.play();
    } else {
      alert("Stimm-Vorschau konnte aktuell nicht geladen werden – bitte prüfe deine Internetverbindung oder versuche es in 2 Sekunden erneut.");
    }
  } catch (err) {
    alert(`Stimm-Vorschau Hinweis: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = "🔊 Stimme vorhören";
  }
});

el("includeIntro").addEventListener("change", updateEstimatedStats);
el("includeOutro").addEventListener("change", updateEstimatedStats);

// Add new scene cleanly without wiping existing uploaded images
el("addSceneBtn").addEventListener("click", () => {
  if (!state.blueprint) return;
  const nextNum = state.blueprint.scenes.length + 1;
  const newScene = {
    scene_number: nextNum,
    phase: "ZUSATZ",
    fact_badge: "FAKT",
    on_screen_headline: `SZENE ${nextNum}`,
    on_screen_subline: "AuronOrigin Analyse",
    narration: "Hier kannst du deinen gesprochenen Text für diese Szene eintragen.",
    pause_after: 0.85,
    visual_motif: "ouroboros_seal",
    camera_motion: "zoom_in",
    glitch_transition: true,
    custom_image_id: "",
    custom_image_name: "",
  };
  state.blueprint.scenes.push(newScene);
  el("sceneCountInput").value = String(state.blueprint.scenes.length);
  const card = buildSceneCardElement(newScene, state.blueprint.scenes.length - 1, state.blueprint);
  el("scenesContainer").appendChild(card);
  updateEstimatedStats();
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// Multi-image batch upload across scenes 1..N (sorted naturally: 1, 2, ..., 8, 9, 10)
el("batchUploadImagesBtn").addEventListener("click", () => {
  const inp = el("batchImagesInput");
  inp.value = "";
  inp.click();
});

el("batchImagesInput").addEventListener("change", async (e) => {
  const rawFiles = Array.from(e.target.files || []);
  if (!rawFiles.length || !state.blueprint) return;

  // Natural sort so 'bild_2.png' comes before 'bild_10.png'
  rawFiles.sort((a, b) => a.name.localeCompare(b.name, "de", { numeric: true, sensitivity: "base" }));

  const btn = el("batchUploadImagesBtn");
  const origLabel = btn.textContent;
  btn.disabled = true;

  try {
    // Expand scene list automatically if user selected more images than current scenes
    while (state.blueprint.scenes.length < rawFiles.length && state.blueprint.scenes.length < 30) {
      const n = state.blueprint.scenes.length + 1;
      state.blueprint.scenes.push({
        scene_number: n,
        phase: "ZUSATZ",
        fact_badge: "FAKT",
        on_screen_headline: `SZENE ${n}`,
        on_screen_subline: "AuronOrigin Analyse",
        narration: "Gesprochener Text für diese Szene.",
        pause_after: 0.85,
        visual_motif: "ouroboros_seal",
        camera_motion: "zoom_in",
        glitch_transition: true,
        custom_image_id: "",
        custom_image_name: "",
      });
    }

    await renderBlueprintEditor(state.blueprint);
    const cards = el("scenesContainer").querySelectorAll(".scene-card");

    for (let i = 0; i < rawFiles.length && i < state.blueprint.scenes.length; i++) {
      btn.textContent = `⏳ Lade Bild ${i + 1}/${rawFiles.length}…`;
      const res = await uploadImageBlobToBackend(rawFiles[i]);
      applyCustomImageToSceneUI(state.blueprint.scenes[i], cards[i], res);
    }
  } catch (err) {
    alert(`Fehler beim Verteilen der Bilder: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = origLabel;
    e.target.value = "";
  }
});

// Modal controls
el("closeImageModalBtn").addEventListener("click", closeUniversalImageModal);
el("imageSourceModal").addEventListener("click", (e) => {
  if (e.target === el("imageSourceModal")) closeUniversalImageModal();
});
el("modalApplySourceBtn").addEventListener("click", async () => {
  const src = el("modalSourceInput").value.trim();
  if (!src) {
    alert("Bitte gib oben eine Bild-URL oder einen Dateipfad ein – oder klicke unten direkt auf eine Bilddatei.");
    return;
  }
  await applySourceForModalScene(src);
});
el("modalSourceInput").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const src = el("modalSourceInput").value.trim();
    if (src) await applySourceForModalScene(src);
  }
});
el("modalUpDirBtn").addEventListener("click", () => {
  if (state.modalParentDir) loadLocalBrowserDirectory(state.modalParentDir);
});
el("modalOpenDirBtn").addEventListener("click", () => {
  loadLocalBrowserDirectory(el("modalCurrentDirInput").value.trim());
});
el("modalCurrentDirInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    loadLocalBrowserDirectory(el("modalCurrentDirInput").value.trim());
  }
});

if (el("sceneImageModeSelect")) {
  el("sceneImageModeSelect").addEventListener("change", async () => {
    if (state.blueprint) {
      await renderBlueprintEditor(state.blueprint);
    }
    saveCurrentSettingsQuietly();
  });
}

if (el("regenAllSceneImagesBtn")) {
  el("regenAllSceneImagesBtn").addEventListener("click", async () => {
    if (!state.blueprint?.scenes?.length) return;
    const motifs = (state.bootstrap?.visual_motifs || []).map((m) => m.id);
    state.blueprint.scenes.forEach((sc, i) => {
      if (!sc.custom_image_id) {
        sc.visual_seed = Math.floor(100000 + Math.random() * 98000000);
        if (motifs.length > 1) {
          sc.visual_motif = motifs[(Math.floor(Math.random() * motifs.length) + i) % motifs.length];
        }
      }
    });
    await renderBlueprintEditor(state.blueprint);
  });
}

if (el("autoDiscoverTopicBtn")) {
  el("autoDiscoverTopicBtn").addEventListener("click", async () => {
    await runResearchAndScript({ silentInit: false, autoDiscover: true });
  });
}

el("researchAndScriptBtn").addEventListener("click", async () => {
  await runResearchAndScript({ silentInit: false, autoDiscover: false });
});

el("oneClickFullVideoBtn").addEventListener("click", async () => {
  const bp = await runResearchAndScript({ silentInit: false });
  if (bp) {
    await runFullVideoRender();
  }
});

el("renderVideoBtn").addEventListener("click", async () => {
  await runFullVideoRender();
});

document.querySelectorAll("[data-platform-tab]").forEach((tabBtn) => {
  tabBtn.addEventListener("click", () => {
    const target = tabBtn.getAttribute("data-platform-tab");
    document.querySelectorAll("[data-platform-tab]").forEach((b) => {
      b.classList.toggle("active", b === tabBtn);
    });
    ["youtube", "tiktok", "instagram", "facebook"].forEach((p) => {
      const pane = el(`pane-${p}`);
      if (pane) pane.classList.toggle("hidden", p !== target);
    });
  });
});

document.querySelectorAll("[data-cover-key]").forEach((pillBtn) => {
  pillBtn.addEventListener("click", () => {
    const ck = pillBtn.getAttribute("data-cover-key");
    if (ck) selectPlatformCover(ck);
  });
});

["videoTitleInput", "thumbTextInput", "thumbSubInput"].forEach((id) => {
  const inp = el(id);
  if (inp) {
    inp.addEventListener("input", () => {
      if (!state.blueprint) return;
      state.blueprint.title = el("videoTitleInput").value;
      state.blueprint.thumbnail_text = el("thumbTextInput").value;
      state.blueprint.thumbnail_subtext = el("thumbSubInput").value;
      scheduleSocialPreviewRefresh();
    });
  }
});

document.querySelectorAll("[data-copy-target]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const targetId = btn.getAttribute("data-copy-target");
    const area = el(targetId);
    if (!area) return;
    await navigator.clipboard.writeText(area.value);
    const prev = btn.textContent;
    btn.textContent = "✓ Kopiert!";
    setTimeout(() => {
      btn.textContent = prev;
    }, 1500);
  });
});

initStudio();
