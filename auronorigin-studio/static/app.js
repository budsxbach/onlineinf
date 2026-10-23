// AuronOrigin YouTube Video Studio Frontend Controller
const state = {
  bootstrap: null,
  dossier: null,
  blueprint: null,
  customMusicFileId: null,
  motifCache: new Map(),
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

// Live Browser-Side Wikipedia DE/EN & Crossref Research (works even if cloud preview restricts backend egress)
async function fetchLiveBrowserSources(topic) {
  const results = [];
  const clean = topic.trim();
  if (!clean) return results;

  const wikiFetch = async (lang) => {
    try {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(clean)}&srlimit=3&format=json&origin=*`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (!resp.ok) return;
      const data = await resp.json();
      for (const hit of data?.query?.search || []) {
        const plain = (hit.snippet || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (hit.title && plain) {
          results.push({
            title: hit.title,
            summary: plain,
            url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`,
            source: `Wikipedia (${lang.toUpperCase()})`,
            kind: "FAKT",
          });
        }
      }
    } catch (_) {
      // Ignore browser network/CORS errors; backend supplements automatically
    }
  };

  const crossrefFetch = async () => {
    try {
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(clean)}&rows=2`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (!resp.ok) return;
      const data = await resp.json();
      for (const item of data?.message?.items || []) {
        const title = (item.title || [])[0];
        const journal = (item["container-title"] || ["Fachjournal"])[0];
        const year = item?.issued?.["date-parts"]?.[0]?.[0] || "";
        if (title) {
          results.push({
            title,
            summary: `Wissenschaftliche Fachpublikation veröffentlicht in ${journal} (${year}).`,
            url: item.URL || "",
            source: `Crossref • ${journal}`,
            kind: "STUDIE",
          });
        }
      }
    } catch (_) {}
  };

  await Promise.all([wikiFetch("de"), wikiFetch("en"), crossrefFetch()]);
  return results;
}

// Optional Browser-Direct Arena Router call if backend reports cloud preview egress restriction
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
        max_tokens: 4096,
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

  el("ttsEngine").value = cfg.tts_engine || "auto";
  el("browserVoiceSelect").value = cfg.browser_voice || "de_DE-thorsten-medium";
  el("voiceRate").value = cfg.voice_rate_pct ?? -15;
  el("voiceRateLabel").textContent = `${el("voiceRate").value}%`;
  el("voiceReverb").checked = cfg.voice_reverb !== false;

  el("musicPreset").value = cfg.music_preset || "glitch_horizon";
  el("musicVolume").value = cfg.music_volume_db ?? -17;
  el("musicVolumeLabel").textContent = `${el("musicVolume").value} dB`;

  el("includeIntro").checked = cfg.include_brand_intro !== false;
  el("includeOutro").checked = cfg.include_brand_outro !== false;
  el("includeWatermark").checked = cfg.include_watermark !== false;
  el("includeSubtitles").checked = cfg.include_subtitles !== false;
  el("includeGlitchSfx").checked = cfg.include_glitch_sfx !== false;
  el("editorialMode").value = cfg.editorial_mode || "fakten_mystery";

  updateUsageHeader(cfg);
  renderTopicSuggestions(data.topic_suggestions || []);
  renderHistory(data.history || []);

  // Load initial default blueprint for the first topic suggestion so scenes editor is immediately tangible
  if (data.topic_suggestions?.length) {
    const first = data.topic_suggestions[0];
    el("topicInput").value = first.topic;
    await runResearchAndScript({ silentInit: true });
  }
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

async function fetchMotifPreviewUrl(motif, videoFormat, customImageId) {
  const key = `${motif}|${videoFormat}|${customImageId || ""}`;
  if (state.motifCache.has(key)) return state.motifCache.get(key);
  const resp = await fetch("/api/preview-motif", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visual_motif: motif,
      video_format: videoFormat,
      custom_image_id: customImageId || null,
    }),
  });
  const blob = await resp.blob();
  const objUrl = URL.createObjectURL(blob);
  state.motifCache.set(key, objUrl);
  return objUrl;
}

function updateEstimatedStats() {
  if (!state.blueprint) return;
  const scenes = state.blueprint.scenes || [];
  el("sceneCountBadge").textContent = String(scenes.length);
  let words = 0;
  let pauses = 0;
  for (const sc of scenes) {
    words += (sc.narration || "").trim().split(/\s+/).filter(Boolean).length;
    pauses += Number(sc.pause_after || 0.85);
  }
  const introSec = el("includeIntro").checked ? (state.blueprint.video_format === "9:16" ? 2.5 : 5.0) : 0;
  const outroSec = el("includeOutro").checked ? 7.0 : 0;
  const est = Math.round(words / 2.2 + pauses + introSec + outroSec);
  el("estDurationBadge").textContent = String(est);
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
  return state.blueprint;
}

async function renderBlueprintEditor(bp) {
  state.blueprint = bp;
  el("videoTitleInput").value = bp.title || "";
  el("thumbTextInput").value = bp.thumbnail_text || "";
  el("thumbSubInput").value = bp.thumbnail_subtext || "";

  const container = el("scenesContainer");
  container.innerHTML = "";
  const motifs = state.bootstrap?.visual_motifs || [];

  (bp.scenes || []).forEach((sc, idx) => {
    const card = document.createElement("div");
    card.className = "scene-card";

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

    card.innerHTML = `
      <div class="scene-preview-col">
        <img class="scene-motif-thumb" alt="Szene ${idx + 1}" />
        <label class="scene-upload-label">
          📷 Eigenes Bild
          <input type="file" accept="image/*" class="hidden scene-img-input" />
        </label>
      </div>
      <div class="scene-fields-col">
        <div class="scene-top-row">
          <span class="scene-num-pill">SZENE ${idx + 1}</span>
          <input type="text" class="sc-headline" value="${escapeAttr(sc.on_screen_headline || "")}" placeholder="CINZEL ON-SCREEN TITEL" />
          <input type="text" class="sc-badge" value="${escapeAttr(sc.fact_badge || "FAKT")}" placeholder="FAKT / DEUTUNG" title="Badge oben links" />
          <select class="sc-motif">${motifOpts}</select>
          <select class="sc-motion">${motions}</select>
          <button type="button" class="btn btn-ghost btn-xs sc-delete" title="Szene entfernen">✕</button>
        </div>
        <textarea rows="2" class="sc-narration" placeholder="Gesprochener deutscher Sprechertext dieser Szene…">${escapeHtml(sc.narration || "")}</textarea>
      </div>
    `;

    const thumbImg = card.querySelector(".scene-motif-thumb");
    fetchMotifPreviewUrl(sc.visual_motif, bp.video_format || "9:16", sc.custom_image_id).then((u) => {
      thumbImg.src = u;
    });

    card.querySelector(".sc-headline").addEventListener("input", (e) => {
      sc.on_screen_headline = e.target.value.toUpperCase();
    });
    card.querySelector(".sc-badge").addEventListener("input", (e) => {
      sc.fact_badge = e.target.value.toUpperCase();
    });
    card.querySelector(".sc-motif").addEventListener("change", async (e) => {
      sc.visual_motif = e.target.value;
      thumbImg.src = await fetchMotifPreviewUrl(sc.visual_motif, bp.video_format || "9:16", sc.custom_image_id);
    });
    card.querySelector(".sc-motion").addEventListener("change", (e) => {
      sc.camera_motion = e.target.value;
    });
    card.querySelector(".sc-narration").addEventListener("input", (e) => {
      sc.narration = e.target.value;
      updateEstimatedStats();
    });
    card.querySelector(".sc-delete").addEventListener("click", () => {
      if (bp.scenes.length <= 2) {
        alert("Ein Video sollte mindestens 2 Szenen besitzen.");
        return;
      }
      bp.scenes.splice(idx, 1);
      renderBlueprintEditor(bp);
    });
    card.querySelector(".scene-img-input").addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "image");
      const r = await fetch("/api/upload/media", { method: "POST", body: fd });
      const d = await r.json();
      if (d.ok) {
        sc.custom_image_id = d.file_id;
        thumbImg.src = await fetchMotifPreviewUrl(sc.visual_motif, bp.video_format || "9:16", sc.custom_image_id);
      }
    });

    container.appendChild(card);
  });

  updateEstimatedStats();
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

async function runResearchAndScript({ silentInit = false } = {}) {
  const topic = el("topicInput").value.trim();
  if (!topic) {
    alert("Bitte gib zuerst ein Thema für das Video ein.");
    el("topicInput").focus();
    return null;
  }

  try {
    if (!silentInit) {
      showWorkflowStatus(
        "Schritt 1/2: Automatische Live-Recherche läuft…",
        "Durchsuche wissenschaftliche Quellen, Wikipedia & AuronOrigin-Wissensmatrix…"
      );
    }

    const browserSources = silentInit ? [] : await fetchLiveBrowserSources(topic);

    const resResp = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
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

    renderDossier(resData.dossier);
    updateUsageHeader(resData.settings);

    if (!silentInit) {
      showWorkflowStatus(
        "Schritt 2/2: Arena Router entwirft AuronOrigin-Skript & Szenen-Architektur…",
        `Modell: ${el("arenaModel").value} • Format: ${el("videoFormat").value}`
      );
    }

    let scriptResp = await fetch("/api/script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        dossier: resData.dossier,
        video_format: el("videoFormat").value,
        duration_target: el("durationTarget").value,
        editorial_mode: el("editorialMode").value,
        pillar: el("pillarSelect").value || resData.dossier.pillar,
        arena_api_key: el("arenaApiKey").value.trim() || null,
        arena_gateway_url: el("arenaGatewayUrl").value,
        arena_model: el("arenaModel").value,
      }),
    });
    let scriptData = await scriptResp.json();

    // If running inside a cloud sandbox where backend egress is restricted AND user entered a fresh key, try browser-direct Arena Router!
    if (
      scriptData?.blueprint?.sandbox_network_restricted &&
      scriptData?.blueprint?.prompts_for_browser_router &&
      currentRawApiKey()
    ) {
      showWorkflowStatus(
        "Verbinde direkt über deinen Browser mit dem Arena Router…",
        "Sende AuronOrigin Showrunner-Prompt an Arena API…"
      );
      const p = scriptData.blueprint.prompts_for_browser_router;
      const direct = await tryBrowserDirectArenaRouter(p.system_prompt, p.user_prompt);
      if (direct?.text) {
        const normResp = await fetch("/api/script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            dossier: resData.dossier,
            video_format: el("videoFormat").value,
            duration_target: el("durationTarget").value,
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
  // Synthesize genuine German neural speech via WASM VITS when 'browser_neural' or 'auto' is selected
  if (mode !== "browser_neural" && mode !== "auto") {
    return {};
  }
  if (!window.AuronBrowserTTS?.synthesizeBrowserNeural) {
    return {};
  }

  const voiceId = el("browserVoiceSelect").value || "de_DE-thorsten-medium";
  const ratePct = Number(el("voiceRate").value || -15);
  const uploadedMap = {};

  try {
    for (let i = 0; i < scenes.length; i++) {
      const text = (scenes[i].narration || "").trim();
      if (!text) continue;
      progressCb(
        Math.round(5 + ((i + 0.5) / scenes.length) * 28),
        `Erzeuge deutsche KI-Tonstimme (${voiceId}) für Szene ${i + 1}/${scenes.length}…`
      );
      const wavBlob = await window.AuronBrowserTTS.synthesizeBrowserNeural(text, voiceId, ratePct, (dl) => {
        if (dl.total > 0) {
          const mb = (dl.loaded / 1048576).toFixed(1);
          const tot = (dl.total / 1048576).toFixed(1);
          progressCb(8, `Lade deutsches KI-Sprachmodell einmalig (${mb} / ${tot} MB)…`);
        }
      });
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

    setProg(34, "Übergebe Szenen, Tonstimme & Soundtrack an die MP4-Render-Engine…");
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
  const outCard = el("outputCard");
  outCard.classList.remove("hidden");

  el("outputVideoTitle").textContent = res.title || "Fertiges AuronOrigin Video";
  el("outputTechMeta").textContent =
    `Säule: ${res.pillar} • Format: ${res.video_format} (${res.resolution}) • Länge: ${res.duration_sec} Sek. • Tonstimme: ${(res.tts_engines_used || []).join(", ")}`;

  const cacheBust = `?t=${Date.now()}`;
  const videoEl = el("finalVideoPlayer");
  videoEl.src = res.video_url + cacheBust;
  videoEl.load();

  el("finalThumbnailImg").src = res.thumbnail_url + cacheBust;
  el("downloadMp4Btn").href = res.video_url;
  el("downloadThumbBtn").href = res.thumbnail_url;
  el("downloadVoiceBtn").href = res.voiceover_url;
  el("downloadSrtBtn").href = res.srt_url;
  el("downloadZipBtn").href = res.zip_url;

  const bp = res.blueprint || state.blueprint || {};
  const seo = bp.youtube_seo || {};
  const poll = seo.community_poll || {};

  el("seoAltTitles").value = (bp.alt_titles || []).join("\n");
  el("seoDescription").value = seo.description || "";
  el("seoPinnedComment").value = seo.pinned_comment || "";
  el("seoTagsAndPoll").value =
    `TAGS:\n${(seo.tags || []).join(", ")}\n\nCOMMUNITY-UMFRAGE:\n${poll.question || ""}\n` +
    (poll.options || []).map((o) => `• ${o}`).join("\n");
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
    tts_engine: el("ttsEngine").value,
    browser_voice: el("browserVoiceSelect").value,
    voice_rate_pct: Number(el("voiceRate").value),
    voice_reverb: el("voiceReverb").checked,
    elevenlabs_api_key: el("elevenlabsKey").value.trim() || undefined,
    elevenlabs_voice_id: el("elevenlabsVoiceId").value.trim() || undefined,
    music_preset: el("musicPreset").value,
    music_volume_db: Number(el("musicVolume").value),
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

el("ttsEngine").addEventListener("change", () => {
  el("elevenlabsExtra").classList.toggle("hidden", el("ttsEngine").value !== "elevenlabs");
});

el("voiceRate").addEventListener("input", () => {
  el("voiceRateLabel").textContent = `${el("voiceRate").value}%`;
});

el("musicVolume").addEventListener("input", () => {
  el("musicVolumeLabel").textContent = `${el("musicVolume").value} dB`;
});

el("musicPreset").addEventListener("change", () => {
  const val = el("musicPreset").value;
  el("customMusicRow").classList.toggle("hidden", val !== "custom");
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
  }
});

el("previewMusicBtn").addEventListener("click", () => {
  const player = el("musicPreviewPlayer");
  player.classList.remove("hidden");
  if (player.paused) {
    player.play();
  } else {
    player.pause();
  }
});

el("previewVoiceBtn").addEventListener("click", async () => {
  const btn = el("previewVoiceBtn");
  const sampleText =
    state.blueprint?.scenes?.[0]?.narration ||
    "Willkommen bei AuronOrigin. Fakten zuerst, Mystery als Deutung.";
  btn.disabled = true;
  btn.textContent = "Lade KI-Stimme…";
  try {
    if (window.AuronBrowserTTS?.synthesizeBrowserNeural) {
      const wav = await window.AuronBrowserTTS.synthesizeBrowserNeural(
        sampleText,
        el("browserVoiceSelect").value,
        Number(el("voiceRate").value || -15)
      );
      const player = el("voicePreviewPlayer");
      player.src = URL.createObjectURL(wav);
      player.classList.remove("hidden");
      await player.play();
    } else {
      alert("Browser-Sprachmodul lädt noch – bitte in 2 Sekunden erneut klicken.");
    }
  } catch (err) {
    alert(`Stimm-Vorschau Hinweis: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = "🔊 Vorhören";
  }
});

el("includeIntro").addEventListener("change", updateEstimatedStats);
el("includeOutro").addEventListener("change", updateEstimatedStats);

el("addSceneBtn").addEventListener("click", () => {
  if (!state.blueprint) return;
  state.blueprint.scenes.push({
    scene_number: state.blueprint.scenes.length + 1,
    phase: "ZUSATZ",
    fact_badge: "FAKT",
    on_screen_headline: "NEUER BEFUND",
    on_screen_subline: "AuronOrigin Analyse",
    narration: "Hier kannst du einen weiteren gesprochenen Satz für diese Szene eintragen.",
    pause_after: 0.85,
    visual_motif: "ouroboros_seal",
    camera_motion: "zoom_in",
    glitch_transition: true,
  });
  renderBlueprintEditor(state.blueprint);
});

el("researchAndScriptBtn").addEventListener("click", async () => {
  await runResearchAndScript({ silentInit: false });
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
