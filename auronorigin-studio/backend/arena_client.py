from __future__ import annotations

import json
import re
from typing import Any

import requests

from .config import record_token_usage

ROUTER_MODEL_IDS = {
    "coding-router-preview",
    "claude-coding-router-preview",
    "max-v0",
    "claude-max-v0",
}

DEFAULT_ARENA_MODELS = [
    {
        "id": "coding-router-preview",
        "name": "Arena Coding Router (Empfohlen • Nutzt deine $1.000 Router-Credits)",
        "is_router": True,
        "context": 1000000,
        "output": 128000,
    },
    {
        "id": "claude-coding-router-preview",
        "name": "Arena Router (Claude-kompatibler Alias)",
        "is_router": True,
        "context": 1000000,
        "output": 128000,
    },
]

GATEWAY_CANDIDATES = [
    "https://api.preview.arena.ai",
    "https://api.arena.ai",
]

PORTAL_DISCOVERY_URLS = [
    "https://portal.api.preview.arena.ai/api/scripts/setup/models",
    "https://platform.arena.ai/api/scripts/setup/models",
]


def normalize_gateway_url(url: str) -> str:
    cleaned = (url or "https://api.preview.arena.ai").strip().rstrip("/")
    if cleaned.endswith("/v1"):
        cleaned = cleaned[:-3]
    return cleaned


def _is_network_restricted_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    markers = (
        "failed to establish a new connection",
        "name or service not known",
        "temporary failure in name resolution",
        "nodename nor servname",
        "tunnel connection failed",
        "403 forbidden",
        "proxyerror",
        "connection refused",
        "network is unreachable",
        "connecttimeout",
    )
    return any(m in msg for m in markers)


def discover_arena_models(api_key: str, gateway_url: str = "https://api.preview.arena.ai") -> dict[str, Any]:
    """Verify the Arena API key and discover enabled Router & Direct models.

    Uses the exact non-billed portal discovery endpoint from Arena's setup.sh
    plus standard OpenAI-compatible /v1/models fallback.
    """
    token = (api_key or "").strip()
    base = normalize_gateway_url(gateway_url)
    if not token:
        return {
            "ok": False,
            "error": "Bitte zuerst deinen Arena API-Key eintragen.",
            "models": DEFAULT_ARENA_MODELS,
        }

    headers_portal = {
        "Authorization": f"Bearer {token}",
        "User-Agent": "arenarouter-setup.sh",
        "Accept": "application/json",
    }

    # 1. Try non-billed Arena Portal Setup Discovery first (matches official setup.sh)
    discovery_targets = list(PORTAL_DISCOVERY_URLS)
    if "preview" not in base:
        discovery_targets.reverse()

    network_blocked = False
    last_status = None
    last_body = ""

    for disc_url in discovery_targets:
        try:
            resp = requests.get(disc_url, headers=headers_portal, timeout=10)
            last_status = resp.status_code
            last_body = resp.text[:400]
            if resp.status_code == 200:
                payload = resp.json()
                raw_rows = payload.get("data", []) if isinstance(payload, dict) else []
                models = _parse_discovered_models(raw_rows)
                detected_gw = normalize_gateway_url(payload.get("gatewayUrl") or base)
                return {
                    "ok": True,
                    "verified": True,
                    "gateway_url": detected_gw,
                    "models": models or DEFAULT_ARENA_MODELS,
                    "message": f"Arena API-Key erfolgreich verifiziert ({len(models) or len(DEFAULT_ARENA_MODELS)} Modelle verfügbar).",
                }
            if resp.status_code in (401, 403):
                break
        except requests.RequestException as exc:
            if _is_network_restricted_error(exc):
                network_blocked = True
            continue

    # 2. Try standard OpenAI-compatible GET {gateway}/v1/models
    for gw in dict.fromkeys([base] + GATEWAY_CANDIDATES):
        try:
            resp = requests.get(
                f"{gw}/v1/models",
                headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
                timeout=10,
            )
            last_status = resp.status_code
            last_body = resp.text[:400]
            if resp.status_code == 200:
                payload = resp.json()
                raw_rows = payload.get("data", []) if isinstance(payload, dict) else []
                models = _parse_discovered_models(raw_rows)
                return {
                    "ok": True,
                    "verified": True,
                    "gateway_url": gw,
                    "models": models or DEFAULT_ARENA_MODELS,
                    "message": f"Verbunden mit {gw} ({len(models) or len(DEFAULT_ARENA_MODELS)} Modelle geladen).",
                }
        except requests.RequestException as exc:
            if _is_network_restricted_error(exc):
                network_blocked = True
            continue

    if network_blocked and last_status is None:
        return {
            "ok": True,
            "verified": False,
            "sandbox_network_restricted": True,
            "gateway_url": base,
            "models": DEFAULT_ARENA_MODELS,
            "message": (
                "Hinweis: Diese Cloud-Vorschau-Sandbox blockiert ausgehende Verbindungen zu api.arena.ai. "
                "Das Studio versucht Anfragen automatisch direkt über deinen Browser zu senden – und lokal auf deinem PC "
                "(per START_AURON_STUDIO) läuft der Arena Router ohne jede Einschränkung direkt über das Backend."
            ),
        }

    if last_status in (401, 403):
        hint = "Ungültiger oder abgelaufener API-Key."
        if "harness_restricted" in last_body or "client_restricted" in last_body:
            hint = (
                "Dieser Key ist ein reiner Free-Harness-Key (403 harness_restricted). "
                "Nutze deinen Early-Access-Workspace-Key aus portal.api.preview.arena.ai mit den $1.000 Credits."
            )
        return {
            "ok": False,
            "status_code": last_status,
            "error": f"Arena Authentifizierung fehlgeschlagen (HTTP {last_status}): {hint}",
            "models": DEFAULT_ARENA_MODELS,
        }

    return {
        "ok": True,
        "verified": False,
        "gateway_url": base,
        "models": DEFAULT_ARENA_MODELS,
        "message": "Key gespeichert. Standard-Router 'coding-router-preview' ist aktiv.",
    }


def _parse_discovered_models(raw_rows: list[Any]) -> list[dict[str, Any]]:
    parsed: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in raw_rows:
        if not isinstance(row, dict):
            continue
        mid = str(row.get("id") or "").strip()
        if not mid or mid in seen or mid == "exo":
            continue
        seen.add(mid)
        is_router = mid in ROUTER_MODEL_IDS or row.get("arena_type") == "routing"
        label = row.get("name") or ("Arena Coding Router" if mid == "coding-router-preview" else mid)
        if is_router and "Router" not in str(label):
            label = f"{label} (Arena Router)"
        parsed.append(
            {
                "id": mid,
                "name": str(label),
                "is_router": is_router,
                "context": int(row.get("context") or 1000000),
                "output": int(row.get("output") or 128000),
            }
        )
    parsed.sort(key=lambda r: (0 if r["id"] == "coding-router-preview" else (1 if r["is_router"] else 2), r["name"]))
    if not any(r["id"] == "coding-router-preview" for r in parsed):
        parsed.insert(0, DEFAULT_ARENA_MODELS[0])
    return parsed


def call_arena_router(
    *,
    api_key: str,
    system_prompt: str,
    user_prompt: str,
    gateway_url: str = "https://api.preview.arena.ai",
    model: str = "coding-router-preview",
    protocol: str = "auto",
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> dict[str, Any]:
    """Send a generation request through Arena API / Arena Router.

    Supports both OpenAI-compatible (/v1/chat/completions) and Anthropic-compatible
    (/v1/messages) endpoints across api.preview.arena.ai and api.arena.ai.
    Follows Arena's router rules: never sends reasoning_effort for router model IDs.
    """
    token = (api_key or "").strip()
    if not token:
        return {
            "ok": False,
            "missing_key": True,
            "error": "Kein Arena API-Key hinterlegt.",
        }

    base = normalize_gateway_url(gateway_url)
    selected_model = (model or "coding-router-preview").strip()
    if selected_model.startswith("arena/"):
        selected_model = selected_model.split("/", 1)[1]

    gateways = list(dict.fromkeys([base] + GATEWAY_CANDIDATES))
    protocols = ["openai", "anthropic"] if protocol == "auto" else [protocol]

    network_blocked = False
    errors: list[str] = []

    for gw in gateways:
        for proto in protocols:
            try:
                if proto == "openai":
                    res = _call_openai_compat(
                        gw=gw,
                        token=token,
                        model=selected_model,
                        system_prompt=system_prompt,
                        user_prompt=user_prompt,
                        temperature=temperature,
                        max_tokens=max_tokens,
                    )
                else:
                    res = _call_anthropic_compat(
                        gw=gw,
                        token=token,
                        model=selected_model,
                        system_prompt=system_prompt,
                        user_prompt=user_prompt,
                        temperature=temperature,
                        max_tokens=max_tokens,
                    )
                if res.get("ok"):
                    usage = res.get("usage", {})
                    totals = record_token_usage(
                        usage.get("prompt_tokens", 0),
                        usage.get("completion_tokens", 0),
                    )
                    res["cumulative_usage"] = totals
                    return res

                err_text = res.get("error", "")
                errors.append(f"[{gw} / {proto}] {err_text}")
                # Do not retry other endpoints on explicit 401 invalid token
                if res.get("status_code") == 401:
                    return res
            except requests.RequestException as exc:
                if _is_network_restricted_error(exc):
                    network_blocked = True
                errors.append(f"[{gw} / {proto}] {exc}")

    if network_blocked:
        return {
            "ok": False,
            "sandbox_network_restricted": True,
            "error": "Ausgehende Verbindung in der Cloud-Sandbox eingeschränkt – wechsle auf Browser-Direktmodus / Studio-Engine.",
            "details": errors,
        }

    return {
        "ok": False,
        "error": errors[0] if errors else "Arena Router Anfrage fehlgeschlagen.",
        "details": errors,
    }


def _call_openai_compat(
    *,
    gw: str,
    token: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    max_tokens: int,
) -> dict[str, Any]:
    url = f"{gw}/v1/chat/completions"
    body: dict[str, Any] = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": max_tokens,
    }
    # Router aliases manage reasoning automatically; only set temperature when non-router or standard
    if model not in ROUTER_MODEL_IDS:
        body["temperature"] = temperature

    resp = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        json=body,
        timeout=75,
    )
    if resp.status_code != 200:
        return {
            "ok": False,
            "status_code": resp.status_code,
            "error": f"HTTP {resp.status_code}: {resp.text[:350]}",
        }

    data = resp.json()
    choices = data.get("choices") or []
    if not choices:
        return {"ok": False, "error": "Leere Antwort vom Arena Gateway (/v1/chat/completions)."}

    msg = choices[0].get("message") or {}
    content = msg.get("content") or ""
    if isinstance(content, list):
        content = "".join(part.get("text", "") for part in content if isinstance(part, dict))

    usage_raw = data.get("usage") or {}
    prompt_toks = int(usage_raw.get("prompt_tokens") or 0)
    comp_toks = int(usage_raw.get("completion_tokens") or 0)

    return {
        "ok": True,
        "text": str(content).strip(),
        "routed_model": data.get("model") or model,
        "gateway": gw,
        "protocol": "openai",
        "usage": {
            "prompt_tokens": prompt_toks,
            "completion_tokens": comp_toks,
            "total_tokens": prompt_toks + comp_toks,
        },
    }


def _call_anthropic_compat(
    *,
    gw: str,
    token: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    max_tokens: int,
) -> dict[str, Any]:
    url = f"{gw}/v1/messages"
    body: dict[str, Any] = {
        "model": model,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
        "max_tokens": max_tokens,
    }
    if model not in ROUTER_MODEL_IDS:
        body["temperature"] = temperature

    resp = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        json=body,
        timeout=75,
    )
    if resp.status_code != 200:
        return {
            "ok": False,
            "status_code": resp.status_code,
            "error": f"HTTP {resp.status_code}: {resp.text[:350]}",
        }

    data = resp.json()
    blocks = data.get("content") or []
    text_parts = [b.get("text", "") for b in blocks if isinstance(b, dict) and b.get("type") == "text"]
    content = "\n".join(text_parts).strip()
    if not content:
        return {"ok": False, "error": "Leere Antwort vom Arena Gateway (/v1/messages)."}

    usage_raw = data.get("usage") or {}
    prompt_toks = int(usage_raw.get("input_tokens") or 0)
    comp_toks = int(usage_raw.get("output_tokens") or 0)

    return {
        "ok": True,
        "text": content,
        "routed_model": data.get("model") or model,
        "gateway": gw,
        "protocol": "anthropic",
        "usage": {
            "prompt_tokens": prompt_toks,
            "completion_tokens": comp_toks,
            "total_tokens": prompt_toks + comp_toks,
        },
    }


def extract_json_object(raw_text: str) -> dict[str, Any] | None:
    """Robustly extract a JSON object from LLM markdown/code-fenced output."""
    if not raw_text:
        return None
    cleaned = raw_text.strip()
    fence_match = re.search(r"```(?:json)?\s*(\{[\s\S]*\})\s*```", cleaned, flags=re.IGNORECASE)
    if fence_match:
        try:
            return json.loads(fence_match.group(1))
        except json.JSONDecodeError:
            pass
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = cleaned[start : end + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            # Remove trailing commas before } or ]
            repaired = re.sub(r",\s*([}\]])", r"\1", candidate)
            try:
                return json.loads(repaired)
            except json.JSONDecodeError:
                return None
    return None
