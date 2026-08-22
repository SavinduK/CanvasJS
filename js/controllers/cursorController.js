// --- MODULE: CURSOR PREVIEW ---
window.CursorController = {
  updateCursor(e) {
    if (!window.DOM.wrapper || !window.DOM.toolCursor) return;
    const rect = window.DOM.wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height || window.AppState.currentTool === 'select') {
      window.DOM.toolCursor.style.display = 'none';
      return;
    }

    window.DOM.toolCursor.style.display = 'block';
    window.DOM.toolCursor.style.left = `${x}px`;
    window.DOM.toolCursor.style.top = `${y}px`;

    if (window.AppState.currentTool === 'eraser') {
      const size = window.AppState.baseSize * 4;
      window.DOM.toolCursor.style.width = `${size}px`;
      window.DOM.toolCursor.style.height = `${size}px`;
      window.DOM.toolCursor.style.border = '1.5px solid rgba(255, 255, 255, 0.8)';
      window.DOM.toolCursor.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    } else if (window.AppState.currentTool === 'highlighter') {
      const size = window.AppState.baseSize * 3;
      window.DOM.toolCursor.style.width = `${size}px`;
      window.DOM.toolCursor.style.height = `${size}px`;
      window.DOM.toolCursor.style.border = '1px solid rgba(255, 255, 255, 0.6)';
      window.DOM.toolCursor.style.backgroundColor = window.AppState.currentColor;
      window.DOM.toolCursor.style.opacity = window.AppState.opacity;
    } else {
      const size = Math.max(window.AppState.baseSize, 4);
      window.DOM.toolCursor.style.width = `${size}px`;
      window.DOM.toolCursor.style.height = `${size}px`;
      window.DOM.toolCursor.style.border = '1px solid rgba(0, 0, 0, 0.5)';
      window.DOM.toolCursor.style.backgroundColor = window.AppState.currentColor;
      window.DOM.toolCursor.style.opacity = '1';
    }
  },

  hideCursor() {
    if (window.DOM.toolCursor) {
      window.DOM.toolCursor.style.display = 'none';
    }
  }
};
