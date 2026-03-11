/* ============================================================
   GOLD SHOP — api.js
   All communication with the FastAPI backend.
   Must be loaded BEFORE app.js.

   API_BASE is read from window.APP_CONFIG, which is set by config.js.
   To change the backend URL, edit config.js — not this file.
   ============================================================ */

'use strict';

const API_BASE = window.APP_CONFIG?.API_BASE || 'http://localhost:8000';

/* ── Internal fetch wrapper ────────────────────────────────── */

async function _apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);

  if (res.status === 401) {
    // Token expired or invalid — let callers handle this
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  if (res.status === 204) return null;

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { detail = (await res.json()).detail || detail; } catch (_) {}
    throw new Error(detail);
  }

  return res.json();
}

function _authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/* ── Normalize backend shapes to frontend shapes ───────────── */

/**
 * Public item: { item_id, name, description, category, weight_grams,
 *               price, image_url, status }
 * → adds `id` alias so existing frontend code using p.id still works.
 */
function _normalizePublic(item) {
  return { ...item, id: item.item_id };
}

/**
 * Admin item: { item_id, translations: [{language,name,description}], ... }
 * → flattens translations to name/name_es/description/description_es
 *   so the admin form can use them directly.
 */
function _normalizeAdmin(item) {
  const en = item.translations?.find(t => t.language === 'en') || {};
  const es = item.translations?.find(t => t.language === 'es') || {};
  return {
    ...item,
    id:             item.item_id,
    name:           en.name        || '',
    description:    en.description || '',
    name_es:        es.name        || '',
    description_es: es.description || '',
  };
}

/* ── Public API ────────────────────────────────────────────── */

async function apiFetchItems(lang) {
  const data = await _apiFetch(`/items?lang=${lang}`);
  return data.map(_normalizePublic);
}

async function apiFetchItem(id, lang) {
  const data = await _apiFetch(`/items/${id}?lang=${lang}`);
  return _normalizePublic(data);
}

/* ── Auth ──────────────────────────────────────────────────── */

async function apiLogin(username, password) {
  const data = await _apiFetch('/admin/login', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });
  return data.access_token;
}

/* ── Metals ────────────────────────────────────────────────── */

async function apiGetMetals() {
  return _apiFetch('/metals');
}

/* ── Admin items ───────────────────────────────────────────── */

async function apiAdminFetchItems(token) {
  const data = await _apiFetch('/admin/items', {
    headers: _authHeaders(token),
  });
  return data.map(_normalizeAdmin);
}

async function apiAdminCreateItem(token, payload) {
  const data = await _apiFetch('/admin/items', {
    method:  'POST',
    headers: _authHeaders(token),
    body:    JSON.stringify(payload),
  });
  return _normalizeAdmin(data);
}

async function apiAdminUpdateItem(token, id, payload) {
  const data = await _apiFetch(`/admin/items/${id}`, {
    method:  'PUT',
    headers: _authHeaders(token),
    body:    JSON.stringify(payload),
  });
  return _normalizeAdmin(data);
}

async function apiAdminDeleteItem(token, id) {
  await _apiFetch(`/admin/items/${id}`, {
    method:  'DELETE',
    headers: _authHeaders(token),
  });
}
