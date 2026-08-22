// --- MODULE: PAGE MANAGER ---
window.PageManager = {
  savePage() {
    if (window.DOM.canvas) {
      window.AppState.pages[window.AppState.currentPageIndex] = window.DOM.canvas.toDataURL('image/png');
    }
  },

  loadPage(index) {
    if (!window.DOM.wrapper || !window.DOM.bgCtx || !window.DOM.ctx) return;

    const rect = window.DOM.wrapper.getBoundingClientRect();
    const template = window.AppState.pageTemplates[index] || 'ruled';

    window.TemplateEngine.drawBackground(window.DOM.bgCtx, rect.width, rect.height, template, index);
    window.DOM.ctx.clearRect(0, 0, rect.width, rect.height);

    window.ImageManager.loadPageImages(index);

    if (window.AppState.pages[index]) {
      const img = new Image();
      img.src = window.AppState.pages[index];
      img.onload = () => {
        window.DOM.ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
    }
    window.HistoryManager.updateButtons();
  },

  updateUI() {
    if (window.DOM.pageIndicator) {
      window.DOM.pageIndicator.textContent = `${window.AppState.currentPageIndex + 1} / ${window.AppState.pages.length}`;
    }
    if (window.DOM.prevPageBtn) {
      window.DOM.prevPageBtn.disabled = window.AppState.currentPageIndex === 0;
    }
    if (window.DOM.nextPageBtn) {
      window.DOM.nextPageBtn.disabled = window.AppState.currentPageIndex === window.AppState.pages.length - 1;
    }
    const isOnlyOnePage = window.AppState.pages.length <= 1;
    if (window.DOM.deletePageBtn) {
      window.DOM.deletePageBtn.disabled = isOnlyOnePage;
    }
    if (window.DOM.deletePageMenuBtn) {
      window.DOM.deletePageMenuBtn.disabled = isOnlyOnePage;
    }
    window.HistoryManager.updateButtons();
  },

  createNewPage() {
    this.savePage();
    const currentStyle = window.AppState.pageTemplates[window.AppState.currentPageIndex] || 'ruled';
    const insertIndex = window.AppState.currentPageIndex + 1;

    window.AppState.pages.splice(insertIndex, 0, '');
    window.AppState.pageTemplates.splice(insertIndex, 0, currentStyle);
    window.AppState.pageImages.splice(insertIndex, 0, []);
    window.AppState.pagePdfBackgrounds.splice(insertIndex, 0, null);
    window.AppState.history.splice(insertIndex, 0, { undoStack: [], redoStack: [] });

    window.AppState.currentPageIndex = insertIndex;

    const rect = window.DOM.wrapper.getBoundingClientRect();
    window.TemplateEngine.drawBackground(window.DOM.bgCtx, rect.width, rect.height, currentStyle, window.AppState.currentPageIndex);
    window.DOM.ctx.clearRect(0, 0, rect.width, rect.height);
    window.ImageManager.loadPageImages(window.AppState.currentPageIndex);
    this.savePage();
    this.updateUI();
  },

  deleteCurrentPage() {
    if (window.AppState.pages.length <= 1) {
      alert('Cannot delete the only page in the document.');
      return;
    }

    const targetPageNum = window.AppState.currentPageIndex + 1;
    if (!confirm(`Are you sure you want to delete Page ${targetPageNum}?`)) {
      return;
    }

    const currentIndex = window.AppState.currentPageIndex;

    window.AppState.pages.splice(currentIndex, 1);
    window.AppState.pageTemplates.splice(currentIndex, 1);
    window.AppState.pageImages.splice(currentIndex, 1);
    window.AppState.pagePdfBackgrounds.splice(currentIndex, 1);
    window.AppState.history.splice(currentIndex, 1);

    if (window.AppState.currentPageIndex >= window.AppState.pages.length) {
      window.AppState.currentPageIndex = window.AppState.pages.length - 1;
    }

    this.loadPage(window.AppState.currentPageIndex);
    this.updateUI();
  },

  setPageTemplate(template) {
    window.AppState.pageTemplates[window.AppState.currentPageIndex] = template;
    if (window.DOM.wrapper && window.DOM.bgCtx) {
      const rect = window.DOM.wrapper.getBoundingClientRect();
      window.TemplateEngine.drawBackground(window.DOM.bgCtx, rect.width, rect.height, template, window.AppState.currentPageIndex);
    }
  }
};
