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

/**
 * Returns a human-readable purity string (e.g. "22k Gold", "Silver 925")
 * or null if the item has no metal / purity data.
 */
function formatPurity(product) {
  if (!product.metal || !product.purity_karat) return null;
  const denom = product.metal.purity_denominator;
  if (denom === 24) return `${product.purity_karat}k ${product.metal.name}`;
  return `${product.metal.name} ${product.purity_karat}`;
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
        <span class="card-weight">${product.weight_grams}g${formatPurity(product) ? ` · ${escapeHTML(formatPurity(product))}` : ''}</span>
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
  const grid        = document.getElementById('productGrid');
  const countEl     = document.getElementById('productCount');
  const searchInput = document.getElementById('catalogSearch');
  const sortSelect  = document.getElementById('sortSelect');

  if (!grid) return;

  // ── Filter state — empty Set = "all" ──
  let activeCategories = new Set();
  let activeMetals     = new Set();
  let activePurities   = new Set();
  let searchQuery = '';
  let sortBy      = 'recent';
  let allProducts = [];

  // ── Apply all active filters + sort, then render ──
  function applyAndRender() {
    let result = allProducts;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.name        || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    if (activeCategories.size > 0)
      result = result.filter(p => activeCategories.has(p.category?.toLowerCase()));

    if (activeMetals.size > 0)
      result = result.filter(p => p.metal && activeMetals.has(p.metal.name.toLowerCase()));

    if (activePurities.size > 0)
      result = result.filter(p => activePurities.has(p.purity_karat));

    result = [...result];
    if (sortBy === 'price_asc')
      result.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (sortBy === 'price_desc')
      result.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    else if (sortBy === 'weight_asc')
      result.sort((a, b) => (a.weight_grams ?? Infinity) - (b.weight_grams ?? Infinity));
    else if (sortBy === 'weight_desc')
      result.sort((a, b) => (b.weight_grams ?? -Infinity) - (a.weight_grams ?? -Infinity));

    grid.innerHTML = '';
    if (result.length === 0) {
      grid.innerHTML = `<div class="grid-empty"><div class="empty-icon">🔍</div><p>${t('grid.empty')}</p></div>`;
    } else {
      const frag = document.createDocumentFragment();
      result.forEach(p => frag.appendChild(createProductCard(p)));
      grid.appendChild(frag);
    }
    if (countEl) {
      const n = result.length;
      countEl.textContent = n === 1 ? t('count.one') : t('count.many', { n });
    }
  }

  // ── Category pills (static in HTML, multi-select) ──
  function initCategoryFilters() {
    const allBtn  = document.querySelector('[data-filter="all"]');
    const catBtns = document.querySelectorAll('[data-filter]:not([data-filter="all"])');

    allBtn?.addEventListener('click', () => {
      activeCategories.clear();
      allBtn.classList.add('active');
      catBtns.forEach(b => b.classList.remove('active'));
      applyAndRender();
    });

    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.filter;
        if (activeCategories.has(val)) {
          activeCategories.delete(val);
          btn.classList.remove('active');
        } else {
          activeCategories.add(val);
          btn.classList.add('active');
        }
        if (activeCategories.size === 0) allBtn?.classList.add('active');
        else                              allBtn?.classList.remove('active');
        applyAndRender();
      });
    });
  }

  // ── Metal pills (dynamic, multi-select) ──
  function buildMetalFilters(products) {
    const row   = document.getElementById('metalFilterRow');
    const group = document.getElementById('metalFilterGroup');
    if (!row || !group) return;

    const seen = [...new Map(
      products.filter(p => p.metal)
              .map(p => [p.metal.name.toLowerCase(), p.metal.name])
    ).entries()].sort((a, b) => a[1].localeCompare(b[1]));

    if (seen.length === 0) return;

    seen.forEach(([key, name]) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = name;
      btn.addEventListener('click', () => {
        if (activeMetals.has(key)) { activeMetals.delete(key); btn.classList.remove('active'); }
        else                       { activeMetals.add(key);    btn.classList.add('active'); }
        applyAndRender();
      });
      group.appendChild(btn);
    });
    row.style.display = '';
  }

  // ── Purity pills (dynamic, multi-select) ──
  function buildPurityFilters(products) {
    const row   = document.getElementById('purityFilterRow');
    const group = document.getElementById('purityFilterGroup');
    if (!row || !group) return;

    const seen = new Map();
    products.forEach(p => {
      if (p.purity_karat && p.metal && !seen.has(p.purity_karat)) {
        const label = p.metal.purity_denominator === 24
          ? `${p.purity_karat}k`
          : `${p.purity_karat}`;
        seen.set(p.purity_karat, label);
      }
    });

    if (seen.size === 0) return;

    [...seen.entries()]
      .sort((a, b) => b[0] - a[0])
      .forEach(([karat, label]) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = label;
        btn.addEventListener('click', () => {
          if (activePurities.has(karat)) { activePurities.delete(karat); btn.classList.remove('active'); }
          else                           { activePurities.add(karat);    btn.classList.add('active'); }
          applyAndRender();
        });
        group.appendChild(btn);
      });
    row.style.display = '';
  }

  // ── Sort ──
  sortSelect?.addEventListener('change', () => {
    sortBy = sortSelect.value;
    applyAndRender();
  });

  // ── Search (debounced 300ms) ──
  let _searchTimer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
      searchQuery = searchInput.value.trim();
      applyAndRender();
    }, 300);
  });

  // ── Load data ──
  grid.innerHTML = `<div class="grid-empty"><p>Loading…</p></div>`;
  try {
    allProducts = await apiFetchItems(getLang());
  } catch (_) {
    grid.innerHTML = `<div class="grid-empty"><p>Could not load items. Please try again later.</p></div>`;
    return;
  }

  initCategoryFilters();
  buildMetalFilters(allProducts);
  buildPurityFilters(allProducts);
  applyAndRender();
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

  // Inject purity spec if available
  const purityStr = formatPurity(product);
  const specsEl   = document.querySelector('.detail-specs');
  const existingPurity = document.getElementById('detailPuritySpec');
  if (existingPurity) existingPurity.remove();
  if (purityStr && specsEl) {
    const priceSpec = specsEl.children[1]; // insert before price
    const puritySpec = document.createElement('div');
    puritySpec.className = 'spec-item';
    puritySpec.id = 'detailPuritySpec';
    puritySpec.innerHTML = `
      <div class="spec-label">${t('spec.purity')}</div>
      <div class="spec-value">${escapeHTML(purityStr)}</div>
    `;
    specsEl.insertBefore(puritySpec, priceSpec);
  }

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

  /* -- Metal picker + spot prices -- */
  let metals = [];
  let spotPriceMap = {};  // metal_id → price per troy oz

  try { metals = await apiGetMetals(); } catch (_) { /* non-fatal */ }

  let spotPricesFetching = false;
  let spotPricesFailed   = false;

  async function loadSpotPrices() {
    if (spotPricesFetching) return;
    spotPricesFetching = true;
    spotPricesFailed   = false;
    try {
      const spots = await apiGetSpotPrices(token);
      spots.forEach(s => { spotPriceMap[s.metal_id] = s.spot_price_usd_per_oz; });
      spotPricesFailed = spots.length === 0;
    } catch (_) {
      spotPricesFailed = true;
    } finally {
      spotPricesFetching = false;
    }
    updatePricePreview();
    updateRatesDisplay();
  }

  /* -- Spot rates display (per gram) -- */
  const syncRatesEl = document.getElementById('syncRates');

  function updateRatesDisplay() {
    if (!syncRatesEl) return;
    const items = metals.filter(m => spotPriceMap[m.id]);
    if (items.length === 0) { syncRatesEl.style.display = 'none'; return; }
    syncRatesEl.innerHTML = items.map(m => {
      const perGram = spotPriceMap[m.id] / GRAMS_PER_OZ;
      return `<div class="sync-rate-item">
        <span class="sync-rate-name">${escapeHTML(m.name)}</span>
        <span class="sync-rate-value">${formatPrice(perGram)}<span style="font-size:11px;font-weight:400;color:var(--text-muted)">/g</span></span>
      </div>`;
    }).join('');
    syncRatesEl.style.display = '';
  }

  // Initial load — non-blocking, fires once on page load
  loadSpotPrices();

  /* -- Purchase locations -- */
  let locations = [];
  const locationSelect    = document.getElementById('purchaseLocation');
  const newLocationGroup  = document.getElementById('newLocationGroup');
  const newLocationInput  = document.getElementById('newLocationName');
  const addLocationBtn    = document.getElementById('addLocationBtn');

  try { locations = await apiGetLocations(token); } catch (_) { /* non-fatal */ }

  function populateLocationSelect(selectedId) {
    if (!locationSelect) return;
    locationSelect.innerHTML = '';
    const noneOpt = document.createElement('option');
    noneOpt.value = '';
    noneOpt.textContent = t('form.location.none');
    locationSelect.appendChild(noneOpt);

    locations.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc.id;
      opt.textContent = loc.name;
      locationSelect.appendChild(opt);
    });

    const addOpt = document.createElement('option');
    addOpt.value = '__new__';
    addOpt.textContent = t('form.location.add_new');
    locationSelect.appendChild(addOpt);

    if (selectedId) locationSelect.value = selectedId;
  }

  populateLocationSelect();

  locationSelect?.addEventListener('change', () => {
    if (newLocationGroup) {
      newLocationGroup.style.display = locationSelect.value === '__new__' ? '' : 'none';
    }
  });

  addLocationBtn?.addEventListener('click', async () => {
    const name = newLocationInput?.value.trim();
    if (!name) return;
    addLocationBtn.disabled = true;
    try {
      const loc = await apiCreateLocation(token, name);
      locations.push(loc);
      locations.sort((a, b) => a.name.localeCompare(b.name));
      populateLocationSelect(loc.id);
      if (newLocationGroup) newLocationGroup.style.display = 'none';
      if (newLocationInput) newLocationInput.value = '';
    } catch (err) {
      if (err.status === 409) {
        // Already exists — just select it
        const existing = locations.find(l => l.name.toLowerCase() === name.toLowerCase());
        if (existing) { populateLocationSelect(existing.id); newLocationGroup.style.display = 'none'; }
        else showToast(err.message || 'Location already exists.', 'error');
      } else {
        showToast(err.message || 'Failed to add location.', 'error');
      }
    } finally {
      addLocationBtn.disabled = false;
    }
  });

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

    // Show/hide karat field and manual price field
    if (karatGroup) karatGroup.style.display = metal ? '' : 'none';
    const manualPriceGroup = document.getElementById('manualPriceGroup');
    if (manualPriceGroup) manualPriceGroup.style.display = metal ? 'none' : '';

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

    updatePricePreview();
  }

  /* -- Price preview -- */
  const pricePreview        = document.getElementById('pricePreview');
  const previewMarketRate   = document.getElementById('previewMarketRate');
  const previewListingPrice = document.getElementById('previewListingPrice');
  const previewMinRow       = document.getElementById('previewMinRow');
  const previewMin          = document.getElementById('previewMin');
  const previewWarning      = document.getElementById('previewWarning');

  const GRAMS_PER_OZ = 31.1035;

  function updatePricePreview() {
    if (!selectedMetal || !pricePreview) return;

    pricePreview.style.display = '';

    const spotPrice   = spotPriceMap[selectedMetal.id];
    const weightGrams = parseFloat(document.getElementById('weight')?.value);
    const karat       = parseFloat(purityKarat?.value);
    const multiplier  = parseFloat(document.getElementById('priceMultiplier')?.value);
    const flatMarkup  = parseFloat(document.getElementById('flatMarkup')?.value) || 0;
    const denom       = selectedMetal.purity_denominator;

    // Spot price not yet available
    if (!spotPrice) {
      if (previewMarketRate) previewMarketRate.textContent = '—';
      if (previewListingPrice) {
        previewListingPrice.textContent = spotPricesFetching ? 'Fetching…'
          : spotPricesFailed            ? 'Spot price unavailable'
          :                               '—';
      }
      return;
    }

    if (isNaN(weightGrams) || isNaN(karat) || isNaN(multiplier)) {
      if (previewMarketRate)   previewMarketRate.textContent   = '—';
      if (previewListingPrice) previewListingPrice.textContent = '—';
      return;
    }

    const marketRate   = (weightGrams / GRAMS_PER_OZ) * spotPrice * (karat / denom);
    const listingPrice = marketRate * multiplier + flatMarkup;

    if (previewMarketRate)   previewMarketRate.textContent   = formatPrice(marketRate);
    if (previewListingPrice) previewListingPrice.textContent = formatPrice(listingPrice);

    // Minimum price rule: listing must be >= cost * 1.1
    const cost    = parseFloat(document.getElementById('cost')?.value);
    const minPrice = (!isNaN(cost) && cost > 0) ? cost * 1.1 : null;
    const belowMin = minPrice !== null && listingPrice < minPrice;

    if (previewMinRow)  previewMinRow.style.display  = minPrice !== null ? '' : 'none';
    if (previewMin)     previewMin.textContent        = minPrice !== null ? formatPrice(minPrice) : '—';
    if (previewWarning) previewWarning.style.display  = belowMin ? '' : 'none';
    if (pricePreview)   pricePreview.classList.toggle('below-min', belowMin);
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

  // Wire live price preview on input changes
  ['weight', 'priceMultiplier', 'flatMarkup', 'cost'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updatePricePreview);
  });
  purityKarat?.addEventListener('input', updatePricePreview);

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

      const isMulti    = p.quantity > 1;
      // Build detail sub-line: metal · purity · multiplier
      const metalDetail = (() => {
        if (!p.metal) return '';
        const purity = p.purity_karat
          ? (p.metal.purity_denominator === 24 ? `${p.purity_karat}k` : `${p.purity_karat}`)
          : '';
        const mult = (p.price_multiplier && p.price_multiplier !== 1) ? `×${p.price_multiplier}` : '';
        return [p.metal.name, purity, mult].filter(Boolean).join(' · ');
      })();
      const locationDetail = p.purchase_location?.name || '';

      // Status cell: badge for single-unit; unit counters for multi-unit
      const statusCell = isMulti
        ? `<div class="unit-counts">
             <span class="unit-badge available">${p.quantity_available} ${t('units.available')}</span>
             ${p.quantity_pending > 0 ? `<span class="unit-badge pending">${p.quantity_pending} ${t('units.pending')}</span>` : ''}
             ${p.quantity_sold    > 0 ? `<span class="unit-badge sold">${p.quantity_sold} ${t('units.sold')}</span>` : ''}
           </div>
           <div class="unit-actions">
             ${p.quantity_available > 0 ? `<button class="btn-unit sell"    data-action="sell"    data-id="${p.id}">${t('btn.sell_one')}</button>` : ''}
             ${p.quantity_available > 0 ? `<button class="btn-unit pending" data-action="pending" data-id="${p.id}">${t('btn.pending_one')}</button>` : ''}
             ${p.quantity_pending   > 0 ? `<button class="btn-unit restore" data-action="restore" data-id="${p.id}">${t('btn.restore')}</button>` : ''}
           </div>`
        : `<span class="status-badge ${statusClass(p.status)}">${statusLabel(p.status)}</span>`;

      tr.innerHTML = `
        <td>${imgHTML}</td>
        <td>
          <div class="table-name">${escapeHTML(productName(p))}</div>
          <div class="table-sub">${escapeHTML(categoryLabel(p.category))}${metalDetail ? ' · ' + escapeHTML(metalDetail) : ''}</div>
          ${locationDetail ? `<div class="table-loc">${escapeHTML(locationDetail)}</div>` : ''}
        </td>
        <td class="hide-mobile">${p.weight_grams ? p.weight_grams + 'g' : '—'}</td>
        <td>${formatPrice(p.price)}</td>
        <td>${statusCell}</td>
        <td>
          <div class="table-actions">
            <button class="btn-edit"   data-id="${p.id}">${t('btn.edit')}</button>
            <button class="btn-delete" data-id="${p.id}">${t('btn.delete')}</button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-edit').addEventListener('click',   () => startEdit(p));
      tr.querySelector('.btn-delete').addEventListener('click', () => deleteProduct(p.id));

      // Unit action buttons (multi-unit items only)
      tr.querySelectorAll('.btn-unit').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          try {
            const action = btn.dataset.action;
            const id     = parseInt(btn.dataset.id, 10);
            if (action === 'sell')    await apiAdjustUnits(token, id, 'available', 'sold');
            if (action === 'pending') await apiAdjustUnits(token, id, 'available', 'pending');
            if (action === 'restore') await apiAdjustUnits(token, id, 'pending',   'available');
            await reloadTable();
          } catch (err) {
            if (err.status === 401) { handleAuthError(); return; }
            showToast(err.message || 'Failed to update units.', 'error');
            btn.disabled = false;
          }
        });
      });

      tableBody.appendChild(tr);
    });
  }

  /* -- Price sync panel -- */
  const updateAllBtn      = document.getElementById('updateAllPricesBtn');
  const syncLastUpdatedEl = document.getElementById('syncLastUpdated');
  const syncCountdownEl   = document.getElementById('syncCountdown');

  let syncNextAt = null;

  function formatCountdown(target) {
    const diff = target - Date.now();
    if (diff <= 0) return t('sync.overdue');
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    if (days > 0)  return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  function updateCountdownDisplay() {
    if (!syncCountdownEl) return;
    syncCountdownEl.textContent = syncNextAt ? formatCountdown(syncNextAt) : '—';
  }

  async function loadSyncStatus() {
    try {
      const s = await apiGetSyncStatus(token);
      syncNextAt = s.next_sync_at ? new Date(s.next_sync_at) : null;
      if (syncLastUpdatedEl) {
        syncLastUpdatedEl.textContent = s.last_sync_at
          ? new Date(s.last_sync_at).toLocaleString()
          : t('sync.never');
      }
      updateCountdownDisplay();
    } catch (_) { /* non-fatal */ }
  }

  await loadSyncStatus();
  const _countdownInterval = setInterval(updateCountdownDisplay, 60000);
  // Re-poll sync status every 5 minutes
  setInterval(loadSyncStatus, 5 * 60 * 1000);

  if (updateAllBtn) {
    updateAllBtn.addEventListener('click', async () => {
      if (!confirm(t('sync.confirm_all'))) return;
      updateAllBtn.disabled    = true;
      updateAllBtn.textContent = t('sync.updating');
      try {
        const result = await apiRecalculateAllPrices(token);
        syncNextAt = result.next_sync_at ? new Date(result.next_sync_at) : null;
        updateCountdownDisplay();
        if (syncLastUpdatedEl) syncLastUpdatedEl.textContent = new Date().toLocaleString();
        showToast(`${t('sync.updated')}: ${result.total_updated} items`, 'success');
        await reloadTable();
      } catch (err) {
        if (err.status === 401) { handleAuthError(); return; }
        showToast(err.message || 'Failed to update prices.', 'error');
      } finally {
        updateAllBtn.disabled    = false;
        updateAllBtn.textContent = t('sync.update_all');
      }
    });
  }

  /* -- Multi-image upload wiring -- */
  const dropZone       = document.getElementById('dropZone');
  const imageFileInput = document.getElementById('imageFile');
  const imageGallery   = document.getElementById('imageGallery');
  const uploadStatus   = document.getElementById('uploadStatus');

  // In-memory ordered list of image URLs for the current form session
  let imageUrls = [];

  function renderGallery() {
    if (!imageGallery) return;
    imageGallery.innerHTML = '';
    if (imageUrls.length === 0) {
      imageGallery.style.display = 'none';
      return;
    }
    imageGallery.style.display = '';
    imageUrls.forEach((url, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'image-thumb';
      thumb.innerHTML = `
        <img src="${escapeAttr(url)}" alt="Image ${idx + 1}">
        ${idx === 0 ? '<div class="primary-badge">Primary</div>' : ''}
        <button type="button" class="remove-btn" aria-label="Remove image ${idx + 1}">✕</button>
      `;
      thumb.querySelector('.remove-btn').addEventListener('click', () => {
        imageUrls.splice(idx, 1);
        renderGallery();
      });
      imageGallery.appendChild(thumb);
    });
  }

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    uploadStatus.textContent = fileArray.length > 1
      ? `Uploading ${fileArray.length} images…`
      : 'Uploading…';
    uploadStatus.style.color = 'var(--gold-dark)';
    dropZone.classList.add('drag-over');

    let successCount = 0;
    const errors = [];
    // Upload in parallel
    await Promise.all(fileArray.map(async file => {
      try {
        const url = await apiUploadImage(token, file);
        imageUrls.push(url);
        successCount++;
      } catch (err) {
        errors.push(file.name + ': ' + err.message);
      }
    }));

    dropZone.classList.remove('drag-over');
    renderGallery();

    if (errors.length === 0) {
      uploadStatus.textContent = `✓ ${successCount} image${successCount > 1 ? 's' : ''} uploaded`;
      uploadStatus.style.color = '#2E7D32';
    } else {
      uploadStatus.textContent = `${successCount} uploaded, ${errors.length} failed: ${errors[0]}`;
      uploadStatus.style.color = '#C62828';
    }
    if (imageFileInput) imageFileInput.value = '';
  }

  if (dropZone) {
    dropZone.addEventListener('click', () => imageFileInput.click());
    dropZone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); imageFileInput.click(); }
    });
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });
  }

  if (imageFileInput) {
    imageFileInput.addEventListener('change', () => handleFiles(imageFileInput.files));
  }

  /* -- Show/hide sell price based on status -- */
  const sellPriceGroup = document.getElementById('sellPriceGroup');
  const statusSelect = document.getElementById('status');
  function updateSellPriceVisibility() {
    const status = statusSelect?.value;
    if (sellPriceGroup) {
      sellPriceGroup.style.display = (status === 'SOLD' || status === 'SALE_PENDING') ? '' : 'none';
    }
  }
  statusSelect?.addEventListener('change', updateSellPriceVisibility);
  updateSellPriceVisibility();

  /* -- Build API payload from form -- */
  function buildPayload() {
    const fld = id => document.getElementById(id);

    const enName = fld('productName')?.value.trim()   || '';
    const esName = fld('productNameEs')?.value.trim() || '';

    const translations = [];
    if (enName) translations.push({ language: 'en', name: enName, description: fld('description')?.value.trim()   || null });
    if (esName) translations.push({ language: 'es', name: esName, description: fld('descriptionEs')?.value.trim() || null });

    const costVal        = parseFloat(fld('cost')?.value);
    const sellPriceVal   = parseFloat(fld('sellPrice')?.value);
    const manualPriceVal = parseFloat(fld('manualPrice')?.value);
    const weightVal      = parseFloat(fld('weight')?.value);
    const multiplierVal  = parseFloat(fld('priceMultiplier')?.value);
    const flatMarkupVal  = parseFloat(fld('flatMarkup')?.value);
    const purityKaratVal = parseFloat(purityKarat?.value);
    const quantityVal    = parseInt(fld('quantity')?.value, 10);
    const locVal         = locationSelect?.value;

    return {
      category:             fld('category')?.value || '',
      metal_id:             selectedMetal ? selectedMetal.id : null,
      purity_karat:         selectedMetal && !isNaN(purityKaratVal) ? purityKaratVal : null,
      weight_grams:         isNaN(weightVal)      ? null : weightVal,
      price_multiplier:     isNaN(multiplierVal)  ? null : multiplierVal,
      flat_markup:          isNaN(flatMarkupVal)  ? null : flatMarkupVal,
      quantity:             isNaN(quantityVal)    ? 1    : quantityVal,
      purchase_location_id: (locVal && locVal !== '__new__') ? parseInt(locVal, 10) : null,
      cost:                 isNaN(costVal)        ? null : costVal,
      sell_price:           isNaN(sellPriceVal)   ? null : sellPriceVal,
      price:                (() => {
        if (!selectedMetal) return !isNaN(manualPriceVal) ? manualPriceVal : null;
        // Pass frontend-calculated price as fallback if backend spot price is unavailable
        const spot = spotPriceMap[selectedMetal.id];
        if (!spot) return null;
        const _w = weightVal, _k = purityKaratVal, _m = multiplierVal, _fm = flatMarkupVal || 0;
        if (isNaN(_w) || isNaN(_k) || isNaN(_m)) return null;
        const mr = (_w / GRAMS_PER_OZ) * spot * (_k / selectedMetal.purity_denominator);
        return Math.round((mr * _m + _fm) * 100) / 100;
      })(),
      image_urls:           imageUrls,
      status:               fld('status')?.value  || 'AVAILABLE',
      translations,
    };
  }

  /* -- Form submit (create or update) -- */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const missingName   = !document.getElementById('productName')?.value.trim();
    const missingKarat  = selectedMetal && !purityKarat?.value;
    const missingWeight = selectedMetal && !document.getElementById('weight')?.value;
    if (missingName || missingKarat || missingWeight) {
      showToast(t('toast.required'), 'error');
      return;
    }

    // Minimum price rule: listing price must be >= cost * 1.1
    const _cost = parseFloat(document.getElementById('cost')?.value);
    if (!isNaN(_cost) && _cost > 0) {
      let _listing = null;
      if (selectedMetal && spotPriceMap[selectedMetal.id]) {
        const _w  = parseFloat(document.getElementById('weight')?.value);
        const _k  = parseFloat(purityKarat?.value);
        const _m  = parseFloat(document.getElementById('priceMultiplier')?.value);
        const _fm = parseFloat(document.getElementById('flatMarkup')?.value) || 0;
        if (!isNaN(_w) && !isNaN(_k) && !isNaN(_m)) {
          const _spot = spotPriceMap[selectedMetal.id];
          const _mr   = (_w / GRAMS_PER_OZ) * _spot * (_k / selectedMetal.purity_denominator);
          _listing = _mr * _m + _fm;
        }
      }
      if (_listing !== null && _listing < _cost * 1.1) {
        showToast(
          `Listing price ${formatPrice(_listing)} is below cost + 10% minimum (${formatPrice(_cost * 1.1)}).`,
          'error'
        );
        return;
      }
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

    document.getElementById('productName').value    = product.name           || '';
    document.getElementById('productNameEs').value  = product.name_es        || '';
    document.getElementById('description').value    = product.description    || '';
    document.getElementById('descriptionEs').value  = product.description_es || '';
    document.getElementById('category').value       = product.category;
    document.getElementById('weight').value          = product.weight_grams    ?? '';
    document.getElementById('priceMultiplier').value = product.price_multiplier ?? '';
    document.getElementById('flatMarkup').value      = product.flat_markup      ?? 0;
    document.getElementById('quantity').value        = product.quantity         ?? 1;
    document.getElementById('cost').value            = product.cost             ?? '';
    document.getElementById('sellPrice').value      = product.sell_price       ?? '';
    document.getElementById('manualPrice').value    = product.price            ?? '';
    // Status: only allow direct editing for single-unit items
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.value = product.status;
      statusEl.disabled = product.quantity > 1;
    }
    updateSellPriceVisibility();

    // Restore purchase location selection
    populateLocationSelect(product.purchase_location?.id ?? '');
    if (newLocationGroup) newLocationGroup.style.display = 'none';

    // Restore metal picker selection
    const metalForItem = product.metal ? metals.find(m => m.id === product.metal.id) : null;
    selectMetal(metalForItem || null);
    if (purityKarat) purityKarat.value = product.purity_karat ?? '';

    // Restore image gallery from existing item images
    imageUrls = product.image_urls ? [...product.image_urls] : [];
    renderGallery();
    if (uploadStatus) uploadStatus.textContent = '';

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
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.disabled = false;
    form.reset();
    selectMetal(null);
    if (purityKarat) purityKarat.value = '';
    if (pricePreview) pricePreview.style.display = 'none';
    const _mpg = document.getElementById('manualPriceGroup');
    if (_mpg) _mpg.style.display = '';
    const _mp = document.getElementById('manualPrice');
    if (_mp) _mp.value = '';
    populateLocationSelect();
    if (newLocationGroup) newLocationGroup.style.display = 'none';
    imageUrls = [];
    renderGallery();
    if (uploadStatus) uploadStatus.textContent = '';
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
