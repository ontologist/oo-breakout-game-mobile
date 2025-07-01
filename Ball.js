class Ball {
  constructor(canvas, radius = 10) {
    this.canvas = canvas;
    this.x = canvas.width / 2;
    this.y = canvas.height - 30;
    this.dx = 2;
    this.dy = -2;
    this.radius = radius;
  }

  draw(ctx) {
    drawPlayer(ctx, this.x, this.y, this.radius);
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
  }

  // 壁との衝突をチェック
  checkWallCollision() {
    if (this.x + this.dx > this.canvas.width - this.radius || this.x + this.dx < this.radius) {
      this.dx = -this.dx;
      return 'wall';
    }
    if (this.y + this.dy < this.radius) {
      this.dy = -this.dy;
      return 'ceiling';
    }
    return null;
  }

  // パドルとの衝突をチェック
  checkPaddleCollision(paddle) {
    if (this.y + this.dy > this.canvas.height - this.radius) {
      if (this.x > paddle.x && this.x < paddle.x + paddle.width) {
        this.dy = -this.dy;
        return true;
      }
      return false; // ボールがパドルを逃した
    }
    return null; // まだ下に到達していない
  }

  // ブロックとの衝突をチェック
  checkBrickCollision(brick) {
    if (brick.status === 1) {
      if (this.x > brick.x && 
          this.x < brick.x + brick.width && 
          this.y > brick.y && 
          this.y < brick.y + brick.height) {
        this.dy = -this.dy;
        return true;
      }
    }
    return false;
  }

  // ボールをリセット
  reset() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 30;
    this.dx = 2;
    this.dy = -2;
  }
} 