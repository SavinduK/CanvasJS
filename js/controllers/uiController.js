// --- MODULE: UI INTERACTION CONTROLLER ---
window.UIController = {
  closeAllHeaderMenus() {
    [
      window.DOM.actionsMenu,
      window.DOM.templateMenu,
      window.DOM.settingsMenu,
      window.DOM.exportMenu
    ].forEach(menu => {
      if (menu) menu.classList.add('hidden');
    });
  },

  toggleHeaderMenu(targetMenu) {
    if (!targetMenu) return;
    const isCurrentlyHidden = targetMenu.classList.contains('hidden');
    this.closeAllHeaderMenus();
    if (isCurrentlyHidden) {
      targetMenu.classList.remove('hidden');
    }
  },

  init() {
    if (window.lucide) {
      lucide.createIcons();
    }

    // Setup Header Dropdown Toggles
    const setupMenuToggle = (btn, menu) => {
      if (btn && menu) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          UIController.toggleHeaderMenu(menu);
        });
      }
    };

    setupMenuToggle(window.DOM.actionsMenuBtn, window.DOM.actionsMenu);
    setupMenuToggle(window.DOM.templateMenuBtn, window.DOM.templateMenu);
    setupMenuToggle(window.DOM.settingsMenuBtn, window.DOM.settingsMenu);
    setupMenuToggle(window.DOM.exportMenuBtn, window.DOM.exportMenu);

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-dropdown')) {
        UIController.closeAllHeaderMenus();
      }
    });

    // Tool Selection
    if (window.DOM.toolBtns) {
      window.DOM.toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const selectedTool = btn.dataset.tool;

          if (window.AppState.currentTool === selectedTool) {
            if (selectedTool !== 'select' && window.DOM.toolPopover) {
              window.DOM.toolPopover.classList.toggle('hidden');
              window.DOM.toolPopover.classList.toggle('flex');
            }
          } else {
            window.UIController.setTool(selectedTool);
          }
        });
      });
    }

    // Undo & Redo Handlers
    if (window.DOM.undoBtn) window.DOM.undoBtn.addEventListener('click', () => window.HistoryManager.undo());
    if (window.DOM.redoBtn) window.DOM.redoBtn.addEventListener('click', () => window.HistoryManager.redo());

    // Color Controls
    if (window.DOM.colorPresets) {
      window.DOM.colorPresets.forEach(preset => {
        preset.addEventListener('click', () => {
          window.AppState.currentColor = preset.dataset.color;
          window.DOM.colorPresets.forEach(p => p.classList.remove('ring-2', 'ring-white'));
          preset.classList.add('ring-2', 'ring-white');
        });
      });
    }

    if (window.DOM.colorPicker) {
      window.DOM.colorPicker.addEventListener('input', (e) => {
        window.AppState.currentColor = e.target.value;
        if (window.DOM.colorPresets) {
          window.DOM.colorPresets.forEach(p => p.classList.remove('ring-2', 'ring-white'));
        }
      });
    }

    // Size Slider
    if (window.DOM.sizeSlider) {
      window.DOM.sizeSlider.addEventListener('input', (e) => {
        window.AppState.baseSize = parseFloat(e.target.value);
        if (window.DOM.sizeVal) window.DOM.sizeVal.textContent = `${window.AppState.baseSize}px`;
      });
    }

    // Opacity Slider
    if (window.DOM.opacitySlider) {
      window.DOM.opacitySlider.addEventListener('input', (e) => {
        window.AppState.opacity = parseFloat(e.target.value);
        if (window.DOM.opacityVal) window.DOM.opacityVal.textContent = `${Math.round(window.AppState.opacity * 100)}%`;
      });
    }

    // Pressure Sensitivity Toggle
    if (window.DOM.pressureToggle) {
      window.DOM.pressureToggle.addEventListener('change', (e) => {
        window.AppState.usePressure = e.target.checked;
      });
    }

    // Touch Drawing Toggle
    if (window.DOM.touchDrawingToggle) {
      window.DOM.touchDrawingToggle.addEventListener('change', (e) => {
        window.AppState.touchDrawing = e.target.checked;
      });
    }

    // Fit to Screen Toggle
    if (window.DOM.fitToScreenToggle) {
      window.DOM.fitToScreenToggle.addEventListener('change', (e) => {
        window.AppState.fitToScreen = e.target.checked;
        window.CanvasEngine.updateViewMode();
      });
    }

    // Template Selector
    document.querySelectorAll('.template-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const template = e.currentTarget.dataset.template;
        window.PageManager.setPageTemplate(template);
        UIController.closeAllHeaderMenus();
      });
    });

    // Page Navigation
    if (window.DOM.prevPageBtn) {
      window.DOM.prevPageBtn.addEventListener('click', () => {
        if (window.AppState.currentPageIndex > 0) {
          window.PageManager.savePage();
          window.AppState.currentPageIndex--;
          window.PageManager.loadPage(window.AppState.currentPageIndex);
          window.PageManager.updateUI();
        }
      });
    }

    if (window.DOM.nextPageBtn) {
      window.DOM.nextPageBtn.addEventListener('click', () => {
        if (window.AppState.currentPageIndex < window.AppState.pages.length - 1) {
          window.PageManager.savePage();
          window.AppState.currentPageIndex++;
          window.PageManager.loadPage(window.AppState.currentPageIndex);
          window.PageManager.updateUI();
        }
      });
    }

    if (window.DOM.newPageBtn) {
      window.DOM.newPageBtn.addEventListener('click', () => {
        window.PageManager.createNewPage();
      });
    }

    if (window.DOM.deletePageBtn) {
      window.DOM.deletePageBtn.addEventListener('click', () => {
        window.PageManager.deleteCurrentPage();
      });
    }

    if (window.DOM.deletePageMenuBtn) {
      window.DOM.deletePageMenuBtn.addEventListener('click', () => {
        UIController.closeAllHeaderMenus();
        window.PageManager.deleteCurrentPage();
      });
    }

    // Clear Page
    if (window.DOM.clearBtn) {
      window.DOM.clearBtn.addEventListener('click', () => {
        UIController.closeAllHeaderMenus();
        if (confirm('Clear current page drawing?')) {
          window.HistoryManager.saveState();
          const rect = window.DOM.wrapper.getBoundingClientRect();
          window.DOM.ctx.clearRect(0, 0, rect.width, rect.height);
          window.AppState.pageImages[window.AppState.currentPageIndex] = [];
          window.ImageManager.loadPageImages(window.AppState.currentPageIndex);
          window.PageManager.savePage();
        }
      });
    }

    // Exports
    if (window.DOM.exportImgBtn) {
      window.DOM.exportImgBtn.addEventListener('click', () => {
        UIController.closeAllHeaderMenus();
        window.UIController.exportPNG();
      });
    }

    if (window.DOM.exportPdfBtn) {
      window.DOM.exportPdfBtn.addEventListener('click', () => {
        UIController.closeAllHeaderMenus();
        window.UIController.exportPDF();
      });
    }
  },

  setTool(selectedTool) {
    window.AppState.currentTool = selectedTool;
    if (window.DOM.toolPopover) {
      window.DOM.toolPopover.classList.add('hidden');
      window.DOM.toolPopover.classList.remove('flex');
    }

    if (selectedTool === 'select') {
      document.body.classList.add('mode-select');
      if (window.DOM.canvas) window.DOM.canvas.style.pointerEvents = 'none';
      if (window.DOM.wrapper) window.DOM.wrapper.style.cursor = 'default';
    } else {
      document.body.classList.remove('mode-select');
      if (window.DOM.canvas) window.DOM.canvas.style.pointerEvents = 'auto';
      if (window.DOM.wrapper) window.DOM.wrapper.style.cursor = 'none';
      window.ImageManager.deselectAll();
    }

    if (window.DOM.toolBtns) {
      window.DOM.toolBtns.forEach(b => {
        b.classList.remove('text-blue-400', 'bg-white/10');
        b.classList.add('text-gray-400');
        const indicator = b.querySelector('span');
        if (indicator) indicator.remove();
      });
    }

    const activeBtn = document.querySelector(`.tool-btn[data-tool="${selectedTool}"]`);
    if (activeBtn) {
      activeBtn.classList.add('text-blue-400', 'bg-white/10');
      activeBtn.classList.remove('text-gray-400');
      activeBtn.innerHTML += `<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></span>`;
    }
  },

  async exportPNG() {
    window.ImageManager.deselectAll();
    window.PageManager.savePage();
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = window.DOM.canvas.width;
    exportCanvas.height = window.DOM.canvas.height;
    const expCtx = exportCanvas.getContext('2d');

    const rect = window.DOM.wrapper.getBoundingClientRect();
    await window.TemplateEngine.drawBackgroundAsync(expCtx, rect.width, rect.height, window.AppState.pageTemplates[window.AppState.currentPageIndex], window.AppState.currentPageIndex);

    const currentImages = window.AppState.pageImages[window.AppState.currentPageIndex] || [];
    await window.ImageManager.renderImagesToCanvasContext(expCtx, currentImages, exportCanvas.width, exportCanvas.height);

    expCtx.drawImage(window.DOM.canvas, 0, 0);

    const title = window.DOM.noteTitleInput.value.trim() || 'Untitled Note';
    const link = document.createElement('a');
    link.download = `${title}-page-${window.AppState.currentPageIndex + 1}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  },

  async exportPDF() {
    window.ImageManager.deselectAll();
    window.PageManager.savePage();
    const { jsPDF } = window.jspdf;
    let pdf = null;

    const pdfFileName = (window.DOM.noteTitleInput.value.trim() || 'Untitled Note') + '.pdf';

    for (let i = 0; i < window.AppState.pages.length; i++) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = window.DOM.canvas.width;
      tempCanvas.height = window.DOM.canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      const rect = window.DOM.wrapper.getBoundingClientRect();
      await window.TemplateEngine.drawBackgroundAsync(tempCtx, tempCanvas.width, tempCanvas.height, window.AppState.pageTemplates[i] || 'ruled', i);

      const pageImgList = window.AppState.pageImages[i] || [];
      await window.ImageManager.renderImagesToCanvasContext(tempCtx, pageImgList, tempCanvas.width, tempCanvas.height);

      if (window.AppState.pages[i]) {
        const img = new Image();
        img.src = window.AppState.pages[i];
        await new Promise(resolve => {
          img.onload = () => {
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            resolve();
          };
        });
      }

      const imgData = tempCanvas.toDataURL('image/jpeg', 0.98);
      const imgWidth = tempCanvas.width;
      const imgHeight = tempCanvas.height;
      const orientation = imgWidth > imgHeight ? 'l' : 'p';

      if (i === 0) {
        pdf = new jsPDF({
          orientation: orientation,
          unit: 'px',
          format: [imgWidth, imgHeight],
          compress: true
        });
      } else {
        pdf.addPage([imgWidth, imgHeight], orientation);
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    }

    if (pdf) pdf.save(pdfFileName);
  }
};
