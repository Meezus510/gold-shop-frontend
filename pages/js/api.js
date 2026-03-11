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
    try {
      const body = await res.json();
      if (typeof body.detail === 'string') {
        detail = body.detail;
      } else if (Array.isArray(body.detail)) {
        // Pydantic validation errors — flatten to readable string
        detail = body.detail.map(e => `${e.loc?.slice(1).join('.')}: ${e.msg}`).join(' | ');
      }
    } catch (_) {}
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
  const imagesSorted = (item.images || []).slice().sort((a, b) => a.position - b.position);
  return {
    ...item,
    id:             item.item_id,
    name:           en.name        || '',
    description:    en.description || '',
    name_es:        es.name        || '',
    description_es: es.description || '',
    image_url:      imagesSorted[0]?.url || null,
    image_urls:     imagesSorted.map(img => img.url),
    flat_markup:        item.flat_markup        ?? null,
    quantity:           item.quantity            ?? 1,
    quantity_available: item.quantity_available  ?? 0,
    quantity_pending:   item.quantity_pending    ?? 0,
    quantity_sold:      item.quantity_sold       ?? 0,
    purchase_location:  item.purchase_location   ?? null,
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

async function apiGetSpotPrices(token) {
  return _apiFetch('/metals/spot-prices', { headers: _authHeaders(token) });
}

/* ── Purchase locations ─────────────────────────────────────── */

async function apiGetLocations(token) {
  return _apiFetch('/locations', { headers: _authHeaders(token) });
}

async function apiCreateLocation(token, name) {
  return _apiFetch('/locations', {
    method:  'POST',
    headers: _authHeaders(token),
    body:    JSON.stringify({ name }),
  });
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

async function apiAdjustUnits(token, id, fromState, toState, units = 1) {
  return _apiFetch(`/admin/items/${id}/units`, {
    method:  'PATCH',
    headers: _authHeaders(token),
    body:    JSON.stringify({ from_state: fromState, to_state: toState, units }),
  });
}

async function apiRecalculateItemPrice(token, id) {
  const data = await _apiFetch(`/admin/items/${id}/recalculate-price`, {
    method:  'POST',
    headers: _authHeaders(token),
  });
  return _normalizeAdmin(data);
}

async function apiRecalculateAllPrices(token) {
  return _apiFetch('/metals/recalculate-all-prices', {
    method:  'POST',
    headers: _authHeaders(token),
  });
}

async function apiGetSyncStatus(token) {
  return _apiFetch('/metals/price-sync-status', { headers: _authHeaders(token) });
}

/* ── Image upload ──────────────────────────────────────────── */

/**
 * Uploads a File object to Cloudinary via the backend.
 * Returns the secure image URL string.
 */
async function apiUploadImage(token, file) {
  const form = new FormData();
  form.append('file', file);
  const data = await _apiFetch('/admin/upload-image', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${token}` }, // no Content-Type — browser sets multipart boundary
    body:    form,
  });
  return data.url;
}
