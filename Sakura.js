// Sakura.js - Cherry blossom petal animation class
class Sakura {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.petals = [];
        this.numPetals = 50; // Reduced for performance in game
        this.imagesLoaded = 0;
        this.totalImages = 2;
        
        // Load background and petal images
        this.background = new Image();
        this.background.crossOrigin = "anonymous";
        this.background.src = 'https://i.imgur.com/Y8iM5g4.png'; // Mt. Fuji background
        
        this.petalImage = new Image();
        this.petalImage.crossOrigin = "anonymous";
        this.petalImage.src = 'https://i.imgur.com/5RqM2w9.png'; // Sakura petal
        
        // Set up image loading
        this.background.onload = () => this.onImageLoad();
        this.petalImage.onload = () => this.onImageLoad();
        
        // Error handling for images
        this.background.onerror = () => {
            console.log('Background image failed to load, using gradient background');
            this.createGradientBackground();
            this.onImageLoad();
        };
        
        this.petalImage.onerror = () => {
            console.log('Petal image failed to load, using simple circles');
            this.useSimplePetals = true;
            this.onImageLoad();
        };
        
        this.isReady = false;
        this.useSimplePetals = false;
    }
    
    createGradientBackground() {
        // Create a gradient background as fallback
        this.backgroundGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        this.backgroundGradient.addColorStop(0, '#87CEEB'); // Sky blue
        this.backgroundGradient.addColorStop(0.7, '#FFB6C1'); // Light pink
        this.backgroundGradient.addColorStop(1, '#FFC0CB'); // Pink
    }
    
    onImageLoad() {
        this.imagesLoaded++;
        if (this.imagesLoaded >= this.totalImages) {
            this.initPetals();
            this.isReady = true;
        }
    }
    
    initPetals() {
        this.petals = [];
        for (let i = 0; i < this.numPetals; i++) {
            this.petals.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 4 + 3, // Petal size
                speed: Math.random() * 1.5 + 0.5, // Falling speed
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.05, // Slower rotation for subtlety
                opacity: Math.random() * 0.7 + 0.3 // Varying opacity
            });
        }
    }
    
    drawBackground() {
        if (this.background.complete && this.background.naturalWidth > 0) {
            // Draw the loaded background image
            this.ctx.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
        } else if (this.backgroundGradient) {
            // Use gradient background as fallback
            this.ctx.fillStyle = this.backgroundGradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Simple fallback background
            this.ctx.fillStyle = '#E6F3FF';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    drawPetals() {
        if (!this.isReady) return;
        
        this.petals.forEach(petal => {
            this.ctx.save();
            this.ctx.globalAlpha = petal.opacity;
            this.ctx.translate(petal.x, petal.y);
            this.ctx.rotate(petal.angle);
            
            if (this.useSimplePetals || !this.petalImage.complete) {
                // Draw simple pink circles as fallback
                this.ctx.fillStyle = '#FFB6C1';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, petal.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Draw the petal image
                this.ctx.drawImage(
                    this.petalImage, 
                    -petal.size / 2, 
                    -petal.size / 2, 
                    petal.size, 
                    petal.size
                );
            }
            
            this.ctx.restore();
        });
    }
    
    update() {
        if (!this.isReady) return;
        
        this.petals.forEach(petal => {
            petal.y += petal.speed;
            petal.angle += petal.spin;
            
            // Add subtle horizontal drift
            petal.x += Math.sin(petal.y * 0.01) * 0.5;
            
            // Reset petal when it goes off-screen
            if (petal.y > this.canvas.height + 10) {
                petal.y = -10;
                petal.x = Math.random() * this.canvas.width;
                petal.opacity = Math.random() * 0.7 + 0.3;
            }
            
            // Keep petals within horizontal bounds
            if (petal.x < -10) petal.x = this.canvas.width + 10;
            if (petal.x > this.canvas.width + 10) petal.x = -10;
        });
    }
    
    draw() {
        this.drawBackground();
        this.drawPetals();
        this.update();
    }
} 