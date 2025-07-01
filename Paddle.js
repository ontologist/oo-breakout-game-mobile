class Paddle {
  constructor(canvas, width = 75, height = 10) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.x = (canvas.width - width) / 2;
    this.speed = 7;
    this.color = "#0095DD"; // Default paddle color
    this.loadCustomColor();
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.canvas.height - this.height, this.width, this.height);
    ctx.fillStyle = this.color;  
    ctx.fill(); 
    ctx.closePath();
  }

  // Load custom paddle color from localStorage
  loadCustomColor() {
    const savedPaddleColor = localStorage.getItem('gamePaddleColor');
    if (savedPaddleColor) {
      this.color = savedPaddleColor;
      console.log('Paddle: Loaded custom color:', savedPaddleColor);
    }
  }

  // Update paddle color (for settings changes)
  setColor(color) {
    this.color = color;
  }

  moveLeft() {
    if (this.x > 0) {
      this.x -= this.speed;
    }
  }

  moveRight() {
    if (this.x < this.canvas.width - this.width) {
      this.x += this.speed;
    }
  }

  // マウスの位置に基づいてパドルを移動
  moveTo(mouseX) {
    const relativeX = mouseX - this.canvas.offsetLeft;
    if (relativeX > 0 && relativeX < this.canvas.width) {
      this.x = relativeX - this.width / 2;
    }
  }

  // パドルをリセット
  reset() {
    this.x = (this.canvas.width - this.width) / 2;
  }
} 