// --- MODULE: APP STATE ---
window.AppState = {
  pages: [],
  pageTemplates: [],
  pageImages: [], // Array of arrays containing image objects per page
  pagePdfBackgrounds: [], // Array containing PDF page background image Data URLs per page
  currentPageIndex: 0,

  currentTool: 'pen',
  currentColor: '#fbbf24',
  baseSize: 5,
  opacity: 0.4,
  usePressure: true,
  touchDrawing: true,
  fitToScreen: true,

  isDrawing: false,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,

  strokeCanvas: null,
  strokeCtx: null,

  history: []
};
