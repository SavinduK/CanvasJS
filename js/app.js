// --- APPLICATION BOOTSTRAP ENTRY POINT ---
function initApp() {
  if (window.lucide) {
    lucide.createIcons();
  }

  window.AppState.pages.push('');
  window.AppState.pageTemplates.push('ruled');
  window.AppState.pageImages.push([]);
  window.AppState.pagePdfBackgrounds.push(null);

  window.CanvasEngine.init();
  window.DrawingEngine.init();
  window.ImageManager.init();
  window.PdfEngine.init();
  window.UIController.init();
  window.PageManager.loadPage(0);
  window.PageManager.updateUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
