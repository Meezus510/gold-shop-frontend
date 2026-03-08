/* ============================================================
   GOLD SHOP — app.js
   Mock data + rendering logic for catalog and detail pages
   Requires i18n.js to be loaded first.
   ============================================================ */

'use strict';

/* ── Mock product data ─────────────────────────────────────── */
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "22k Gold Necklace",
    name_es: "Collar de Oro 22k",
    description: "Traditional handcrafted necklace with intricate filigree detailing. A timeless heirloom piece that pairs beautifully with both contemporary and traditional attire.",
    description_es: "Collar artesanal tradicional con intrincado trabajo de filigrana. Una pieza atemporal que combina perfectamente con atuendos contemporáneos y tradicionales.",
    category: "necklace",
    weight_grams: 25,
    price: 2150,
    status: "AVAILABLE",
    image_url: ""
  },
  {
    id: 2,
    name: "18k Bridal Bangles Set",
    name_es: "Set de Brazaletes de Novia 18k",
    description: "Elegant set of six matching bangles with fine engraving. Ideal for weddings and special occasions.",
    description_es: "Elegante juego de seis brazaletes a juego con finos grabados. Ideal para bodas y ocasiones especiales.",
    category: "bangle",
    weight_grams: 48,
    price: 3900,
    status: "AVAILABLE",
    image_url: ""
  },
  {
    id: 3,
    name: "22k Gold Earrings",
    name_es: "Aretes de Oro 22k",
    description: "Delicate drop earrings with a polished finish and subtle floral motif. Lightweight and perfect for everyday wear.",
    description_es: "Delicados aretes colgantes con acabado pulido y sutil motivo floral. Ligeros y perfectos para el uso diario.",
    category: "earring",
    weight_grams: 6,
    price: 520,
    status: "SALE_PENDING",
    image_url: ""
  },
  {
    id: 4,
    name: "24k Gold Coin",
    name_es: "Moneda de Oro 24k",
    description: "Pure 24 karat gold bullion coin — a secure and stylish investment. Comes with authenticity certificate.",
    description_es: "Moneda de oro puro 24 quilates — una inversión segura y atractiva. Incluye certificado de autenticidad.",
    category: "coin",
    weight_grams: 10,
    price: 950,
    status: "AVAILABLE",
    image_url: ""
  },
  {
    id: 5,
    name: "18k Diamond Ring",
    name_es: "Anillo de Diamante 18k",
    description: "Solitaire ring with 0.5ct natural diamond set in 18k yellow gold. Certified and hallmarked.",
    description_es: "Anillo solitario con diamante natural de 0.5 quilates engastado en oro amarillo 18k. Certificado y sellado.",
    category: "ring",
    weight_grams: 4,
    price: 1850,
    status: "SOLD",
    image_url: ""
  },
  {
    id: 6,
    name: "22k Gold Bracelet",
    name_es: "Pulsera de Oro 22k",
    description: "Woven chain bracelet with lobster clasp. Smooth texture and lasting shine.",
    description_es: "Pulsera de cadena trenzada con cierre de langosta. Textura suave y brillo duradero.",
    category: "bracelet",
    weight_grams: 15,
    price: 1290,
    status: "AVAILABLE",
    image_url: ""
  },
  {
    id: 7,
    name: "22k Jhumka Earrings",
    name_es: "Aretes Jhumka 22k",
    description: "Traditional bell-shaped jhumka with granulation work. A staple piece for festive dressing.",
    description_es: "Jhumka tradicional en forma de campana con trabajo de granulación. Una pieza esencial para la vestimenta festiva.",
    category: "earring",
    weight_grams: 12,
    price: 1030,
    status: "AVAILABLE",
    image_url: ""
  },
  {
    id: 8,
    name: "18k Gold Pendant",
    name_es: "Dije de Oro 18k",
    description: "Geometric hollow pendant on a fine cable chain. Modern and minimalist design.",
    description_es: "Dije geométrico hueco en cadena fina tipo cable. Diseño moderno y minimalista.",
    category: "necklace",
    weight_grams: 8,
    price: 720,
    status: "SALE_PENDING",
    image_url: ""
  },
  {
    id: 9,
    name: "24k Gold Bar 5g",
    name_es: "Barra de Oro 24k 5g",
    description: "Investment grade 999.9 fine gold bar. Sealed with tamper-evident packaging and assay certificate.",
    description_es: "Barra de oro fino 999.9 para inversión. Sellada con empaque de seguridad y certificado de ensayo.",
    category: "coin",
    weight_grams: 5,
    price: 480,
    status: "AVAILABLE",
    image_url: ""
  },
  {
    id: 10,
    name: "22k Kundan Necklace",
    name_es: "Collar Kundan 22k",
    description: "Elaborate Kundan necklace featuring polki stones and enamel work on the reverse. Handcrafted by master artisans.",
    description_es: "Elaborado collar Kundan con piedras polki y trabajo en esmalte al reverso. Hecho a mano por artesanos expertos.",
    category: "necklace",
    weight_grams: 62,
    price: 5300,
    status: "AVAILABLE",
    image_url: ""
  },
  {
    id: 11,
    name: "18k Gold Anklet",
    name_es: "Tobillera de Oro 18k",
    description: "Dainty chain anklet with small coin charms. Adjustable length for a perfect fit.",
    description_es: "Delicada tobillera de cadena con pequeños dijes de monedas. Largo ajustable para un ajuste perfecto.",
    category: "bracelet",
    weight_grams: 7,
    price: 610,
    status: "SOLD",
    image_url: ""
  },
  {
    id: 12,
    name: "22k Twisted Bangle",
    name_es: "Brazalete Trenzado 22k",
    description: "Classic twisted rope design bangle. Bold, polished, and versatile enough for any occasion.",
    description_es: "Brazalete clásico de diseño retorcido. Audaz, pulido y versátil para cualquier ocasión.",
    category: "bangle",
    weight_grams: 22,
    price: 1900,
    status: "AVAILABLE",
    image_url: ""
  }
];

/* Category icons used in placeholders */
const CATEGORY_ICONS = {
  necklace:  '📿',
  bangle:    '⭕',
  earring:   '✨',
  ring:      '💍',
  bracelet:  '🔗',
  coin:      '🪙',
  default:   '💛'
};

/* ── Storage helpers ───────────────────────────────────────── */

function getAllProducts() {
  try {
    const stored = localStorage.getItem('goldshop_products');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return [...MOCK_PRODUCTS];
}

function saveProducts(products) {
  try {
    localStorage.setItem('goldshop_products', JSON.stringify(products));
  } catch (_) {}
}

function getProductById(id) {
  return getAllProducts().find(p => String(p.id) === String(id)) || null;
}

/* ── Formatting helpers ────────────────────────────────────── */

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

/* Return the product name in the active language, falling back to English. */
function productName(product) {
  if (getLang() === 'es' && product.name_es) return product.name_es;
  return product.name;
}

/* Return the product description in the active language, falling back to English. */
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

function initCatalog() {
  const grid       = document.getElementById('productGrid');
  const countEl    = document.getElementById('productCount');
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (!grid) return;

  let activeFilter = 'all';

  function render(filter) {
    const products = getAllProducts();
    const filtered = filter === 'all'
      ? products
      : products.filter(p => p.category?.toLowerCase() === filter);

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

function initDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) { redirectHome(); return; }

  const product = getProductById(id);
  if (!product) { redirectHome(); return; }

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
      window.open(`https://wa.me/?text=${encodeURIComponent(msgText)}`, '_blank');
    });
  }
}

function redirectHome() {
  window.location.href = 'index.html';
}

/* ── Admin page ────────────────────────────────────────────── */

function initAdmin() {
  const form         = document.getElementById('productForm');
  const tableBody    = document.getElementById('tableBody');
  const cancelBtn    = document.getElementById('cancelEdit');
  const formTitle    = document.getElementById('formTitle');
  const formSubtitle = document.getElementById('formSubtitle');
  const submitBtn    = document.getElementById('submitBtn');
  const imageInput   = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');

  if (!form) return;

  let editingId    = null;
  let imageDataURL = null;

  /* -- Image preview -- */
  if (imageInput) {
    imageInput.addEventListener('change', () => {
      const file = imageInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        imageDataURL = e.target.result;
        if (imagePreview) {
          imagePreview.src = imageDataURL;
          imagePreview.classList.add('visible');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  /* -- Form submit -- */
  form.addEventListener('submit', e => {
    e.preventDefault();

    const products = getAllProducts();
    const data = {
      name:            form.productName.value.trim(),
      name_es:         form.productNameEs.value.trim(),
      description:     form.description.value.trim(),
      description_es:  form.descriptionEs.value.trim(),
      category:        form.category.value.trim(),
      weight_grams:    parseFloat(form.weight.value),
      price:           parseFloat(form.price.value),
      status:          form.status.value,
      image_url:       imageDataURL || (editingId ? (products.find(p => p.id === editingId)?.image_url || '') : '')
    };

    if (!data.name || !data.weight_grams || !data.price) {
      showToast(t('toast.required'), 'error');
      return;
    }

    if (editingId !== null) {
      const idx = products.findIndex(p => p.id === editingId);
      if (idx > -1) products[idx] = { ...products[idx], ...data };
      showToast(t('toast.updated'), 'success');
    } else {
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      products.push({ id: newId, ...data });
      showToast(t('toast.added'), 'success');
    }

    saveProducts(products);
    resetForm();
    renderTable();
  });

  /* -- Cancel edit -- */
  if (cancelBtn) {
    cancelBtn.addEventListener('click', resetForm);
  }

  /* -- Auto-translate (one direction based on active language) -- */
  const activeLang         = getLang();
  const isEn               = activeLang === 'en';
  const fromLang           = isEn ? 'en' : 'es';
  const toLang             = isEn ? 'es' : 'en';

  const nameEnField        = document.getElementById('productName');
  const nameEsField        = document.getElementById('productNameEs');
  const descEnField        = document.getElementById('description');
  const descEsField        = document.getElementById('descriptionEs');

  const primaryNameField   = isEn ? nameEnField   : nameEsField;
  const primaryDescField   = isEn ? descEnField   : descEsField;
  const secondaryNameField = isEn ? nameEsField   : nameEnField;
  const secondaryDescField = isEn ? descEsField   : descEnField;

  /* Mark secondary fields as read-only — they are filled by auto-translation */
  [secondaryNameField, secondaryDescField].forEach(f => {
    if (f) { f.readOnly = true; f.classList.add('field-readonly'); }
  });

  const translateIndicator = document.getElementById(
    isEn ? 'translateIndicator' : 'translateIndicatorEn'
  );

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
      const res  = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
      );
      const data = await res.json();
      if (data.responseStatus === 200) {
        if (document.activeElement !== targetField) {
          targetField.value = data.responseData.translatedText;
        }
        setIndicator('done');
      } else {
        setIndicator('error');
      }
    } catch (_) {
      setIndicator('error');
    }
    setTimeout(() => setIndicator(null), 3000);
  }

  const debouncedTranslateName = debounce(
    text => doTranslate(text, fromLang, toLang, secondaryNameField), 800
  );
  const debouncedTranslateDesc = debounce(
    text => doTranslate(text, fromLang, toLang, secondaryDescField), 800
  );

  if (primaryNameField) primaryNameField.addEventListener('input', () => {
    if (document.activeElement === primaryNameField) debouncedTranslateName(primaryNameField.value);
  });
  if (primaryDescField) primaryDescField.addEventListener('input', () => {
    if (document.activeElement === primaryDescField) debouncedTranslateDesc(primaryDescField.value);
  });

  /* -- Render table -- */
  function renderTable() {
    if (!tableBody) return;
    const products = getAllProducts();
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
            <button class="btn-edit" data-id="${p.id}">${t('btn.edit')}</button>
            <button class="btn-delete" data-id="${p.id}">${t('btn.delete')}</button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-edit').addEventListener('click', () => startEdit(p.id));
      tr.querySelector('.btn-delete').addEventListener('click', () => deleteProduct(p.id));

      tableBody.appendChild(tr);
    });
  }

  /* -- Start editing a product -- */
  function startEdit(id) {
    const product = getProductById(id);
    if (!product) return;

    editingId    = id;
    imageDataURL = null;

    form.productName.value   = product.name;
    form.productNameEs.value = product.name_es || '';
    form.description.value   = product.description;
    form.descriptionEs.value = product.description_es || '';
    form.category.value      = product.category;
    form.weight.value      = product.weight_grams;
    form.price.value       = product.price;
    form.status.value      = product.status;

    if (imagePreview) {
      if (product.image_url) {
        imagePreview.src = product.image_url;
        imagePreview.classList.add('visible');
      } else {
        imagePreview.classList.remove('visible');
      }
    }

    if (formTitle)    formTitle.textContent    = t('form.edit.title');
    if (formSubtitle) formSubtitle.textContent = t('form.subtitle');
    if (submitBtn)    submitBtn.textContent     = t('form.btn.update');
    if (cancelBtn)    cancelBtn.style.display   = 'inline-block';
    /* Re-translate select options after value assignment */
    form.querySelectorAll('option[data-i18n]').forEach(opt => {
      opt.textContent = t(opt.dataset.i18n);
    });

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* -- Delete a product -- */
  function deleteProduct(id) {
    if (!confirm(t('confirm.delete'))) return;
    const products = getAllProducts().filter(p => p.id !== id);
    saveProducts(products);
    renderTable();
    showToast(t('toast.deleted'), 'info');
  }

  /* -- Reset form to add mode -- */
  function resetForm() {
    editingId    = null;
    imageDataURL = null;
    form.reset();
    if (imagePreview) imagePreview.classList.remove('visible');
    if (formTitle)    formTitle.textContent    = t('form.add.title');
    if (formSubtitle) formSubtitle.textContent = t('form.subtitle');
    if (submitBtn)    submitBtn.textContent     = t('form.btn.add');
    if (cancelBtn)    cancelBtn.style.display   = 'none';
    /* Re-translate select options — some browsers reset option text
       to original HTML when form.reset() is called. */
    form.querySelectorAll('option[data-i18n]').forEach(opt => {
      opt.textContent = t(opt.dataset.i18n);
    });
  }

  renderTable();
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
  toast.className = `toast ${type}`;

  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  });
}

/* ── Security helpers ──────────────────────────────────────── */

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

/* ── Init router ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();

  if (page === 'index.html' || page === '' || page === '/') {
    initCatalog();
  } else if (page === 'item.html') {
    initDetail();
  } else if (page === 'admin.html') {
    initAdmin();
  }

  /* Re-apply translations after dynamic content is rendered.
     i18n.js's DOMContentLoaded handler runs first (before this one),
     so static elements are already translated. This second pass ensures
     any elements that the init functions touch are also correctly translated
     (e.g. formTitle, submitBtn, select options after form.reset()). */
  if (typeof applyTranslations === 'function') applyTranslations();
});
