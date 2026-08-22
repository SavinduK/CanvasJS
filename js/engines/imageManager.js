// --- MODULE: INTERACTIVE IMAGE WIDGET MANAGER ---
window.ImageManager = {
  init() {
    if (window.DOM.importImgBtn) {
      window.DOM.importImgBtn.addEventListener('click', () => {
        if (window.DOM.optionsMenu) window.DOM.optionsMenu.classList.add('hidden');
        if (window.DOM.imageFileInput) window.DOM.imageFileInput.click();
      });
    }

    if (window.DOM.imageFileInput) {
      window.DOM.imageFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          window.ImageManager.addImageToCurrentPage(event.target.result);
          window.DOM.imageFileInput.value = '';
        };
        reader.readAsDataURL(file);
      });
    }

    if (window.DOM.wrapper) {
      window.DOM.wrapper.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('.image-widget')) {
          window.ImageManager.deselectAll();
        }
      });
    }
  },

  deselectAll() {
    document.querySelectorAll('.image-widget').forEach(el => el.classList.remove('selected'));
  },

  getCurrentPageImages() {
    if (!window.AppState.pageImages[window.AppState.currentPageIndex]) {
      window.AppState.pageImages[window.AppState.currentPageIndex] = [];
    }
    return window.AppState.pageImages[window.AppState.currentPageIndex];
  },

  addImageToCurrentPage(src, opts = {}) {
    const imgList = this.getCurrentPageImages();
    const imgObj = {
      id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      src: src,
      x: opts.x || 60,
      y: opts.y || 60,
      w: opts.w || 200,
      h: opts.h || 200
    };

    const activateSelectMode = () => {
      if (window.UIController) {
        window.UIController.setTool('select');
      } else {
        window.AppState.currentTool = 'select';
        document.body.classList.add('mode-select');
        if (window.DOM.canvas) window.DOM.canvas.style.pointerEvents = 'none';
        if (window.DOM.wrapper) window.DOM.wrapper.style.cursor = 'default';
      }
    };

    if (!opts.w || !opts.h) {
      const tempImg = new Image();
      tempImg.src = src;
      tempImg.onload = () => {
        const maxDim = 250;
        let w = tempImg.width || 200;
        let h = tempImg.height || 200;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w *= ratio;
          h *= ratio;
        }
        imgObj.w = w;
        imgObj.h = h;
        imgList.push(imgObj);
        window.ImageManager.renderWidget(imgObj);
        window.PageManager.savePage();
        activateSelectMode();
      };
    } else {
      imgList.push(imgObj);
      window.ImageManager.renderWidget(imgObj);
      window.PageManager.savePage();
      activateSelectMode();
    }
  },

  renderWidget(imgObj) {
    if (!window.DOM.imageOverlayContainer) return;

    const widget = document.createElement('div');
    widget.className = 'image-widget selected';
    widget.id = imgObj.id;
    widget.style.left = `${imgObj.x}px`;
    widget.style.top = `${imgObj.y}px`;
    widget.style.width = `${imgObj.w}px`;
    widget.style.height = `${imgObj.h}px`;

    const imgEl = document.createElement('img');
    imgEl.src = imgObj.src;
    imgEl.style.width = '100%';
    imgEl.style.height = '100%';
    imgEl.style.objectFit = 'contain';
    imgEl.style.pointerEvents = 'none';

    const delBtn = document.createElement('div');
    delBtn.className = 'delete-image-btn';
    delBtn.innerHTML = '&#10005;';
    delBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      widget.remove();
      const list = window.ImageManager.getCurrentPageImages();
      const idx = list.findIndex(i => i.id === imgObj.id);
      if (idx !== -1) list.splice(idx, 1);
      window.PageManager.savePage();
    });

    const handles = ['nw', 'ne', 'sw', 'se'];
    handles.forEach(h => {
      const handleEl = document.createElement('div');
      handleEl.className = `resize-handle handle-${h}`;
      handleEl.dataset.handle = h;
      widget.appendChild(handleEl);
    });

    widget.appendChild(imgEl);
    widget.appendChild(delBtn);

    this.deselectAll();
    window.DOM.imageOverlayContainer.appendChild(widget);

    this.attachWidgetInteractions(widget, imgObj);
  },

  attachWidgetInteractions(widget, imgObj) {
    let isDragging = false;
    let isResizing = false;
    let currentHandle = null;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0, startW = 0, startH = 0;

    widget.addEventListener('pointerdown', (e) => {
      if (window.AppState.currentTool !== 'select') return;
      e.stopPropagation();
      window.ImageManager.deselectAll();
      widget.classList.add('selected');

      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(widget.style.left);
      startTop = parseFloat(widget.style.top);
      startW = parseFloat(widget.style.width);
      startH = parseFloat(widget.style.height);

      if (e.target.classList.contains('resize-handle')) {
        isResizing = true;
        currentHandle = e.target.dataset.handle;
      } else {
        isDragging = true;
      }

      widget.setPointerCapture(e.pointerId);
    });

    widget.addEventListener('pointermove', (e) => {
      if (!isDragging && !isResizing) return;
      e.stopPropagation();

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (isDragging) {
        const newX = startLeft + dx;
        const newY = startTop + dy;
        widget.style.left = `${newX}px`;
        widget.style.top = `${newY}px`;
        imgObj.x = newX;
        imgObj.y = newY;
      } else if (isResizing) {
        let newW = startW;
        let newH = startH;
        let newL = startLeft;
        let newT = startTop;

        if (currentHandle.includes('e')) newW = Math.max(30, startW + dx);
        if (currentHandle.includes('s')) newH = Math.max(30, startH + dy);
        if (currentHandle.includes('w')) {
          const possibleW = startW - dx;
          if (possibleW > 30) {
            newW = possibleW;
            newL = startLeft + dx;
          }
        }
        if (currentHandle.includes('n')) {
          const possibleH = startH - dy;
          if (possibleH > 30) {
            newH = possibleH;
            newT = startTop + dy;
          }
        }

        widget.style.width = `${newW}px`;
        widget.style.height = `${newH}px`;
        widget.style.left = `${newL}px`;
        widget.style.top = `${newT}px`;

        imgObj.w = newW;
        imgObj.h = newH;
        imgObj.x = newL;
        imgObj.y = newT;
      }
    });

    const stopInteraction = (e) => {
      if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        currentHandle = null;
        window.PageManager.savePage();
      }
    };

    widget.addEventListener('pointerup', stopInteraction);
    widget.addEventListener('pointercancel', stopInteraction);
  },

  loadPageImages(index) {
    if (!window.DOM.imageOverlayContainer) return;
    window.DOM.imageOverlayContainer.innerHTML = '';
    const imgList = window.AppState.pageImages[index] || [];
    imgList.forEach(imgObj => window.ImageManager.renderWidget(imgObj));
  },

  async renderImagesToCanvasContext(targetCtx, imgList, canvasWidth, canvasHeight) {
    if (!window.DOM.wrapper) return;
    const rect = window.DOM.wrapper.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    for (const item of imgList) {
      await new Promise(resolve => {
        const img = new Image();
        img.src = item.src;
        img.onload = () => {
          targetCtx.drawImage(
            img,
            item.x * scaleX,
            item.y * scaleY,
            item.w * scaleX,
            item.h * scaleY
          );
          resolve();
        };
        img.onerror = () => resolve();
      });
    }
  }
};
