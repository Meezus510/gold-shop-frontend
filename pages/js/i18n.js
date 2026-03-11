/* ============================================================
   GOLD SHOP — i18n.js
   English / Spanish translations
   Must be loaded BEFORE app.js
   ============================================================ */

'use strict';

const TRANSLATIONS = {
  en: {
    /* Logo */
    'logo.tagline': 'Fine Jewelry',

    /* Navigation */
    'nav.catalog':   'Catalog',
    'nav.admin':     'Admin',
    'nav.viewStore': 'View Store',

    /* Language toggle */
    'lang.label': 'Language',

    /* Index hero */
    'hero.index.title':    'Our Collection',
    'hero.index.subtitle': 'Handcrafted gold jewelry & investment pieces, available in-store.',

    /* Admin hero */
    'hero.admin.title':    'Inventory Dashboard',
    'hero.admin.subtitle': 'Add, edit, and manage your gold shop listings.',

    /* Filter bar */
    'filter.label':     'Filter:',
    'filter.all':       'All',
    'filter.necklaces': 'Necklaces',
    'filter.bangles':   'Bangles',
    'filter.earrings':  'Earrings',
    'filter.rings':     'Rings',
    'filter.bracelets': 'Bracelets',
    'filter.coins':     'Coins & Bars',

    /* Item count */
    'count.one':  '1 item',
    'count.many': '{n} items',

    /* Grid empty */
    'grid.empty': 'No items found in this category.',

    /* Detail page */
    'detail.back':       'Back to Catalog',
    'spec.weight':       'Weight',
    'spec.price':        'Price',
    'detail.contact':    'Contact Store to Purchase',
    'detail.note.title': 'In-store purchase only.',
    'detail.note.body':  "Visit us or send a message — we'll hold the item for you.",
    'whatsapp.msg':      'Hello, I am interested in: {name} ({weight}g) priced at {price}.',

    /* Status badges */
    'status.available': 'Available',
    'status.pending':   'Sale Pending',
    'status.sold':      'Sold',

    /* Category names */
    'cat.necklace': 'Necklace',
    'cat.bangle':   'Bangle',
    'cat.earring':  'Earring',
    'cat.ring':     'Ring',
    'cat.bracelet': 'Bracelet',
    'cat.coin':     'Coin / Bar',
    'cat.other':    'Other',
    'cat.default':  'Gold',

    /* Admin badge */
    'admin.badge': 'Admin',

    /* Admin form */
    'form.add.title':          'Add New Item',
    'form.edit.title':         'Edit Item',
    'form.subtitle':           'Fill in the details below',
    'form.label.name':         'Product Name (English)',
    'form.label.name_es':      'Product Name (Spanish)',
    'form.label.desc':         'Description (English)',
    'form.label.desc_es':      'Description (Spanish)',
    'form.label.category':     'Category',
    'form.label.weight':       'Weight (g)',
    'form.label.price':        'Price (USD)',
    'form.label.status':       'Status',
    'form.label.cost':         'My Cost (USD)',
    'form.hint.cost':          'What you paid — never shown publicly',
    'form.label.sell_price':   'Final Sell Price (USD)',
    'form.hint.sell_price':    'Actual price the item sold for',
    'form.label.image':        'Image URL',
    'form.label.multiplier':   'Price Multiplier',
    'form.hint.multiplier':    'Multiplied by metal spot price × weight',
    'form.label.metal':        'Metal',
    'form.metal.na':           'N/A',
    'form.label.karat':        'Karat / Purity',
    'form.hint.karat':         'e.g. 22 for 22k gold (out of 24)',
    'form.hint.karat.gold':    'Karat out of 24 — e.g. 22 for 22k, 18 for 18k',
    'form.hint.karat.millesimal': 'Millesimal fineness out of {denom} — e.g. 925 for sterling silver',
    'form.hint.image':         'Paste a hosted image URL (Cloudinary, Imgur, etc.)',
    'form.placeholder.name':    'e.g. 22k Gold Necklace',
    'form.placeholder.name_es': 'e.g. Collar de Oro 22k',
    'form.placeholder.desc':    'Brief description of the item\u2026',
    'form.placeholder.desc_es': 'e.g. Traditional handcrafted necklace\u2026',
    'form.placeholder.weight': 'e.g. 25',
    'form.placeholder.price':  'e.g. 2150',
    'form.btn.add':            'Add Item',
    'form.btn.update':         'Update Item',
    'form.btn.cancel':         'Cancel',

    /* Image upload */
    'upload.text': 'Click or drag & drop to upload',
    'upload.hint': 'JPG, PNG, WEBP \u2014 max 5\u00a0MB',
    'upload.note': 'Image will be stored locally. For production, use a server upload.',

    /* Stats */
    'stats.total':     'Total Items',
    'stats.available': 'Available',
    'stats.pending':   'Sale Pending',
    'stats.sold':      'Sold',

    /* Inventory table */
    'table.title':      'Current Inventory',
    'table.subtitle':   'All items in your catalog',
    'table.col.item':   'Item',
    'table.col.weight': 'Weight',
    'table.col.price':  'Price',
    'table.col.status': 'Status',
    'table.empty':      'No items yet. Add your first product.',
    'btn.edit':         'Edit',
    'btn.delete':       'Delete',

    /* Toasts */
    'toast.added':    'Item added successfully.',
    'toast.updated':  'Item updated successfully.',
    'toast.deleted':  'Item deleted.',
    'toast.required': 'Please fill in all required fields.',

    /* Auto-translate */
    'translate.loading': 'Translating\u2026',
    'translate.done':    'Auto-translated',
    'translate.error':   'Translation failed',

    /* Confirm dialog */
    'confirm.delete': 'Are you sure you want to delete this item?',

    /* Footer */
    'footer.tagline': 'Browse online \u2014 purchase in person at our store.',
    'footer.admin':   'Admin Dashboard \u2014 authorized personnel only.',
    'footer.rights':  'All rights reserved.',
  },

  es: {
    /* Logo */
    'logo.tagline': 'Joyería Fina',

    /* Navigation */
    'nav.catalog':   'Catálogo',
    'nav.admin':     'Admin',
    'nav.viewStore': 'Ver Tienda',

    /* Language toggle */
    'lang.label': 'Idioma',

    /* Index hero */
    'hero.index.title':    'Nuestra Colección',
    'hero.index.subtitle': 'Joyería en oro artesanal y piezas de inversión, disponibles en tienda.',

    /* Admin hero */
    'hero.admin.title':    'Panel de Inventario',
    'hero.admin.subtitle': 'Agrega, edita y gestiona tu catálogo de joyería.',

    /* Filter bar */
    'filter.label':     'Filtrar:',
    'filter.all':       'Todo',
    'filter.necklaces': 'Collares',
    'filter.bangles':   'Brazaletes',
    'filter.earrings':  'Aretes',
    'filter.rings':     'Anillos',
    'filter.bracelets': 'Pulseras',
    'filter.coins':     'Monedas y Barras',

    /* Item count */
    'count.one':  '1 artículo',
    'count.many': '{n} artículos',

    /* Grid empty */
    'grid.empty': 'No se encontraron artículos en esta categoría.',

    /* Detail page */
    'detail.back':       'Volver al Catálogo',
    'spec.weight':       'Peso',
    'spec.price':        'Precio',
    'detail.contact':    'Contactar Tienda para Comprar',
    'detail.note.title': 'Solo compra en tienda.',
    'detail.note.body':  'Visítanos o envía un mensaje — te reservamos el artículo.',
    'whatsapp.msg':      'Hola, me interesa: {name} ({weight}g) con precio {price}.',

    /* Status badges */
    'status.available': 'Disponible',
    'status.pending':   'Venta Pendiente',
    'status.sold':      'Vendido',

    /* Category names */
    'cat.necklace': 'Collar',
    'cat.bangle':   'Brazalete',
    'cat.earring':  'Arete',
    'cat.ring':     'Anillo',
    'cat.bracelet': 'Pulsera',
    'cat.coin':     'Moneda / Barra',
    'cat.other':    'Otro',
    'cat.default':  'Oro',

    /* Admin badge */
    'admin.badge': 'Admin',

    /* Admin form */
    'form.add.title':          'Agregar Artículo',
    'form.edit.title':         'Editar Artículo',
    'form.subtitle':           'Completa los detalles a continuación',
    'form.label.name':         'Nombre del Producto (Inglés)',
    'form.label.name_es':      'Nombre del Producto (Español)',
    'form.label.desc':         'Descripción (Inglés)',
    'form.label.desc_es':      'Descripción (Español)',
    'form.label.category':     'Categoría',
    'form.label.weight':       'Peso (g)',
    'form.label.price':        'Precio (USD)',
    'form.label.status':       'Estado',
    'form.label.cost':         'Mi Costo (USD)',
    'form.hint.cost':          'Lo que pagaste — nunca se muestra públicamente',
    'form.label.sell_price':   'Precio Final de Venta (USD)',
    'form.hint.sell_price':    'Precio real al que se vendió el artículo',
    'form.label.image':        'URL de Imagen',
    'form.label.multiplier':   'Multiplicador de Precio',
    'form.hint.multiplier':    'Se multiplica por el precio del metal × peso',
    'form.label.metal':        'Metal',
    'form.metal.na':           'N/A',
    'form.label.karat':        'Quilate / Pureza',
    'form.hint.karat':         'ej. 22 para oro 22k (de 24)',
    'form.hint.karat.gold':    'Quilates de 24 — ej. 22 para 22k, 18 para 18k',
    'form.hint.karat.millesimal': 'Fineza milésimal de {denom} — ej. 925 para plata esterlina',
    'form.hint.image':         'Pega la URL de una imagen hospedada (Cloudinary, Imgur, etc.)',
    'form.placeholder.name':    'ej. 22k Gold Necklace',
    'form.placeholder.name_es': 'ej. Collar de Oro 22k',
    'form.placeholder.desc':    'Breve descripción en inglés\u2026',
    'form.placeholder.desc_es': 'ej. Collar artesanal tradicional\u2026',
    'form.placeholder.weight': 'ej. 25',
    'form.placeholder.price':  'ej. 2150',
    'form.btn.add':            'Agregar Artículo',
    'form.btn.update':         'Actualizar Artículo',
    'form.btn.cancel':         'Cancelar',

    /* Image upload */
    'upload.text': 'Haz clic o arrastra y suelta para subir',
    'upload.hint': 'JPG, PNG, WEBP \u2014 m\u00e1x. 5\u00a0MB',
    'upload.note': 'La imagen se guarda localmente. Para producción, usa un servidor.',

    /* Stats */
    'stats.total':     'Total Artículos',
    'stats.available': 'Disponibles',
    'stats.pending':   'Venta Pendiente',
    'stats.sold':      'Vendidos',

    /* Inventory table */
    'table.title':      'Inventario Actual',
    'table.subtitle':   'Todos los artículos de tu catálogo',
    'table.col.item':   'Artículo',
    'table.col.weight': 'Peso',
    'table.col.price':  'Precio',
    'table.col.status': 'Estado',
    'table.empty':      'Sin artículos aún. Agrega tu primer producto.',
    'btn.edit':         'Editar',
    'btn.delete':       'Eliminar',

    /* Toasts */
    'toast.added':    'Artículo agregado exitosamente.',
    'toast.updated':  'Artículo actualizado exitosamente.',
    'toast.deleted':  'Artículo eliminado.',
    'toast.required': 'Por favor completa todos los campos obligatorios.',

    /* Auto-translate */
    'translate.loading': 'Traduciendo\u2026',
    'translate.done':    'Auto-traducido',
    'translate.error':   'Error al traducir',

    /* Confirm dialog */
    'confirm.delete': '¿Estás seguro de que quieres eliminar este artículo?',

    /* Footer */
    'footer.tagline': 'Explora en línea \u2014 compra en persona en nuestra tienda.',
    'footer.admin':   'Panel de administración \u2014 solo personal autorizado.',
    'footer.rights':  'Todos los derechos reservados.',
  }
};

/* ── Core helpers ──────────────────────────────────────────── */

function getLang() {
  return localStorage.getItem('goldshop_lang') || 'en';
}

function setLang(lang) {
  localStorage.setItem('goldshop_lang', lang);
}

/**
 * Translate a key. Supports {placeholder} substitution:
 *   t('count.many', { n: 5 }) → "5 items"
 */
function t(key, vars) {
  const lang   = getLang();
  let   result = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en'][key] ?? key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
  }
  return result;
}

/**
 * Apply translations to all elements with data-i18n / data-i18n-placeholder
 * in the current document.
 */
function applyTranslations() {
  /* Text content */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  /* Placeholder attributes */
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  /* aria-label attributes */
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });

  /* Update <html lang=""> */
  document.documentElement.lang = getLang();
}

/**
 * Initialise the language toggle buttons.
 * Looks for elements with class .lang-btn and data-lang attribute.
 */
function initLangToggle() {
  const buttons = document.querySelectorAll('.lang-btn');
  const current = getLang();

  buttons.forEach(btn => {
    if (btn.dataset.lang === current) btn.classList.add('active');

    btn.addEventListener('click', () => {
      const newLang = btn.dataset.lang;
      if (newLang === getLang()) return;
      setLang(newLang);
      window.location.reload();
    });
  });
}

/* Auto-run on DOMContentLoaded.
   NOTE: app.js also calls applyTranslations() + initLangToggle() AFTER
   rendering dynamic content, so static elements that share IDs with
   dynamic ones (e.g. formTitle, submitBtn) end up correctly translated. */
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  initLangToggle();
});

