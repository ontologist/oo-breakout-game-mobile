// Sakura.js - Cherry blossom petal animation class
class Sakura {
    constructor(canvas) {
        console.log('Sakura constructor called');
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.petals = [];
        this.numPetals = 50; // Reduced for performance in game
        
        // Initialize immediately without waiting for external images
        this.initPetals();
        this.isReady = true;
        
        // Create gradient backgrounds
        this.createBackgrounds();
        console.log('Sakura initialized with', this.numPetals, 'petals');
    }
    
    createBackgrounds() {
        // Create a beautiful Japanese-inspired gradient background
        this.backgroundGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        this.backgroundGradient.addColorStop(0, '#E6F3FF'); // Light sky blue
        this.backgroundGradient.addColorStop(0.3, '#B8E6FF'); // Lighter blue
        this.backgroundGradient.addColorStop(0.6, '#FFE5E5'); // Very light pink
        this.backgroundGradient.addColorStop(0.8, '#FFD1DC'); // Light pink
        this.backgroundGradient.addColorStop(1, '#FFC0CB'); // Pink base
        
        // Create mountain silhouette gradient
        this.mountainGradient = this.ctx.createLinearGradient(0, this.canvas.height * 0.4, 0, this.canvas.height);
        this.mountainGradient.addColorStop(0, '#8B7D8B'); // Mountain purple
        this.mountainGradient.addColorStop(0.5, '#A0A0A0'); // Gray
        this.mountainGradient.addColorStop(1, '#D3D3D3'); // Light gray
    }
    
    initPetals() {
        this.petals = [];
        for (let i = 0; i < this.numPetals; i++) {
            this.petals.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 6 + 4, // Petal size
                speed: Math.random() * 1.5 + 0.5, // Falling speed
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.05, // Slower rotation for subtlety
                opacity: Math.random() * 0.7 + 0.3, // Varying opacity
                swayOffset: Math.random() * Math.PI * 2, // For horizontal swaying
                color: this.getRandomPetalColor()
            });
        }
    }
    
    getRandomPetalColor() {
        const colors = [
            '#FFB6C1', // Light pink
            '#FFC0CB', // Pink
            '#FFCCCB', // Light coral
            '#F8BBD9', // Light pink
            '#E6E6FA', // Lavender
            '#FFFFFF'  // White
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    drawBackground() {
        // Draw sky gradient
        this.ctx.fillStyle = this.backgroundGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stylized Mt. Fuji silhouette
        this.drawMountain();
        
        // Add some clouds
        this.drawClouds();
    }
    
    drawMountain() {
        const centerX = this.canvas.width * 0.7;
        const baseY = this.canvas.height * 0.8;
        const peakY = this.canvas.height * 0.4;
        const width = this.canvas.width * 0.6;
        
        this.ctx.fillStyle = this.mountainGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - width/2, baseY);
        this.ctx.lineTo(centerX, peakY);
        this.ctx.lineTo(centerX + width/2, baseY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add snow cap
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.globalAlpha = 0.8;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - width/8, peakY + (baseY - peakY) * 0.2);
        this.ctx.lineTo(centerX, peakY);
        this.ctx.lineTo(centerX + width/8, peakY + (baseY - peakY) * 0.2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    
    drawClouds() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.globalAlpha = 0.6;
        
        // Draw simple cloud shapes
        this.drawCloud(this.canvas.width * 0.2, this.canvas.height * 0.3, 30);
        this.drawCloud(this.canvas.width * 0.8, this.canvas.height * 0.25, 25);
        this.drawCloud(this.canvas.width * 0.5, this.canvas.height * 0.35, 20);
        
        this.ctx.globalAlpha = 1;
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.5, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x - size * 0.5, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x, y - size * 0.5, size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPetals() {
        if (!this.isReady) return;
        
        this.petals.forEach(petal => {
            this.ctx.save();
            this.ctx.globalAlpha = petal.opacity;
            this.ctx.translate(petal.x, petal.y);
            this.ctx.rotate(petal.angle);
            
            // Draw cherry blossom petal shape
            this.drawCherryBlossomPetal(petal.size, petal.color);
            
            this.ctx.restore();
        });
    }
    
    drawCherryBlossomPetal(size, color) {
        // Draw a stylized 5-petal cherry blossom
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#FF69B4';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < 5; i++) {
            this.ctx.save();
            this.ctx.rotate((i * Math.PI * 2) / 5);
            
            // Draw petal shape
            this.ctx.beginPath();
            this.ctx.ellipse(0, -size/3, size/4, size/2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.restore();
        }
        
        // Draw center
        this.ctx.fillStyle = '#FFD700'; // Gold center
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size/8, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    update() {
        if (!this.isReady) return;
        
        this.petals.forEach(petal => {
            petal.y += petal.speed;
            petal.angle += petal.spin;
            petal.swayOffset += 0.02;
            
            // Add subtle horizontal swaying motion
            petal.x += Math.sin(petal.swayOffset) * 0.5;
            
            // Reset petal when it goes off-screen
            if (petal.y > this.canvas.height + 10) {
                petal.y = -10;
                petal.x = Math.random() * this.canvas.width;
                petal.opacity = Math.random() * 0.7 + 0.3;
                petal.color = this.getRandomPetalColor();
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