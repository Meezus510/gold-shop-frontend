/* ============================================================
   GOLD SHOP — batch.js
   Logic for the batch image upload and review page.
   Requires config.js and api.js to be loaded first.
   ============================================================ */

'use strict';

/* ── State ─────────────────────────────────────────────────── */

let _token        = null;
let _metals       = [];
let _rows         = [];          // enriched row objects from Claude
let _sourceImgUrl = null;        // Cloudinary URL of the uploaded sheet photo

const CATEGORIES = ['ring','necklace','bracelet','earrings','pendant','chain','bangle','brooch','set','other'];

/* ── Helpers ───────────────────────────────────────────────── */

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast-visible'));
  setTimeout(() => { t.classList.remove('toast-visible'); setTimeout(() => t.remove(), 300); }, 3500);
}

function getToken() { return sessionStorage.getItem('goldshop_token'); }

/* ── Steps ─────────────────────────────────────────────────── */

function showStep(n) {
  document.getElementById('step1').style.display = n === 1 ? '' : 'none';
  document.getElementById('step2').style.display = n === 2 ? '' : 'none';
  document.querySelectorAll('.step-indicator .step').forEach((el, i) => {
    el.classList.toggle('active',    i + 1 === n);
    el.classList.toggle('completed', i + 1 < n);
  });
}

/* ── Step 2: review table ───────────────────────────────────── */

function renderTable() {
  const tbody = document.getElementById('reviewBody');
  tbody.innerHTML = _rows.map((row, i) => renderRow(row, i)).join('');

  // Sync DOM → state on every change
  tbody.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('input', e => {
      const tr    = e.target.closest('tr');
      const idx   = +tr.dataset.idx;
      const field = e.target.dataset.field;
      _rows[idx][field] = e.target.type === 'number' ? (e.target.value === '' ? null : +e.target.value) : e.target.value;
      if (field === 'status') updateSellPriceCell(idx);
      if (field === 'status') updateStatusStyle(tr, e.target.value);
    });
  });
}

function renderRow(row, i) {
  const isSold = row.status === 'SOLD';
  const catOptions = CATEGORIES.map(c =>
    `<option value="${c}" ${row.category === c ? 'selected' : ''}>${c}</option>`
  ).join('');

  return `
    <tr data-idx="${i}">
      <td class="tbl-num">${i + 1}</td>
      <td><input data-field="name_es" value="${esc(row.name_es)}" class="tbl-input" style="min-width:140px"></td>
      <td><input data-field="name_en" value="${esc(row.name_en)}" class="tbl-input" style="min-width:140px"></td>
      <td>
        <select data-field="category" class="tbl-input tbl-select">${catOptions}</select>
      </td>
      <td><input data-field="cost" type="number" step="0.01" min="0" value="${esc(row.cost ?? '')}" class="tbl-input tbl-num-input"></td>
      <td><input data-field="weight_grams" type="number" step="0.01" min="0" value="${esc(row.weight_grams ?? '')}" class="tbl-input tbl-num-input"></td>
      <td><input data-field="listed_price_flat" type="number" step="0.01" min="0" value="${esc(row.listed_price_flat ?? '')}" class="tbl-input tbl-num-input"></td>
      <td><input data-field="listed_price_loan" type="number" step="0.01" min="0" value="${esc(row.listed_price_loan ?? '')}" class="tbl-input tbl-num-input"></td>
      <td>
        <select data-field="status" class="tbl-input tbl-status ${isSold ? 'status-sold' : 'status-available'}">
          <option value="AVAILABLE" ${!isSold ? 'selected' : ''}>Available</option>
          <option value="SOLD"      ${ isSold ? 'selected' : ''}>Sold</option>
        </select>
      </td>
      <td id="sell-cell-${i}">
        ${isSold
          ? `<input data-field="sell_price" type="number" step="0.01" min="0"
               value="${esc(row.sell_price ?? row.listed_price_flat ?? '')}"
               class="tbl-input tbl-num-input" placeholder="Sell $">`
          : `<span class="tbl-na">—</span>`}
      </td>
      <td>
        <button class="tbl-delete-btn" onclick="deleteRow(${i})" title="Remove row" aria-label="Remove row ${i + 1}">✕</button>
      </td>
    </tr>`;
}

function updateSellPriceCell(idx) {
  const cell  = document.getElementById(`sell-cell-${idx}`);
  const row   = _rows[idx];
  const isSold = row.status === 'SOLD';
  if (isSold) {
    const defaultVal = row.sell_price ?? row.listed_price_flat ?? '';
    cell.innerHTML = `<input data-field="sell_price" type="number" step="0.01" min="0"
      value="${esc(defaultVal)}" class="tbl-input tbl-num-input" placeholder="Sell $">`;
    cell.querySelector('input').addEventListener('input', e => {
      _rows[idx].sell_price = e.target.value === '' ? null : +e.target.value;
    });
  } else {
    cell.innerHTML = `<span class="tbl-na">—</span>`;
    _rows[idx].sell_price = null;
  }
}

function updateStatusStyle(tr, status) {
  const sel = tr.querySelector('[data-field="status"]');
  sel.classList.toggle('status-sold',      status === 'SOLD');
  sel.classList.toggle('status-available', status !== 'SOLD');
}

function deleteRow(i) {
  _rows.splice(i, 1);
  renderTable();
  document.getElementById('rowCount').textContent = `${_rows.length} item${_rows.length !== 1 ? 's' : ''}`;
}

/* ── Step 1: parse ─────────────────────────────────────────── */

async function handleParse(e) {
  e.preventDefault();

  const metalId = +document.getElementById('batchMetal').value;
  const purity  = +document.getElementById('batchPurity').value;
  const file    = document.getElementById('batchFile').files[0];
  const btn     = document.getElementById('parseBtn');

  if (!metalId || !purity || !file) {
    showToast('Please select metal, purity, and an image.', 'error');
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Parsing image…';

  try {
    const result = await apiParseBatchImage(_token, file);

    _rows         = result.rows.map(row => ({ status: 'AVAILABLE', ...row }));
    _sourceImgUrl = result.source_image_url;

    // Pull batch defaults from first row
    const firstRow = _rows[0] || {};
    document.getElementById('batchDate').value     = firstRow.purchase_date     || '';
    document.getElementById('batchLocation').value = firstRow.purchase_location || '';

    // Show source image preview
    if (_sourceImgUrl) {
      const img = document.getElementById('sourcePreview');
      img.src   = _sourceImgUrl;
      img.style.display = '';
    }

    document.getElementById('rowCount').textContent =
      `${_rows.length} item${_rows.length !== 1 ? 's' : ''}`;

    // Store batch-level selections for save step
    document.getElementById('step2').dataset.metalId = metalId;
    document.getElementById('step2').dataset.purity  = purity;

    renderTable();
    showStep(2);

  } catch (err) {
    showToast(err.message || 'Failed to parse image. Please try again.', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Parse Image';
  }
}

/* ── Step 2: save ──────────────────────────────────────────── */

async function handleSave() {
  const btn      = document.getElementById('saveBtn');
  const metalId  = +document.getElementById('step2').dataset.metalId;
  const purity   = +document.getElementById('step2').dataset.purity;
  const date     = document.getElementById('batchDate').value     || null;
  const location = document.getElementById('batchLocation').value || null;

  if (!_rows.length) {
    showToast('No rows to save.', 'error');
    return;
  }

  // Apply batch-level date and location to every row
  const rows = _rows.map(row => ({
    ...row,
    purchase_date:     date,
    purchase_location: location || row.purchase_location || null,
    qty:               row.qty || 1,
  }));

  btn.disabled    = true;
  btn.textContent = 'Saving…';

  try {
    const created = await apiCreateBatch(_token, {
      metal_id:     metalId,
      purity_karat: purity,
      rows,
    });

    const available = created.filter(i => i.status === 'AVAILABLE').length;
    const sold      = created.filter(i => i.status === 'SOLD').length;

    showToast(`✓ ${created.length} items saved (${available} available, ${sold} sold).`);

    // Show success state and offer to go back to admin
    document.getElementById('saveResult').innerHTML = `
      <div class="save-success">
        <div class="success-icon">✓</div>
        <h3>${created.length} Items Added to Inventory</h3>
        <p>${available} available &nbsp;·&nbsp; ${sold} sold</p>
        <div class="success-actions">
          <a href="admin.html" class="btn-primary">Go to Inventory</a>
          <button class="btn-secondary" onclick="resetBatch()">Upload Another Sheet</button>
        </div>
      </div>`;
    document.getElementById('saveBtnRow').style.display = 'none';

  } catch (err) {
    showToast(err.message || 'Failed to save items. Please try again.', 'error');
    btn.disabled    = false;
    btn.textContent = 'Save All Items';
  }
}

function resetBatch() {
  _rows = [];
  _sourceImgUrl = null;
  document.getElementById('batchFile').value           = '';
  document.getElementById('fileLabel').textContent     = 'Choose file or drag & drop';
  document.getElementById('sourcePreview').style.display = 'none';
  document.getElementById('saveBtnRow').style.display  = '';
  document.getElementById('saveResult').innerHTML      = '';
  showStep(1);
}

/* ── File drag & drop ──────────────────────────────────────── */

function initDropZone() {
  const zone  = document.getElementById('dropZone');
  const input = document.getElementById('batchFile');
  const label = document.getElementById('fileLabel');

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) { input.files = e.dataTransfer.files; label.textContent = file.name; }
  });
  input.addEventListener('change', () => {
    label.textContent = input.files[0]?.name || 'Choose file or drag & drop';
  });
}

/* ── Init ──────────────────────────────────────────────────── */

async function initBatch() {
  _token = getToken();
  if (!_token) {
    // Redirect to admin login
    window.location.href = 'admin.html';
    return;
  }

  // Load metals for the selector
  try {
    _metals = await apiGetMetals();
    const sel = document.getElementById('batchMetal');
    _metals.forEach(m => {
      const opt = document.createElement('option');
      opt.value       = m.id;
      opt.textContent = m.name;
      sel.appendChild(opt);
    });
  } catch (_) { /* non-fatal */ }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('goldshop_token');
    window.location.href = 'admin.html';
  });

  document.getElementById('parseForm').addEventListener('submit', handleParse);
  document.getElementById('saveBtn').addEventListener('click', handleSave);
  document.getElementById('backBtn').addEventListener('click', () => showStep(1));

  initDropZone();
  showStep(1);
}

document.addEventListener('DOMContentLoaded', initBatch);
