class Brick {
  constructor(x, y, width = 75, height = 20, color = "#0095DD") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.status = 1; // 1 = 表示, 0 = 破壊済み
  }

  draw(ctx) {
    if (this.status === 1) {
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    }
  }

  // ブロックを破壊
  destroy() {
    this.status = 0;
  }

  // ブロックが生きているかチェック
  isAlive() {
    return this.status === 1;
  }
}

// ブロックグリッドを管理するクラス
class BrickGrid {
  constructor(rows = 3, columns = 5, brickWidth = 75, brickHeight = 20, padding = 10, offsetTop = 30, offsetLeft = 30) {
    this.rows = rows;
    this.columns = columns;
    this.brickWidth = brickWidth;
    this.brickHeight = brickHeight;
    this.padding = padding;
    this.offsetTop = offsetTop;
    this.offsetLeft = offsetLeft;
    this.bricks = [];
    this.totalBricks = rows * columns;
    
    // 色の配列
    this.colors = {
      0: "#0095DD",
      1: "#DD9500", 
      2: "#95DD00",
      3: "#DD0095",
      4: "#00DD95"
    };

    this.initializeBricks();
  }

  initializeBricks() {
    for (let c = 0; c < this.columns; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.rows; r++) {
        const x = c * (this.brickWidth + this.padding) + this.offsetLeft;
        const y = r * (this.brickHeight + this.padding) + this.offsetTop;
        const color = this.colors[c] || "#0095DD";
        this.bricks[c][r] = new Brick(x, y, this.brickWidth, this.brickHeight, color);
      }
    }
  }

  draw(ctx) {
    for (let c = 0; c < this.columns; c++) {
      for (let r = 0; r < this.rows; r++) {
        this.bricks[c][r].draw(ctx);
      }
    }
  }

  // すべてのブロックをチェックして衝突を検出
  checkCollision(ball) {
    for (let c = 0; c < this.columns; c++) {
      for (let r = 0; r < this.rows; r++) {
        const brick = this.bricks[c][r];
        if (ball.checkBrickCollision(brick)) {
          brick.destroy();
          return true; // 衝突発生
        }
      }
    }
    return false; // 衝突なし
  }

  // 残りのブロック数を取得
  getRemainingBricks() {
    let count = 0;
    for (let c = 0; c < this.columns; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.bricks[c][r].isAlive()) {
          count++;
        }
      }
    }
    return count;
  }

  // すべてのブロックが破壊されたかチェック
  allDestroyed() {
    return this.getRemainingBricks() === 0;
  }
} 