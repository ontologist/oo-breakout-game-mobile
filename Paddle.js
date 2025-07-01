class Paddle {
  constructor(canvas, width = 75, height = 10) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.x = (canvas.width - width) / 2;
    this.speed = 7;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.canvas.height - this.height, this.width, this.height);
    ctx.fillStyle = "#0095DD";  
    ctx.fill(); 
    ctx.closePath();
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