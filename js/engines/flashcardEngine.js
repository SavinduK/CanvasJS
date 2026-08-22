// --- MODULE: FLASHCARD UTILITY ENGINE ---
window.FlashcardEngine = {
  getCardBounds(width, height) {
    const gap = 16;
    const cardWidth = (width - gap * 3) / 2;
    const cardHeight = height - gap * 2;
    return [
      { x: gap, y: gap, w: cardWidth, h: cardHeight },
      { x: gap * 2 + cardWidth, y: gap, w: cardWidth, h: cardHeight }
    ];
  },

  isPointInsideFlashcards(x, y, width, height) {
    const cards = this.getCardBounds(width, height);
    return cards.some(c => x >= c.x && x <= (c.x + c.w) && y >= c.y && y <= (c.y + c.h));
  },

  setClipRegion(ctx, width, height) {
    const cards = this.getCardBounds(width, height);
    ctx.beginPath();
    cards.forEach(c => {
      ctx.rect(c.x, c.y, c.w, c.h);
    });
    ctx.clip();
  }
};
