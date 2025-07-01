class Game {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.video = video;
    
    // ゲームオブジェクト
    this.ball = new Ball(canvas);
    this.paddle = new Paddle(canvas);
    this.brickGrid = new BrickGrid();
    this.sakura = new Sakura(canvas); // Add Sakura animation
    
    // ゲーム状態
    this.score = 0;
    this.lives = 3;
    this.gameRunning = false;
    this.interval = null;
    
    // 入力状態
    this.rightPressed = false;
    this.leftPressed = false;
    
    // サウンド効果
    this.initializeSounds();
    
    // イベントリスナーを設定
    this.setupEventListeners();
  }

  initializeSounds() {
    this.bounceSound = new sound("assets/bounce.mp3");
    this.blockSound = new sound("assets/blockSound.mp3");
    this.gameOverSound = new sound("assets/gameOver.mp3");
    this.winSound = new sound("assets/winSound.mp3");
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => this.keyDownHandler(e), false);
    document.addEventListener("keyup", (e) => this.keyUpHandler(e), false);
    document.addEventListener("mousemove", (e) => this.mouseMoveHandler(e), false);
  }

  keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
      this.rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      this.leftPressed = true;
    }
  }

  keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
      this.rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      this.leftPressed = false;
    }
  }

  mouseMoveHandler(e) {
    this.paddle.moveTo(e.clientX);
  }

  // Methods for mobile button controls
  setLeftPressed(pressed) {
    this.leftPressed = pressed;
  }

  setRightPressed(pressed) {
    this.rightPressed = pressed;
  }

  drawScore() {
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#0095DD";
    this.ctx.fillText("Score: " + this.score, 8, 20);
  }

  drawLives() {
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#0095DD";
    this.ctx.fillText("Lives: " + this.lives, this.canvas.width - 65, 20);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  handleCollisions() {
    // 壁との衝突
    const wallCollision = this.ball.checkWallCollision();
    if (wallCollision) {
      this.bounceSound.play();
    }

    // パドルとの衝突
    const paddleCollision = this.ball.checkPaddleCollision(this.paddle);
    if (paddleCollision === true) {
      this.bounceSound.play();
    } else if (paddleCollision === false) {
      // ボールがパドルを逃した
      this.lives--;
      if (this.lives <= 0) {
        this.gameOver();
      } else {
        this.resetBall();
      }
    }

    // ブロックとの衝突
    if (this.brickGrid.checkCollision(this.ball)) {
      this.blockSound.play();
      this.score++;
      
      if (this.brickGrid.allDestroyed()) {
        this.winGame();
      }
    }
  }

  handleInput() {
    if (this.rightPressed) {
      this.paddle.moveRight();
    }
    if (this.leftPressed) {
      this.paddle.moveLeft();
    }
  }

  resetBall() {
    this.ball.reset();
    this.paddle.reset();
  }

  gameOver() {
    this.gameOverSound.play();
    alert("GAME OVER");
    this.stopGame();
    document.location.reload();
  }

  winGame() {
    this.winSound.play();
    alert("Congratulations! You win!");
    this.stopGame();
    document.location.reload();
  }

  draw() {
    // 背景をクリアして描画
    this.clearCanvas();
    
    // Sakura animation background (replaces video background)
    this.sakura.draw();
    
    // ゲームオブジェクトを描画
    this.brickGrid.draw(this.ctx);
    this.ball.draw(this.ctx);
    this.paddle.draw(this.ctx);
    this.drawScore();
    this.drawLives();
    
    // 衝突をチェック
    this.handleCollisions();
    
    // 入力を処理
    this.handleInput();
    
    // ボールを移動
    this.ball.move();
  }

  startGame() {
    if (!this.gameRunning) {
      this.gameRunning = true;
      this.interval = setInterval(() => this.draw(), 10);
      
      // BGMを再生
      const bgm = document.getElementById("bgm");
      if (bgm) {
        bgm.play().catch(error => console.warn('BGM再生エラー:', error));
      }
      
      console.log('ゲームループ開始');
    }
  }

  stopGame() {
    if (this.gameRunning) {
      this.gameRunning = false;
      clearInterval(this.interval);
    }
  }
}

// サウンドクラス（既存のものを使用）
function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){ this.sound.play(); }
  this.stop = function(){ this.sound.pause(); }
} 