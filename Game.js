class Game {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.video = video;
    
    // ゲームオブジェクト
    this.ball = new Ball(canvas);
    this.paddle = new Paddle(canvas);
    this.brickGrid = new BrickGrid();
    
    // Load custom settings
    this.loadCustomSettings();
    
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

  loadCustomSettings() {
    // Load custom brick colors
    const savedColors = localStorage.getItem('gameBrickColors');
    if (savedColors) {
      try {
        this.customBrickColors = JSON.parse(savedColors);
        this.brickGrid.setCustomColors(this.customBrickColors);
      } catch (error) {
        console.error('Error loading brick colors:', error);
      }
    }

    // Load custom paddle color
    const savedPaddleColor = localStorage.getItem('gamePaddleColor');
    if (savedPaddleColor) {
      this.paddle.setColor(savedPaddleColor);
      console.log('Game: Loaded custom paddle color:', savedPaddleColor);
    }

    // Load custom background video
    this.customVideo = localStorage.getItem('gameBackgroundVideo');
    if (this.customVideo) {
      this.setupCustomVideo();
    }

    // Load custom audio
    this.loadCustomAudio();
  }

  // Method to reload settings (called when settings are updated)
  reloadCustomSettings() {
    this.loadCustomSettings();
  }

  setupCustomVideo() {
    if (this.customVideo) {
      // Create video element from base64 data
      const videoElement = document.createElement('video');
      videoElement.src = this.customVideo;
      videoElement.loop = true;
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);
      this.video = videoElement;
      
      // Auto-play when game starts
      videoElement.addEventListener('canplay', () => {
        if (this.gameRunning) {
          videoElement.play().catch(error => console.warn('Video play error:', error));
        }
      });
    }
  }

  loadCustomAudio() {
    const audioTypes = ['bgm', 'bounce', 'block', 'gameOver', 'win'];
    audioTypes.forEach(type => {
      const customAudio = localStorage.getItem(`gameAudio_${type}`);
      if (customAudio) {
        // Update the sound objects with custom audio
        if (type === 'bgm') {
          const bgmElement = document.getElementById('bgm');
          if (bgmElement) {
            bgmElement.src = customAudio;
          }
        } else {
          // Update game sound effects
          const soundMap = {
            bounce: 'bounceSound',
            block: 'blockSound', 
            gameOver: 'gameOverSound',
            win: 'winSound'
          };
          
          if (this[soundMap[type]]) {
            this[soundMap[type]].sound.src = customAudio;
          }
        }
      }
    });
  }

  drawBackground() {
    // Try to draw custom video background first
    if (this.video && this.video.readyState >= 2) {
      try {
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        return;
      } catch (error) {
        console.warn('Video drawing error:', error);
      }
    }
    
    // Default gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
    // Clear canvas
    this.clearCanvas();
    
    // Draw background (video or default)
    this.drawBackground();
    
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
      
      // Start custom video if available
      if (this.video) {
        this.video.play().catch(error => console.warn('Video play error:', error));
      }
      
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