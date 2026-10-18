/** Browser-only Vault UI adapted from Aishwarya's Vault component. */
(() => {
  const categories = ['All', 'Syllabi', 'Lecture Slides', 'Notes', 'Assignments', 'PYQs', 'Question Banks', 'Other'];
  const state = { search: '', category: 'All', pendingFile: null, uploadCategory: 'Syllabi' };
  let mountedContainer = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function icon(name) {
    const path = name === 'upload'
      ? '<path d="M12 16V4m0 0L7 9m5-5 5 5M5 15v4h14v-4"/>'
      : '<path d="M3 6h7l2 2h9v11H3z"/>';
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  function toast(message) {
    const element = document.querySelector('#nx-toast');
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { element.hidden = true; }, 3600);
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function loadingBlock(message) {
    return `<div class="nxm-loading"><span class="nxm-spinner" aria-hidden="true"></span><p>${escapeHtml(message)}</p></div>`;
  }

  function emptyBlock(title, message) {
    return `<div class="nxm-empty"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p></div>`;
  }

  function errorBlock(message) {
    return `<div class="nxm-error"><p>${escapeHtml(message)}</p><button type="button" class="nx-secondary-button nxm-retry">Try again</button></div>`;
  }

  const fileStore = () => {
    if (!window.NexoraVaultFileStore) throw new Error('Browser Vault storage is unavailable. Refresh and try again.');
    return window.NexoraVaultFileStore;
  };

  function shell() {
    return `
      <div class="nxv-toolbar">
        <div class="nxv-search"><input type="search" id="nxv-search" placeholder="Search materials by filename, subject, or category" value="${escapeHtml(state.search)}" aria-label="Search Vault materials"></div>
        <button type="button" class="nx-primary-button" id="nxv-upload-btn">${icon('upload')}<span>Upload material</span></button>
        <input type="file" id="nxv-file-input" accept="application/pdf,.pdf" hidden>
      </div>
      <div class="nxv-filters" id="nxv-filters"></div>
      <p style="margin:8px 0 18px;color:var(--nx-muted);font-size:12px">Files are stored only in this browser and do not sync between devices.</p>
      <div id="nxv-upload-panel"></div>
      <div id="nxv-list">${loadingBlock('Loading your Vault…')}</div>
    `;
  }

  async function mount(container) {
    if (!container) return;
    mountedContainer = container;
    for (const selector of ['#nxv-filters', '#nxv-upload-category']) {
      const previous = container.querySelector(selector);
      if (previous) window.NexoraGlideSelect?.unmount(previous);
    }
    container.innerHTML = shell();
    wireToolbar(container);
    await refreshList(container);
  }

  function mountCategoryPicker(root, value, onChange, label, includeAll = false) {
    const options = categories.filter(category => includeAll || category !== 'All').map(item => ({ value: item, label: item }));
    if (window.NexoraGlideSelect) {
      window.NexoraGlideSelect.mount(root, {
        options,
        defaultValue: value,
        ariaLabel: label,
        showTags: false,
        accentColor: 'var(--nx-accent)',
        surfaceColor: 'var(--nx-surface)',
        highlightColor: 'var(--nx-accent-soft)',
        textColor: 'var(--nx-text)',
        size: 'lg',
        radius: 12,
        menuWidth: 216,
        placement: 'bottom',
        align: 'left',
        onChange
      });
      return;
    }
    root.innerHTML = `<select aria-label="${escapeHtml(label)}">${options.map(item => `<option value="${escapeHtml(item.value)}" ${item.value === value ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}</select>`;
    root.querySelector('select').addEventListener('change', event => onChange(event.target.value));
  }

  function wireToolbar(container) {
    const filterRoot = container.querySelector('#nxv-filters');
    mountCategoryPicker(filterRoot, state.category, category => {
      state.category = category;
      refreshList(container);
    }, 'Filter Vault materials by category', true);

    container.querySelector('#nxv-search').addEventListener('input', debounce(event => {
      state.search = event.target.value;
      refreshList(container);
    }, 200));

    container.querySelector('#nxv-upload-btn').addEventListener('click', () => container.querySelector('#nxv-file-input').click());
    container.querySelector('#nxv-file-input').addEventListener('change', event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        toast('Only PDF files are supported.');
        event.target.value = '';
        return;
      }
      state.pendingFile = file;
      state.uploadCategory = 'Syllabi';
      renderUploadPanel(container);
    });
  }

  function renderUploadPanel(container) {
    const panel = container.querySelector('#nxv-upload-panel');
    const priorPicker = panel.querySelector('#nxv-upload-category');
    if (priorPicker) window.NexoraGlideSelect?.unmount(priorPicker);
    if (!state.pendingFile) {
      panel.innerHTML = '';
      return;
    }
    panel.innerHTML = `
      <div class="nxv-upload-panel">
        <p style="grid-column:1/-1;margin:0;font-size:12px;color:var(--nx-muted)">Ready to add <strong>${escapeHtml(state.pendingFile.name)}</strong> to this browser's Vault.</p>
        <label class="nxm-field">Subject<input type="text" id="nxv-upload-subject" placeholder="e.g. Operating Systems" maxlength="120" value="General"></label>
        <label class="nxm-field nxv-upload-category-field">Category<span id="nxv-upload-category"></span></label>
        <div class="nxv-upload-actions">
          <button type="button" class="nx-secondary-button" id="nxv-upload-cancel">Cancel</button>
          <button type="button" class="nx-primary-button" id="nxv-upload-confirm">${icon('upload')}<span>Add to Vault</span></button>
        </div>
      </div>
    `;
    mountCategoryPicker(panel.querySelector('#nxv-upload-category'), state.uploadCategory, category => { state.uploadCategory = category; }, 'Choose a category for the uploaded material');
    panel.querySelector('#nxv-upload-cancel').addEventListener('click', () => {
      state.pendingFile = null;
      container.querySelector('#nxv-file-input').value = '';
      renderUploadPanel(container);
    });
    panel.querySelector('#nxv-upload-confirm').addEventListener('click', () => doUpload(container));
  }

  async function doUpload(container) {
    const panel = container.querySelector('#nxv-upload-panel');
    const file = state.pendingFile;
    if (!file) return;
    const subject = container.querySelector('#nxv-upload-subject').value.trim() || 'General';
    const category = state.uploadCategory;
    const categoryRoot = panel.querySelector('#nxv-upload-category');
    if (categoryRoot) window.NexoraGlideSelect?.unmount(categoryRoot);
    panel.innerHTML = loadingBlock('Saving to this browser…');
    try {
      await fileStore().putMany([file], { subject, category });
      state.pendingFile = null;
      container.querySelector('#nxv-file-input').value = '';
      panel.innerHTML = '';
      toast(`${file.name} saved to this browser's Vault.`);
      await refreshList(container);
    } catch (error) {
      panel.innerHTML = errorBlock(error.message || 'Could not save this file in browser storage.');
      panel.querySelector('.nxm-retry')?.addEventListener('click', () => renderUploadPanel(container));
    }
  }

  function normalizeRecord(record) {
    return {
      materialId: record.id,
      filename: record.name,
      subject: record.subject || 'General',
      category: record.category || 'Notes',
      size: record.size || record.blob?.size || 0,
      type: record.type || record.blob?.type || 'application/pdf',
      createdAt: record.createdAt
    };
  }

  async function refreshList(container) {
    const list = container.querySelector('#nxv-list');
    if (!list) return;
    list.innerHTML = loadingBlock('Loading your Vault…');
    try {
      const query = state.search.trim().toLocaleLowerCase();
      const materials = (await fileStore().list()).map(normalizeRecord).filter(item => {
        const matchesCategory = state.category === 'All' || item.category === state.category;
        const matchesSearch = !query || `${item.filename} ${item.subject} ${item.category}`.toLocaleLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      });
      if (!materials.length) {
        list.innerHTML = emptyBlock('No materials yet', query || state.category !== 'All'
          ? 'Nothing matches your search or filter. Try clearing them.'
          : 'Upload a syllabus, lecture slides, or notes to get started.');
        return;
      }
      for (const root of list.querySelectorAll('.nxv-edit-category')) window.NexoraGlideSelect?.unmount(root);
      list.innerHTML = `<div class="nxv-list">${materials.map(renderRow).join('')}</div>`;
      wireRowActions(container, list);
    } catch (error) {
      list.innerHTML = errorBlock(error.message || 'Could not load files from this browser.');
      list.querySelector('.nxm-retry')?.addEventListener('click', () => refreshList(container));
    }
  }

  function formatSize(bytes) {
    if (!Number(bytes)) return 'PDF';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = Number(bytes), index = 0;
    while (size >= 1024 && index < units.length - 1) { size /= 1024; index += 1; }
    return `${size >= 10 || index === 0 ? Math.round(size) : size.toFixed(1)} ${units[index]}`;
  }

  function renderRow(material) {
    return `
      <div class="nxv-row" data-id="${escapeHtml(material.materialId)}">
        <span class="nxv-row-icon">${icon('vault')}</span>
        <div class="nxv-row-main">
          <strong>${escapeHtml(material.filename)}</strong>
          <small><span>${escapeHtml(material.subject)}</span><span>·</span><span>${escapeHtml(material.category)}</span><span>·</span><span>${formatSize(material.size)}</span><span>·</span><span>${escapeHtml(formatDate(material.createdAt))}</span></small>
        </div>
        <div class="nxv-row-actions">
          <button type="button" data-action="open">Preview</button>
          <button type="button" data-action="edit">Edit</button>
          <button type="button" data-action="delete" class="nxv-danger">Delete</button>
        </div>
      </div>
    `;
  }

  function renderEditRow(row, material) {
    row.innerHTML = `
      <span class="nxv-row-icon">${icon('vault')}</span>
      <div class="nxv-row-main" style="display:flex;flex-direction:column;gap:8px">
        <strong>${escapeHtml(material.filename)}</strong>
        <div style="display:grid;grid-template-columns:minmax(180px,1fr) minmax(160px,220px);gap:10px;align-items:end">
          <label class="nxm-field">Subject<input type="text" data-edit-subject value="${escapeHtml(material.subject)}" maxlength="120"></label>
          <label class="nxm-field">Category<span class="nxv-edit-category" data-edit-category></span></label>
        </div>
      </div>
      <div class="nxv-row-actions">
        <button type="button" data-action="save-edit" class="nx-primary-button">Save</button>
        <button type="button" data-action="cancel-edit" class="nx-secondary-button">Cancel</button>
      </div>
    `;
    row.dataset.editCategory = material.category;
    mountCategoryPicker(row.querySelector('[data-edit-category]'), material.category, category => { row.dataset.editCategory = category; }, 'Edit material category');
  }

  async function saveEdit(container, row, id) {
    const button = row.querySelector('[data-action="save-edit"]');
    button.disabled = true;
    button.textContent = 'Saving…';
    try {
      await fileStore().updateMetadata(id, {
        subject: row.querySelector('[data-edit-subject]').value.trim() || 'General',
        category: row.dataset.editCategory || 'Notes'
      });
      toast('Vault details updated in this browser.');
      await refreshList(container);
    } catch (error) {
      toast(error.message || 'Could not update this file.');
      button.disabled = false;
      button.textContent = 'Save';
    }
  }

  async function openPreview(id) {
    let objectUrl = '';
    let viewerHost;
    let dialog;
    try {
      const record = await fileStore().get(id);
      if (!record?.blob) throw new Error('This file is no longer in the Vault.');
      if (!window.NexoraPdfViewer) throw new Error('The in-app PDF viewer did not load. Refresh and try again.');
      objectUrl = URL.createObjectURL(record.blob);
      dialog = document.createElement('dialog');
      dialog.className = 'nxos-preview-dialog nxv-preview-dialog';
      dialog.setAttribute('aria-label', `PDF preview: ${record.name}`);
      dialog.innerHTML = `<div class="nxos-preview-head"><strong class="nx-m3-title">${escapeHtml(record.name)}</strong><button type="button" class="nx-secondary-button nxos-preview-close" aria-label="Close PDF preview">Close</button></div><div class="nx-pdf-react-root"></div>`;
      viewerHost = dialog.querySelector('.nx-pdf-react-root');
      document.body.append(dialog);
      const cleanup = () => {
        window.NexoraPdfViewer?.unmount(viewerHost);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        dialog.remove();
      };
      dialog.addEventListener('close', cleanup, { once: true });
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
      dialog.querySelector('.nxos-preview-close').addEventListener('click', () => dialog.close());
      window.NexoraPdfViewer.render(viewerHost, { fileUrl: objectUrl, filename: record.name });
      dialog.showModal();
    } catch (error) {
      if (dialog?.open) dialog.close();
      else {
        if (viewerHost) window.NexoraPdfViewer?.unmount(viewerHost);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        dialog?.remove();
      }
      toast(error.message || 'Could not preview this PDF.');
    }
  }

  function wireRowActions(container, list) {
    list.addEventListener('click', async event => {
      const button = event.target.closest('[data-action]');
      const row = button?.closest('.nxv-row');
      const id = row?.dataset.id;
      if (!button || !id) return;
      const action = button.dataset.action;
      if (action === 'open') return openPreview(id);
      if (action === 'edit') {
        const record = await fileStore().get(id);
        if (!record) return toast('This file is no longer in the Vault.');
        renderEditRow(row, normalizeRecord(record));
        return;
      }
      if (action === 'save-edit') return saveEdit(container, row, id);
      if (action === 'cancel-edit') return refreshList(container);
      if (action === 'delete') {
        if (!confirm('Delete this file from this browser’s Vault? This cannot be undone.')) return;
        try {
          await fileStore().remove(id);
          toast('File deleted from this browser.');
          await refreshList(container);
        } catch (error) {
          toast(error.message || 'Could not delete this file.');
        }
      }
    });
  }

  function debounce(callback, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => callback(...args), delay);
    };
  }

  window.NexoraVault = { mount };
  window.addEventListener('nexora:vault-updated', () => {
    if (mountedContainer) refreshList(mountedContainer);
  });
})();
