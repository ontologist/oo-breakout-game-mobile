
    // Define a object class called Player
    // プレヤーオブジェクトクラスを定義する
    class Player {
        // A constructor is a special method that is called when the object is created.
        // コンストラクタはオブジェクトが生成されたときに呼ばれる特別なメソッドです。
        constructor(canvas) {
          this.canvas = canvas;
          this.score = new Score(canvas, 0);
          this._lives = new Lives(canvas, 3);
          this.ctx = canvas.getContext("2d");
          this.x = canvas.width / 2;
          this.y = canvas.height - 30;
          this.dx = Player.PLAYER_SPEED;
          this.dy = -Player.PLAYER_SPEED;
          this.isHappy = true;
          
          this.crashSound = new Audio("mixkit-game-ball-tap-2073.wav");
        }
        // Static properties are just like constants
        // 静的プロパティは定数と同じ
        static get PLAYER_SPEED() { return 1; }
        static get PLAYER_RADIUS() { return 10; }
        static get PLAYER_CIR_START() { return 0; }
        static get EYE_X_OFFSET() { return 3; }
        static get EYE_Y_OFFSET() { return 3; }
        static get EYE_RADIUS() { return 2; }
        static get EYE_START() { return 0; }
        static get MOUTH_RADIUS() { return 3; }
        static get MOUTH_START() { return 0; }
        static get MOUTH_Y_OFFSET() { return 2; }
  
        // Method to draw the player
        // プレーヤーを描画するメソッド
        drawPlayer() {
          // Draw player
          // プレーヤーを描画する
          this.ctx.beginPath();
          this.ctx.arc(this.x, this.y, Player.PLAYER_RADIUS, Player.PLAYER_CIR_START, 2 * Math.PI);
          this.ctx.fillStyle = "yellow";
          this.ctx.fill();
          this.ctx.strokeStyle = "red";
          this.ctx.stroke();
          this.ctx.closePath();
          
          this.crashSound = new Audio("mixkit-game-ball-tap-2073.wav");
  
          // Draw left eye
          // 左目を描画する
          this.ctx.beginPath();
          this.ctx.arc(this.x - Player.EYE_X_OFFSET, this.y - Player.EYE_Y_OFFSET, Player.EYE_RADIUS, Player.EYE_START, Math.PI * 2, true);
          this.ctx.fillStyle = "black";
          this.ctx.fill();
  
          // Draw right eye
          // 右目を描画する
          this.ctx.beginPath();
          this.ctx.arc(this.x + Player.EYE_X_OFFSET, this.y - Player.EYE_Y_OFFSET, Player.EYE_RADIUS, Player.EYE_START, Math.PI * 2, true);
          this.ctx.fillStyle = "black";
          this.ctx.fill();
  
          // Draw mouth
          // 口を描画する
          if (this.isHappy) {
              this.ctx.beginPath();
              this.ctx.arc(this.x, this.y + Player.MOUTH_Y_OFFSET, Player.MOUTH_RADIUS, Player.MOUTH_START, Math.PI, false);
              this.ctx.strokeStyle = "black";
              this.ctx.stroke();
          }
  
          this.score.drawScore(); // Use the instantiated Score object here
  
          // Move the Player by changing its position everytime the drawPlayer() method is called
          // プレーヤーを描画するたびに、プレーヤーの位置を変更する
          this.x += this.dx;
          this.y += this.dy;
        }
  
        // Method to check if the player has crashed into the walls on the sides and above
        // プレーヤーが左右の壁と上に衝突しているかどうかをチェックするメソッド
        collisionDetection(paddleX) {
          // Check collision with the walls
          // 壁との衝突をチェックする
          if (this.x + Player.PLAYER_RADIUS >= this.canvas.width || this.x - Player.PLAYER_RADIUS <= 0) {
              this.dx = -this.dx;
          }
  
          // Check collision with the celing
          if (this.y - Player.PLAYER_RADIUS <= 0) {
              this.dy = -this.dy;
              this.crashSound.play();
              //this.isHappy = !this.isHappy;
          } 
          // Check collision with the paddle
          
          else if (this.y + Player.PLAYER_RADIUS >= 
                    this.canvas.height - Paddle.PADDLE_HEIGHT) {
              if (this.x >= paddleX && 
                  this.x <= paddleX + Paddle.PADDLE_WIDTH) {
                  this.dy = -this.dy;
                  this.crashSound.play();
                  this.isHappy = !this.isHappy;
              }
          }
  
      // Check if the player has fallen off the bottom of the screen
      if (this.y + Player.PLAYER_RADIUS > this.canvas.height) {
        this._lives.decreaseLives() // Decrement the player's lives
        // Reset the player's position to the starting position
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 30;
        this.dx = Player.PLAYER_SPEED;
        this.dy = -Player.PLAYER_SPEED;
      }
  
      }
  
  
      // Check collision with the bricks
      // ブリックとの衝突をチェックする
      bricksCollisionDetection(bricks) {
        for (let c= 0; c < bricks.length; c++) {
          for (let r= 0; r < bricks[c].length; r++) {
            let brick = bricks[c][r];
            if (brick.status === 1) {
              if (this.x + Player.PLAYER_RADIUS >= brick.x && 
                this.x - Player.PLAYER_RADIUS<= brick.x + brick.width &&
                this.y + Player.PLAYER_RADIUS>= brick.y && 
                this.y - Player.PLAYER_RADIUS <= brick.y + brick.height) {
                  this.dy = -this.dy;
                  brick.status = 0;
                  this.score.updateScoreText();
                  this.crashSound.play();
                  //this.isHappy = !this.isHappy;
              }
            }
          }
          
        }
      }
  
  }