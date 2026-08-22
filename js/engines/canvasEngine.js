// --- MODULE: CANVAS MANAGER ---
window.CanvasEngine = {
  init() {
    window.AppState.strokeCanvas = document.createElement('canvas');
    window.AppState.strokeCtx = window.AppState.strokeCanvas.getContext('2d');

    window.addEventListener('resize', () => window.CanvasEngine.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => window.CanvasEngine.resize(), 150));
    CanvasEngine.updateViewMode();
  },

  updateViewMode() {
    if (!window.DOM.mainContainer || !window.DOM.wrapper) return;

    window.PageManager.savePage();

    if (window.AppState.fitToScreen) {
      // Fit to Screen Mode
      window.DOM.mainContainer.classList.remove('overflow-y-auto', 'items-start');
      window.DOM.mainContainer.classList.add('overflow-hidden', 'items-center');
      window.DOM.wrapper.style.height = '100%';
      window.DOM.wrapper.style.maxWidth = '100%';
    } else {
      // Scroll Mode (Fixed Document Height with Vertical Scroll)
      window.DOM.mainContainer.classList.remove('overflow-hidden', 'items-center');
      window.DOM.mainContainer.classList.add('overflow-y-auto', 'items-start');
      window.DOM.wrapper.style.height = '1400px';
      window.DOM.wrapper.style.maxWidth = '960px';
    }

    setTimeout(() => {
      window.CanvasEngine.resize();
    }, 50);
  },

  resize() {
    if (!window.DOM.wrapper || !window.DOM.canvas || !window.DOM.bgCanvas || !window.DOM.previewCanvas) return;

    const rect = window.DOM.wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = window.DOM.canvas.width;
    tempCanvas.height = window.DOM.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (window.DOM.canvas.width > 0 && window.DOM.canvas.height > 0) {
      tempCtx.drawImage(window.DOM.canvas, 0, 0);
    }

    [window.DOM.canvas, window.DOM.bgCanvas, window.DOM.previewCanvas, window.AppState.strokeCanvas].forEach(c => {
      if (c) {
        c.width = rect.width * dpr;
        c.height = rect.height * dpr;
      }
    });

    if (window.DOM.ctx) window.DOM.ctx.scale(dpr, dpr);
    if (window.DOM.bgCtx) window.DOM.bgCtx.scale(dpr, dpr);
    if (window.DOM.previewCtx) window.DOM.previewCtx.scale(dpr, dpr);
    if (window.AppState.strokeCtx) window.AppState.strokeCtx.scale(dpr, dpr);

    window.TemplateEngine.drawBackground(window.DOM.bgCtx, rect.width, rect.height, window.AppState.pageTemplates[window.AppState.currentPageIndex] || 'ruled', window.AppState.currentPageIndex);

    if (window.AppState.pages[window.AppState.currentPageIndex]) {
      window.PageManager.loadPage(window.AppState.currentPageIndex);
    } else if (tempCanvas.width > 0 && window.DOM.ctx) {
      window.DOM.ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
      window.PageManager.savePage();
    }
  }
};
