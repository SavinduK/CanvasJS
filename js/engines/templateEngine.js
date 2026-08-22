// --- MODULE: BACKGROUND TEMPLATES ---
window.TemplateEngine = {
  drawBackground(ctx, width, height, template, pageIndex = window.AppState.currentPageIndex) {
    if (!ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    if (template === 'pdf') {
      ctx.fillStyle = '#1e1e20';
      ctx.fillRect(0, 0, width, height);

      const pdfImgSrc = window.AppState.pagePdfBackgrounds[pageIndex];
      if (pdfImgSrc) {
        const img = new Image();
        img.src = pdfImgSrc;
        if (img.complete) {
          ctx.drawImage(img, 0, 0, width, height);
        } else {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
          };
        }
      }
    } else if (template === 'flashcard') {
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, width, height);

      const cards = window.FlashcardEngine.getCardBounds(width, height);
      const borderRadius = 16;

      const drawCard = (x, y, w, h) => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, borderRadius);
        ctx.fillStyle = '#1e1e20';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.clip();
        ctx.strokeStyle = '#2d2d30';
        const stepY = 32;
        for (let ly = y + stepY; ly < y + h; ly += stepY) {
          ctx.beginPath();
          ctx.moveTo(x, ly);
          ctx.lineTo(x + w, ly);
          ctx.stroke();
        }
        ctx.restore();
      };

      cards.forEach(c => drawCard(c.x, c.y, c.w, c.h));

    } else {
      ctx.fillStyle = '#1e1e20';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#2d2d30';
      ctx.lineWidth = 1;

      if (template === 'ruled') {
        const stepY = 32;
        for (let y = stepY; y < height; y += stepY) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else if (template === 'grid') {
        const step = 28;
        for (let x = step; x < width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = step; y < height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  },

  async drawBackgroundAsync(ctx, width, height, template, pageIndex = window.AppState.currentPageIndex) {
    if (!ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    if (template === 'pdf') {
      ctx.fillStyle = '#1e1e20';
      ctx.fillRect(0, 0, width, height);

      const pdfImgSrc = window.AppState.pagePdfBackgrounds[pageIndex];
      if (pdfImgSrc) {
        await new Promise(resolve => {
          const img = new Image();
          img.src = pdfImgSrc;
          if (img.complete) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve();
          } else {
            img.onload = () => {
              ctx.drawImage(img, 0, 0, width, height);
              resolve();
            };
            img.onerror = () => resolve();
          }
        });
      }
    } else {
      this.drawBackground(ctx, width, height, template, pageIndex);
    }

    ctx.restore();
  }
};
