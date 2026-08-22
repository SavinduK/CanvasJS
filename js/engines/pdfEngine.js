// --- MODULE: PDF IMPORT ENGINE ---
window.PdfEngine = {
  init() {
    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    if (window.DOM.importPdfBtn) {
      window.DOM.importPdfBtn.addEventListener('click', () => {
        if (window.DOM.optionsMenu) window.DOM.optionsMenu.classList.add('hidden');
        if (window.DOM.pdfFileInput) window.DOM.pdfFileInput.click();
      });
    }

    if (window.DOM.pdfFileInput) {
      window.DOM.pdfFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await window.PdfEngine.loadPDF(file);
        window.DOM.pdfFileInput.value = '';
      });
    }
  },

  async loadPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      if (numPages === 0) return;

      const isFirstPageBlank = (
        window.AppState.pages.length === 1 &&
        !window.AppState.pages[0] &&
        (!window.AppState.pageImages[0] || window.AppState.pageImages[0].length === 0) &&
        !window.AppState.pagePdfBackgrounds[0]
      );

      const startPageIndex = isFirstPageBlank ? 0 : window.AppState.pages.length;

      if (isFirstPageBlank) {
        window.AppState.pages = [];
        window.AppState.pageTemplates = [];
        window.AppState.pageImages = [];
        window.AppState.pagePdfBackgrounds = [];
      }

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        const tempCtx = tempCanvas.getContext('2d');

        await page.render({ canvasContext: tempCtx, viewport: viewport }).promise;
        const imgDataUrl = tempCanvas.toDataURL('image/png');

        const targetIdx = startPageIndex + (i - 1);
        window.AppState.pages[targetIdx] = '';
        window.AppState.pageTemplates[targetIdx] = 'pdf';
        window.AppState.pagePdfBackgrounds[targetIdx] = imgDataUrl;
        window.AppState.pageImages[targetIdx] = [];
      }

      window.AppState.currentPageIndex = startPageIndex;
      window.PageManager.loadPage(startPageIndex);
      window.PageManager.updateUI();
      if (window.lucide) {
        lucide.createIcons();
      }
    } catch (err) {
      console.error('Error importing PDF document:', err);
      alert('Failed to import PDF document. Please try another PDF file.');
    }
  }
};
