/* ============================================================
   GOLD SHOP — app.js
   Rendering logic for catalog, detail, and admin pages.
   Requires i18n.js and api.js to be loaded first.
   ============================================================ */

'use strict';

/* ── Category icons ────────────────────────────────────────── */

const CATEGORY_ICONS = {
  necklace: '📿',
  bangle:   '⭕',
  earring:  '✨',
  ring:     '💍',
  bracelet: '🔗',
  coin:     '🪙',
  default:  '💛'
};

/* ── Formatting helpers ────────────────────────────────────── */

function formatPrice(price) {
  if (price == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

function categoryLabel(category) {
  const key = 'cat.' + (category?.toLowerCase() || 'default');
  return t(key) || t('cat.default');
}

function categoryIcon(category) {
  return CATEGORY_ICONS[category?.toLowerCase()] || CATEGORY_ICONS.default;
}

/** For public items the API already resolved the language into `name`. */
function productName(product) {
  if (getLang() === 'es' && product.name_es) return product.name_es;
  return product.name;
}

/** For public items the API already resolved the language into `description`. */
function productDesc(product) {
  if (getLang() === 'es' && product.description_es) return product.description_es;
  return product.description;
}

function statusLabel(status) {
  switch (status) {
    case 'AVAILABLE':    return t('status.available');
    case 'SALE_PENDING': return t('status.pending');
    case 'SOLD':         return t('status.sold');
    default:             return status;
  }
}

function statusClass(status) {
  switch (status) {
    case 'AVAILABLE':    return 'available';
    case 'SALE_PENDING': return 'sale_pending';
    case 'SOLD':         return 'sold';
    default:             return 'available';
  }
}

/* ── Security helpers ──────────────────────────────────────── */

function escapeHTML(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

function escapeAttr(str) {
  return String(str)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setTextContent(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* ── Card rendering ────────────────────────────────────────── */

function buildCardImageHTML(product) {
  const label = categoryLabel(product.category);
  if (product.image_url) {
    return `<img
      src="${escapeAttr(product.image_url)}"
      alt="${escapeAttr(product.name)}"
      loading="lazy"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
    >
    <div class="card-image-placeholder" style="display:none">
      <span class="placeholder-icon">${categoryIcon(product.category)}</span>
      <span class="placeholder-text">${escapeHTML(label)}</span>
    </div>`;
  }
  return `<div class="card-image-placeholder">
    <span class="placeholder-icon">${categoryIcon(product.category)}</span>
    <span class="placeholder-text">${escapeHTML(label)}</span>
  </div>`;
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = `product-card${product.status === 'SOLD' ? ' is-sold' : ''}`;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${t('nav.catalog')}: ${productName(product)}`);
  card.dataset.id = product.id;

  card.innerHTML = `
    <div class="card-image-wrap">
      ${buildCardImageHTML(product)}
      <span class="status-badge ${statusClass(product.status)}">${statusLabel(product.status)}</span>
    </div>
    <div class="card-body">
      <span class="card-category">${escapeHTML(categoryLabel(product.category))}</span>
      <h3 class="card-name">${escapeHTML(productName(product))}</h3>
      <p class="card-desc">${escapeHTML(productDesc(product))}</p>
      <div class="card-meta">
        <span class="card-weight">${product.weight_grams}g</span>
        <span class="card-price">${formatPrice(product.price)}</span>
      </div>
    </div>
  `;

  function navigate() {
    window.location.href = `item.html?id=${product.id}`;
  }
  card.addEventListener('click', navigate);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
  });

  return card;
}

/* ── Catalog page ──────────────────────────────────────────── */

async function initCatalog() {
  const grid       = document.getElementById('productGrid');
  const countEl    = document.getElementById('productCount');
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (!grid) return;

  let activeFilter = 'all';
  let allProducts  = [];

  function render(filter) {
    const filtered = filter === 'all'
      ? allProducts
      : allProducts.filter(p => p.category?.toLowerCase() === filter);

    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="grid-empty">
          <div class="empty-icon">🔍</div>
          <p>${t('grid.empty')}</p>
        </div>`;
    } else {
      const frag = document.createDocumentFragment();
      filtered.forEach(p => frag.appendChild(createProductCard(p)));
      grid.appendChild(frag);
    }

    if (countEl) {
      const n = filtered.length;
      countEl.textContent = n === 1 ? t('count.one') : t('count.many', { n });
    }
  }

  // Show loading state
  grid.innerHTML = `<div class="grid-empty"><p>Loading…</p></div>`;

  try {
    allProducts = await apiFetchItems(getLang());
  } catch (err) {
    grid.innerHTML = `<div class="grid-empty"><p>Could not load items. Please try again later.</p></div>`;
    return;
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      render(activeFilter);
    });
  });

  render(activeFilter);
}

/* ── Detail page ───────────────────────────────────────────── */

async function initDetail() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) { redirectHome(); return; }

  let product;
  try {
    product = await apiFetchItem(id, getLang());
  } catch (_) {
    redirectHome();
    return;
  }

  document.title = `${productName(product)} — Gold Shop`;

  setTextContent('detailName',     productName(product));
  setTextContent('detailCategory', categoryLabel(product.category));
  setTextContent('detailDesc',     productDesc(product));
  setTextContent('detailWeight',   product.weight_grams);
  setTextContent('detailPrice',    formatPrice(product.price));

  const badge = document.getElementById('detailBadge');
  if (badge) {
    badge.textContent = statusLabel(product.status);
    badge.className   = `status-badge ${statusClass(product.status)}`;
  }

  const imgWrap = document.getElementById('detailImageWrap');
  if (imgWrap) {
    const label = categoryLabel(product.category);
    if (product.image_url) {
      imgWrap.innerHTML = `
        <img src="${escapeAttr(product.image_url)}" alt="${escapeAttr(product.name)}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <div class="detail-image-placeholder" style="display:none">
          <span class="placeholder-icon">${categoryIcon(product.category)}</span>
          <span class="placeholder-text">${escapeHTML(label)}</span>
        </div>`;
    } else {
      imgWrap.innerHTML = `
        <div class="detail-image-placeholder">
          <span class="placeholder-icon">${categoryIcon(product.category)}</span>
          <span class="placeholder-text">${escapeHTML(label)}</span>
        </div>`;
    }
  }

  const contactBtn = document.getElementById('contactBtn');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      const msgText = t('whatsapp.msg', {
        name:   productName(product),
        weight: product.weight_grams,
        price:  formatPrice(product.price)
      });
      const number = window.APP_CONFIG?.WHATSAPP_NUMBER || '';
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(msgText)}`, '_blank');
    });
  }
}

function redirectHome() {
  window.location.href = 'index.html';
}

/* ── Admin — login modal ───────────────────────────────────── */

function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  modal.classList.add('visible');

  const loginForm  = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    loginError.textContent = '';

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn      = loginForm.querySelector('button[type="submit"]');

    btn.disabled    = true;
    btn.textContent = 'Logging in…';

    try {
      const token = await apiLogin(username, password);
      sessionStorage.setItem('goldshop_token', token);
      modal.classList.remove('visible');
      await loadAdminPage(token);
    } catch (_) {
      loginError.textContent = 'Invalid username or password.';
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Login';
    }
  });
}

function handleAuthError() {
  sessionStorage.removeItem('goldshop_token');
  showLoginModal();
  showToast('Session expired. Please log in again.', 'error');
}

/* ── Admin — main init ─────────────────────────────────────── */

async function initAdmin() {
  const form = document.getElementById('productForm');
  if (!form) return;

  const token = sessionStorage.getItem('goldshop_token');

  if (!token) {
    showLoginModal();
    return;
  }

  await loadAdminPage(token);
}

async function loadAdminPage(token) {
  const form         = document.getElementById('productForm');
  const tableBody    = document.getElementById('tableBody');
  const cancelBtn    = document.getElementById('cancelEdit');
  const formTitle    = document.getElementById('formTitle');
  const formSubtitle = document.getElementById('formSubtitle');
  const submitBtn    = document.getElementById('submitBtn');
  const logoutBtn    = document.getElementById('logoutBtn');

  // Reveal page content now that the user is authenticated
  const adminContent = document.getElementById('adminContent');
  const pageHero     = document.getElementById('pageHero');
  const adminMain    = document.getElementById('adminMain');
  if (adminContent) adminContent.style.display = '';
  if (pageHero)     pageHero.style.display     = '';
  if (adminMain)    adminMain.style.display     = '';

  let editingId     = null;
  let selectedMetal = null;   // { id, name, symbol, purity_denominator, … } or null for N/A

  /* -- Metal picker -- */
  let metals = [];
  try { metals = await apiGetMetals(); } catch (_) { /* non-fatal */ }

  const metalPicker = document.getElementById('metalPicker');
  const metalIdInput = document.getElementById('metalId');
  const karatGroup  = document.getElementById('karatGroup');
  const karatHint   = document.getElementById('karatHint');
  const purityKarat = document.getElementById('purityKarat');

  function selectMetal(metal) {
    selectedMetal = metal;
    if (metalIdInput) metalIdInput.value = metal ? metal.id : '';

    // Update pill active states
    if (metalPicker) {
      metalPicker.querySelectorAll('.metal-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.metalId === (metal ? String(metal.id) : 'na'));
      });
    }

    // Show/hide karat field
    if (karatGroup) karatGroup.style.display = metal ? '' : 'none';

    // Update karat placeholder + hint based on metal
    if (metal && purityKarat) {
      const denom = metal.purity_denominator;
      if (denom === 24) {
        purityKarat.placeholder = 'e.g. 22';
        if (karatHint) karatHint.textContent = t('form.hint.karat.gold');
      } else {
        purityKarat.placeholder = `e.g. ${denom === 1000 ? '925' : denom}`;
        if (karatHint) karatHint.textContent = t('form.hint.karat.millesimal', { denom });
      }
    }
  }

  if (metalPicker) {
    // N/A pill
    const naBtn = document.createElement('button');
    naBtn.type = 'button';
    naBtn.className = 'metal-btn active';
    naBtn.dataset.metalId = 'na';
    naBtn.textContent = t('form.metal.na');
    naBtn.addEventListener('click', () => { selectMetal(null); if (purityKarat) purityKarat.value = ''; });
    metalPicker.appendChild(naBtn);

    // One pill per metal from API
    metals.forEach(metal => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'metal-btn';
      btn.dataset.metalId = String(metal.id);
      btn.textContent = metal.name;
      btn.addEventListener('click', () => selectMetal(metal));
      metalPicker.appendChild(btn);
    });
  }

  /* -- Logout -- */
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('goldshop_token');
      window.location.reload();
    });
  }

  /* -- Load and render table -- */
  async function reloadTable() {
    try {
      const products = await apiAdminFetchItems(token);
      renderTable(products);
      updateStats(products);
    } catch (err) {
      if (err.status === 401) { handleAuthError(); return; }
      showToast('Failed to load items.', 'error');
    }
  }

  function updateStats(products) {
    setTextContent('statTotal',     products.length);
    setTextContent('statAvailable', products.filter(p => p.status === 'AVAILABLE').length);
    setTextContent('statPending',   products.filter(p => p.status === 'SALE_PENDING').length);
    setTextContent('statSold',      products.filter(p => p.status === 'SOLD').length);
  }

  function renderTable(products) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#9A9A9A;">${t('table.empty')}</td></tr>`;
      return;
    }

    products.forEach(p => {
      const tr = document.createElement('tr');
      const imgHTML = p.image_url
        ? `<img class="table-img" src="${escapeAttr(p.image_url)}" alt="${escapeAttr(p.name)}" onerror="this.parentElement.innerHTML='<div class=\\'table-img-placeholder\\'>${categoryIcon(p.category)}</div>'">`
        : `<div class="table-img-placeholder">${categoryIcon(p.category)}</div>`;

      tr.innerHTML = `
        <td>${imgHTML}</td>
        <td>
          <div class="table-name">${escapeHTML(productName(p))}</div>
          <div class="table-sub">${escapeHTML(categoryLabel(p.category))}</div>
        </td>
        <td class="hide-mobile">${p.weight_grams}g</td>
        <td>${formatPrice(p.price)}</td>
        <td><span class="status-badge ${statusClass(p.status)}">${statusLabel(p.status)}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn-edit"   data-id="${p.id}">${t('btn.edit')}</button>
            <button class="btn-delete" data-id="${p.id}">${t('btn.delete')}</button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-edit').addEventListener('click',   () => startEdit(p));
      tr.querySelector('.btn-delete').addEventListener('click', () => deleteProduct(p.id));
      tableBody.appendChild(tr);
    });
  }

  /* -- Show/hide sell price based on status -- */
  const sellPriceGroup = document.getElementById('sellPriceGroup');
  function updateSellPriceVisibility() {
    const status = form.status.value;
    if (sellPriceGroup) {
      sellPriceGroup.style.display = (status === 'SOLD' || status === 'SALE_PENDING') ? '' : 'none';
    }
  }
  form.status.addEventListener('change', updateSellPriceVisibility);
  updateSellPriceVisibility();

  /* -- Build API payload from form -- */
  function buildPayload() {
    const translations = [];
    const enName = form.productName.value.trim();
    const esName = form.productNameEs.value.trim();
    if (enName) translations.push({ language: 'en', name: enName, description: form.description.value.trim() || null });
    if (esName) translations.push({ language: 'es', name: esName, description: form.descriptionEs.value.trim() || null });

    const costVal        = parseFloat(form.cost.value);
    const sellPriceVal   = parseFloat(form.sellPrice.value);
    const weightVal      = parseFloat(form.weight.value);
    const multiplierVal  = parseFloat(form.priceMultiplier.value);
    const purityKaratVal = parseFloat(form.purityKarat.value);

    return {
      category:         form.category.value,
      metal_id:         selectedMetal ? selectedMetal.id : null,
      purity_karat:     selectedMetal && !isNaN(purityKaratVal) ? purityKaratVal : null,
      weight_grams:     isNaN(weightVal)     ? null : weightVal,
      price_multiplier: isNaN(multiplierVal) ? null : multiplierVal,
      cost:             isNaN(costVal)       ? null : costVal,
      sell_price:       isNaN(sellPriceVal)  ? null : sellPriceVal,
      image_url:        form.imageUrl.value.trim() || null,
      status:           form.status.value,
      translations,
    };
  }

  /* -- Form submit (create or update) -- */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const missingName   = !form.productName.value.trim();
    const missingKarat  = selectedMetal && !form.purityKarat.value;
    const missingWeight = selectedMetal && !form.weight.value;
    if (missingName || missingKarat || missingWeight) {
      showToast(t('toast.required'), 'error');
      return;
    }

    submitBtn.disabled = true;

    try {
      const payload = buildPayload();
      if (editingId !== null) {
        await apiAdminUpdateItem(token, editingId, payload);
        showToast(t('toast.updated'), 'success');
      } else {
        await apiAdminCreateItem(token, payload);
        showToast(t('toast.added'), 'success');
      }
      resetForm();
      await reloadTable();
    } catch (err) {
      if (err.status === 401) { handleAuthError(); return; }
      showToast(err.message || 'Error saving item.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* -- Cancel edit -- */
  if (cancelBtn) cancelBtn.addEventListener('click', resetForm);

  /* -- Start editing a product -- */
  function startEdit(product) {
    editingId = product.id;

    form.productName.value    = product.name        || '';
    form.productNameEs.value  = product.name_es     || '';
    form.description.value    = product.description || '';
    form.descriptionEs.value  = product.description_es || '';
    form.category.value        = product.category;
    form.weight.value          = product.weight_grams ?? '';
    form.priceMultiplier.value = product.price_multiplier ?? '';
    form.cost.value            = product.cost ?? '';
    form.sellPrice.value       = product.sell_price ?? '';
    form.imageUrl.value        = product.image_url || '';
    form.status.value          = product.status;
    updateSellPriceVisibility();

    // Restore metal picker selection
    const metalForItem = product.metal ? metals.find(m => m.id === product.metal.id) : null;
    selectMetal(metalForItem || null);
    if (form.purityKarat) form.purityKarat.value = product.purity_karat ?? '';

    if (formTitle)    formTitle.textContent    = t('form.edit.title');
    if (formSubtitle) formSubtitle.textContent = t('form.subtitle');
    if (submitBtn)    submitBtn.textContent     = t('form.btn.update');
    if (cancelBtn)    cancelBtn.style.display   = 'inline-block';

    form.querySelectorAll('option[data-i18n]').forEach(opt => {
      opt.textContent = t(opt.dataset.i18n);
    });

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* -- Delete a product -- */
  async function deleteProduct(id) {
    if (!confirm(t('confirm.delete'))) return;
    try {
      await apiAdminDeleteItem(token, id);
      showToast(t('toast.deleted'), 'info');
      await reloadTable();
    } catch (err) {
      if (err.status === 401) { handleAuthError(); return; }
      showToast(err.message || 'Error deleting item.', 'error');
    }
  }

  /* -- Reset form -- */
  function resetForm() {
    editingId = null;
    form.reset();
    selectMetal(null);  // back to N/A
    if (purityKarat) purityKarat.value = '';
    if (formTitle)    formTitle.textContent    = t('form.add.title');
    if (formSubtitle) formSubtitle.textContent = t('form.subtitle');
    if (submitBtn)    submitBtn.textContent     = t('form.btn.add');
    if (cancelBtn)    cancelBtn.style.display   = 'none';
    form.querySelectorAll('option[data-i18n]').forEach(opt => {
      opt.textContent = t(opt.dataset.i18n);
    });
  }

  /* -- Auto-translate (same logic as before) -- */
  const activeLang         = getLang();
  const isEn               = activeLang === 'en';
  const fromLang           = isEn ? 'en' : 'es';
  const toLang             = isEn ? 'es' : 'en';
  const primaryNameField   = isEn ? document.getElementById('productName')   : document.getElementById('productNameEs');
  const primaryDescField   = isEn ? document.getElementById('description')   : document.getElementById('descriptionEs');
  const secondaryNameField = isEn ? document.getElementById('productNameEs') : document.getElementById('productName');
  const secondaryDescField = isEn ? document.getElementById('descriptionEs') : document.getElementById('description');
  const translateIndicator = document.getElementById(isEn ? 'translateIndicator' : 'translateIndicatorEn');

  [secondaryNameField, secondaryDescField].forEach(f => {
    if (f) { f.readOnly = true; f.classList.add('field-readonly'); }
  });

  function setIndicator(state) {
    if (!translateIndicator) return;
    translateIndicator.textContent = state ? t(`translate.${state}`) : '';
    translateIndicator.className   = `translate-indicator${state ? ' ' + state : ''}`;
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  }

  async function doTranslate(text, from, to, targetField) {
    if (!text.trim() || text.trim().length < 3) return;
    setIndicator('loading');
    try {
      const res  = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
      const data = await res.json();
      if (data.responseStatus === 200) {
        if (document.activeElement !== targetField) targetField.value = data.responseData.translatedText;
        setIndicator('done');
      } else {
        setIndicator('error');
      }
    } catch (_) {
      setIndicator('error');
    }
    setTimeout(() => setIndicator(null), 3000);
  }

  const debouncedTranslateName = debounce(text => doTranslate(text, fromLang, toLang, secondaryNameField), 800);
  const debouncedTranslateDesc = debounce(text => doTranslate(text, fromLang, toLang, secondaryDescField), 800);

  if (primaryNameField) primaryNameField.addEventListener('input', () => {
    if (document.activeElement === primaryNameField) debouncedTranslateName(primaryNameField.value);
  });
  if (primaryDescField) primaryDescField.addEventListener('input', () => {
    if (document.activeElement === primaryDescField) debouncedTranslateDesc(primaryDescField.value);
  });

  // Initial load
  await reloadTable();
}

/* ── Toast ─────────────────────────────────────────────────── */

function showToast(message, type = 'info') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className   = `toast ${type}`;
  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  });
}

/* ── Init router ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  const page = window.location.pathname.split('/').pop();

  if (page === 'index.html' || page === '' || page === '/') {
    await initCatalog();
  } else if (page === 'item.html') {
    await initDetail();
  } else if (page === 'admin.html') {
    await initAdmin();
  }

  if (typeof applyTranslations === 'function') applyTranslations();
});
