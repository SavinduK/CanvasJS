// --- MODULE: HISTORY MANAGER (UNDO / REDO) ---
window.HistoryManager = {
  getHistory() {
    if (!window.AppState.history[window.AppState.currentPageIndex]) {
      window.AppState.history[window.AppState.currentPageIndex] = { undoStack: [], redoStack: [] };
    }
    return window.AppState.history[window.AppState.currentPageIndex];
  },

  saveState() {
    const { undoStack, redoStack } = this.getHistory();
    if (window.DOM.canvas) {
      undoStack.push(window.DOM.canvas.toDataURL());
      if (undoStack.length > 30) undoStack.shift();
      redoStack.length = 0;
      this.updateButtons();
    }
  },

  undo() {
    const { undoStack, redoStack } = this.getHistory();
    if (undoStack.length === 0) return;

    redoStack.push(window.DOM.canvas.toDataURL());
    const previousState = undoStack.pop();
    this.restoreState(previousState);
    this.updateButtons();
  },

  redo() {
    const { undoStack, redoStack } = this.getHistory();
    if (redoStack.length === 0) return;

    undoStack.push(window.DOM.canvas.toDataURL());
    const nextState = redoStack.pop();
    this.restoreState(nextState);
    this.updateButtons();
  },

  restoreState(dataUrl) {
    const rect = window.DOM.wrapper.getBoundingClientRect();
    window.DOM.ctx.clearRect(0, 0, rect.width, rect.height);
    if (dataUrl) {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        window.DOM.ctx.drawImage(img, 0, 0, rect.width, rect.height);
        window.AppState.pages[window.AppState.currentPageIndex] = window.DOM.canvas.toDataURL('image/png');
      };
    } else {
      window.AppState.pages[window.AppState.currentPageIndex] = window.DOM.canvas.toDataURL('image/png');
    }
  },

  updateButtons() {
    const { undoStack, redoStack } = this.getHistory();
    if (window.DOM.undoBtn) window.DOM.undoBtn.disabled = undoStack.length === 0;
    if (window.DOM.redoBtn) window.DOM.redoBtn.disabled = redoStack.length === 0;
  }
};
