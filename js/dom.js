// --- MODULE: DOM ELEMENTS ---
window.DOM = {
  get mainContainer() { return document.querySelector('main'); },
  get wrapper() { return document.getElementById('canvasWrapper'); },
  get bgCanvas() { return document.getElementById('bgCanvas'); },
  get bgCtx() { return this.bgCanvas ? this.bgCanvas.getContext('2d') : null; },
  get canvas() { return document.getElementById('drawingCanvas'); },
  get ctx() { return this.canvas ? this.canvas.getContext('2d') : null; },
  get previewCanvas() { return document.getElementById('previewCanvas'); },
  get previewCtx() { return this.previewCanvas ? this.previewCanvas.getContext('2d') : null; },
  get imageOverlayContainer() { return document.getElementById('imageOverlayContainer'); },
  get toolCursor() { return document.getElementById('toolCursor'); },
  get noteTitleInput() { return document.getElementById('noteTitleInput'); },
  
  // Header & Navigation
  get prevPageBtn() { return document.getElementById('prevPage'); },
  get nextPageBtn() { return document.getElementById('nextPage'); },
  get newPageBtn() { return document.getElementById('newPage'); },
  get pageIndicator() { return document.getElementById('pageIndicator'); },
  get clearBtn() { return document.getElementById('clearBtn'); },
  get menuToggleBtn() { return document.getElementById('menuToggleBtn'); },
  get optionsMenu() { return document.getElementById('optionsMenu'); },
  get pressureToggle() { return document.getElementById('pressureToggle'); },
  get touchDrawingToggle() { return document.getElementById('touchDrawingToggle'); },
  get fitToScreenToggle() { return document.getElementById('fitToScreenToggle'); },
  get exportImgBtn() { return document.getElementById('exportImgBtn'); },
  get exportPdfBtn() { return document.getElementById('exportPdfBtn'); },
  get importImgBtn() { return document.getElementById('importImgBtn'); },
  get imageFileInput() { return document.getElementById('imageFileInput'); },
  get importPdfBtn() { return document.getElementById('importPdfBtn'); },
  get pdfFileInput() { return document.getElementById('pdfFileInput'); },
  get deletePageBtn() { return document.getElementById('deletePageBtn'); },
  get deletePageMenuBtn() { return document.getElementById('deletePageMenuBtn'); },

  // Floating Dock Tools
  get toolBtns() { return document.querySelectorAll('.tool-btn'); },
  get undoBtn() { return document.getElementById('undoBtn'); },
  get redoBtn() { return document.getElementById('redoBtn'); },

  // Popover Controls
  get toolPopover() { return document.getElementById('toolPopover'); },
  get colorPicker() { return document.getElementById('colorPicker'); },
  get colorPresets() { return document.querySelectorAll('.color-preset'); },
  get sizeSlider() { return document.getElementById('sizeSlider'); },
  get sizeVal() { return document.getElementById('sizeVal'); },
  get opacitySlider() { return document.getElementById('opacitySlider'); },
  get opacityVal() { return document.getElementById('opacityVal'); }
};
