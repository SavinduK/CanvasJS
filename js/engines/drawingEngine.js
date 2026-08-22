// --- MODULE: DRAWING LOGIC ---
window.DrawingEngine = {
  init() {
    if (!window.DOM.canvas) return;

    window.DOM.canvas.addEventListener('pointerdown', (e) => {
      if (e.button === 0) window.DrawingEngine.start(e);
    });

    window.DOM.canvas.addEventListener('pointermove', (e) => {
      window.CursorController.updateCursor(e);
      window.DrawingEngine.draw(e);
    });

    window.DOM.canvas.addEventListener('pointerup', (e) => window.DrawingEngine.stop(e));
    window.DOM.canvas.addEventListener('pointerleave', () => {
      window.CursorController.hideCursor();
      window.DrawingEngine.stop();
    });
    window.DOM.canvas.addEventListener('pointercancel', (e) => {
      window.CursorController.hideCursor();
      window.DrawingEngine.stop(e);
    });

    // Touch Event Interceptors: Prevent default touch scrolling / palm gesture scrolling on canvas
    const blockTouchScroll = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };
    window.DOM.canvas.addEventListener('touchstart', blockTouchScroll, { passive: false });
    window.DOM.canvas.addEventListener('touchmove', blockTouchScroll, { passive: false });
    window.DOM.canvas.addEventListener('touchend', blockTouchScroll, { passive: false });
    window.DOM.canvas.addEventListener('touchcancel', blockTouchScroll, { passive: false });
  },

  getCoords(e) {
    const rect = window.DOM.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  },

  start(e) {
    if (window.AppState.currentTool === 'select' || !window.DOM.wrapper || !window.DOM.ctx) return;

    // Prevent default gesture / scrolling behavior
    if (e.cancelable) e.preventDefault();

    // If Draw with Hand is OFF and the input is a touch/finger/palm, block drawing and capture event
    if (!window.AppState.touchDrawing && e.pointerType === 'touch') {
      return;
    }

    try {
      if (window.DOM.canvas && window.DOM.canvas.setPointerCapture && e.pointerId) {
        window.DOM.canvas.setPointerCapture(e.pointerId);
      }
    } catch (err) {}

    const rect = window.DOM.wrapper.getBoundingClientRect();
    const coords = this.getCoords(e);
    const currentTemplate = window.AppState.pageTemplates[window.AppState.currentPageIndex];

    if (currentTemplate === 'flashcard') {
      if (!window.FlashcardEngine.isPointInsideFlashcards(coords.x, coords.y, rect.width, rect.height)) {
        return;
      }
    }

    window.ImageManager.deselectAll();
    window.HistoryManager.saveState();

    window.AppState.isDrawing = true;
    window.AppState.startX = coords.x;
    window.AppState.startY = coords.y;
    window.AppState.lastX = coords.x;
    window.AppState.lastY = coords.y;

    if (window.DOM.toolPopover) window.DOM.toolPopover.classList.add('hidden');
    // Close any open header dropdown menus on drawing start
    if (window.UIController && window.UIController.closeAllHeaderMenus) {
      window.UIController.closeAllHeaderMenus();
    }

    if (window.AppState.currentTool === 'highlighter') {
      window.AppState.strokeCtx.clearRect(0, 0, rect.width, rect.height);
      window.AppState.strokeCtx.save();
      if (currentTemplate === 'flashcard') {
        window.FlashcardEngine.setClipRegion(window.AppState.strokeCtx, rect.width, rect.height);
      }
      window.AppState.strokeCtx.lineCap = 'round';
      window.AppState.strokeCtx.lineJoin = 'round';
      window.AppState.strokeCtx.strokeStyle = window.AppState.currentColor;
      window.AppState.strokeCtx.lineWidth = window.AppState.baseSize * 3;
      window.AppState.strokeCtx.beginPath();
      window.AppState.strokeCtx.moveTo(coords.x, coords.y);
    } else if (window.AppState.currentTool === 'linePen') {
      if (window.DOM.previewCtx) window.DOM.previewCtx.clearRect(0, 0, rect.width, rect.height);
    } else {
      window.DOM.ctx.save();
      if (currentTemplate === 'flashcard') {
        window.FlashcardEngine.setClipRegion(window.DOM.ctx, rect.width, rect.height);
      }
      window.DOM.ctx.beginPath();
      window.DOM.ctx.moveTo(window.AppState.lastX, window.AppState.lastY);
    }
  },

  draw(e) {
    if (!window.AppState.isDrawing || window.AppState.currentTool === 'select' || !window.DOM.wrapper || !window.DOM.ctx) return;
    if (e.cancelable) e.preventDefault();

    if (!window.AppState.touchDrawing && e.pointerType === 'touch') return;

    const coords = this.getCoords(e);
    const currentX = coords.x;
    const currentY = coords.y;

    let pressure = e.pressure;
    if (!window.AppState.usePressure || pressure === 0 || pressure === undefined) {
      pressure = 0.5;
    }

    const tool = window.AppState.currentTool;
    const rect = window.DOM.wrapper.getBoundingClientRect();
    const currentTemplate = window.AppState.pageTemplates[window.AppState.currentPageIndex];

    if (tool === 'linePen') {
      if (!window.DOM.previewCtx) return;
      window.DOM.previewCtx.clearRect(0, 0, rect.width, rect.height);
      window.DOM.previewCtx.save();
      if (currentTemplate === 'flashcard') {
        FlashcardEngine.setClipRegion(window.DOM.previewCtx, rect.width, rect.height);
      }
      window.DOM.previewCtx.lineCap = 'round';
      window.DOM.previewCtx.strokeStyle = window.AppState.currentColor;
      window.DOM.previewCtx.lineWidth = window.AppState.baseSize;
      window.DOM.previewCtx.beginPath();
      window.DOM.previewCtx.moveTo(window.AppState.startX, window.AppState.startY);
      window.DOM.previewCtx.lineTo(currentX, currentY);
      window.DOM.previewCtx.stroke();
      window.DOM.previewCtx.restore();

    } else if (tool === 'highlighter') {
      if (!window.AppState.strokeCtx) return;
      window.AppState.strokeCtx.lineTo(currentX, currentY);
      window.AppState.strokeCtx.stroke();

    } else {
      window.DOM.ctx.lineCap = 'round';
      window.DOM.ctx.lineJoin = 'round';
      window.DOM.ctx.globalAlpha = 1.0;

      if (tool === 'pen') {
        window.DOM.ctx.globalCompositeOperation = 'source-over';
        window.DOM.ctx.strokeStyle = window.AppState.currentColor;
        window.DOM.ctx.lineWidth = window.AppState.baseSize * (pressure * 2);
      } else if (tool === 'eraser') {
        window.DOM.ctx.globalCompositeOperation = 'destination-out';
        window.DOM.ctx.lineWidth = window.AppState.baseSize * 4;
      }

      window.DOM.ctx.beginPath();
      window.DOM.ctx.moveTo(window.AppState.lastX, window.AppState.lastY);
      window.DOM.ctx.lineTo(currentX, currentY);
      window.DOM.ctx.stroke();
    }

    window.AppState.lastX = currentX;
    window.AppState.lastY = currentY;
  },

  stop(e) {
    if (e && e.pointerId && window.DOM.canvas && window.DOM.canvas.hasPointerCapture && window.DOM.canvas.hasPointerCapture(e.pointerId)) {
      try {
        window.DOM.canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    if (!window.AppState.isDrawing || !window.DOM.wrapper || !window.DOM.ctx) return;
    window.AppState.isDrawing = false;

    const tool = window.AppState.currentTool;
    const rect = window.DOM.wrapper.getBoundingClientRect();
    const currentTemplate = window.AppState.pageTemplates[window.AppState.currentPageIndex];

    if (tool === 'linePen') {
      if (window.DOM.previewCtx) window.DOM.previewCtx.clearRect(0, 0, rect.width, rect.height);
      window.DOM.ctx.save();
      if (currentTemplate === 'flashcard') {
        window.FlashcardEngine.setClipRegion(window.DOM.ctx, rect.width, rect.height);
      }
      window.DOM.ctx.lineCap = 'round';
      window.DOM.ctx.globalCompositeOperation = 'source-over';
      window.DOM.ctx.globalAlpha = 1.0;
      window.DOM.ctx.strokeStyle = window.AppState.currentColor;
      window.DOM.ctx.lineWidth = window.AppState.baseSize;
      window.DOM.ctx.beginPath();
      window.DOM.ctx.moveTo(window.AppState.startX, window.AppState.startY);
      window.DOM.ctx.lineTo(window.AppState.lastX, window.AppState.lastY);
      window.DOM.ctx.stroke();
      window.DOM.ctx.restore();

    } else if (tool === 'highlighter') {
      if (window.AppState.strokeCtx) window.AppState.strokeCtx.restore();
      window.DOM.ctx.save();
      if (currentTemplate === 'flashcard') {
        window.FlashcardEngine.setClipRegion(window.DOM.ctx, rect.width, rect.height);
      }
      window.DOM.ctx.globalCompositeOperation = 'source-over';
      window.DOM.ctx.globalAlpha = window.AppState.opacity;
      if (window.AppState.strokeCanvas) window.DOM.ctx.drawImage(window.AppState.strokeCanvas, 0, 0, rect.width, rect.height);
      window.DOM.ctx.restore();
    } else {
      window.DOM.ctx.restore();
    }

    window.DOM.ctx.globalAlpha = 1.0;
    window.DOM.ctx.globalCompositeOperation = 'source-over';
    window.PageManager.savePage();
  }
};
