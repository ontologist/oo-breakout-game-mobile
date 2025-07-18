// settings.js - Game Settings Management

// Default settings
const DEFAULT_SETTINGS = {
    brickColors: {
        0: "#0095DD",
        1: "#DD9500", 
        2: "#95DD00",
        3: "#DD0095",
        4: "#00DD95"
    },
    paddleColor: "#0095DD",
    backgroundVideo: null,
    audio: {
        bgm: null,
        bounce: null,
        block: null,
        gameOver: null,
        win: null
    }
};

// Current audio element for testing
let currentAudio = null;

// Initialize settings page
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
    updateBrickPreview();
    updatePaddlePreview();
});

// Setup event listeners
function setupEventListeners() {
    // Color picker changes
    for (let i = 0; i < 5; i++) {
        document.getElementById(`color${i}`).addEventListener('change', updateBrickPreview);
    }
    
    // Paddle color change
    document.getElementById('paddleColor').addEventListener('change', updatePaddlePreview);
    
    // Video upload drag and drop
    const videoUploadArea = document.getElementById('videoUploadArea');
    const videoInput = document.getElementById('videoInput');
    
    videoUploadArea.addEventListener('click', () => videoInput.click());
    videoUploadArea.addEventListener('dragover', handleDragOver);
    videoUploadArea.addEventListener('drop', handleVideoDrop);
    videoInput.addEventListener('change', handleVideoSelect);
    
    // Audio file changes
    const audioInputs = ['bgmInput', 'bounceInput', 'blockInput', 'gameOverInput', 'winInput'];
    audioInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('change', function() {
            const audioType = inputId.replace('Input', '');
            handleAudioSelect(audioType, this.files[0]);
        });
    });
}

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            
            // Load brick colors
            if (settings.brickColors) {
                for (let i = 0; i < 5; i++) {
                    if (settings.brickColors[i]) {
                        document.getElementById(`color${i}`).value = settings.brickColors[i];
                    }
                }
            }
            
            // Load paddle color
            if (settings.paddleColor) {
                document.getElementById('paddleColor').value = settings.paddleColor;
                updatePaddlePreview();
            }
            
            // Load background video
            if (settings.backgroundVideo) {
                displayVideoPreview(settings.backgroundVideo);
            }
            
            console.log('Settings loaded successfully');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        brickColors: {},
        paddleColor: document.getElementById('paddleColor').value,
        backgroundVideo: localStorage.getItem('gameBackgroundVideo'),
        audio: {}
    };
    
    // Save brick colors
    for (let i = 0; i < 5; i++) {
        settings.brickColors[i] = document.getElementById(`color${i}`).value;
    }
    
    // Save audio settings
    const audioTypes = ['bgm', 'bounce', 'block', 'gameOver', 'win'];
    audioTypes.forEach(type => {
        settings.audio[type] = localStorage.getItem(`gameAudio_${type}`);
    });
    
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    console.log('Settings saved successfully');
}

// Brick color functions
function updateBrickPreview() {
    const preview = document.getElementById('brickPreview');
    preview.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const brick = document.createElement('div');
        brick.className = 'brick-sample';
        brick.style.backgroundColor = document.getElementById(`color${i}`).value;
        brick.textContent = `Col ${i + 1}`;
        preview.appendChild(brick);
    }
}

function saveBrickColors() {
    const colors = {};
    for (let i = 0; i < 5; i++) {
        colors[i] = document.getElementById(`color${i}`).value;
    }
    
    localStorage.setItem('gameBrickColors', JSON.stringify(colors));
    saveSettings();
    showMessage('Brick colors saved successfully!', 'success');
}

function resetBrickColors() {
    for (let i = 0; i < 5; i++) {
        document.getElementById(`color${i}`).value = DEFAULT_SETTINGS.brickColors[i];
    }
    updateBrickPreview();
    saveBrickColors();
}

// Paddle color functions
function updatePaddlePreview() {
    const paddleColor = document.getElementById('paddleColor').value;
    const paddleDisplay = document.getElementById('paddlePreviewDisplay');
    paddleDisplay.style.backgroundColor = paddleColor;
}

function savePaddleColor() {
    const paddleColor = document.getElementById('paddleColor').value;
    localStorage.setItem('gamePaddleColor', paddleColor);
    saveSettings();
    
    // Apply immediately to any running games
    if (typeof window.game !== 'undefined' && window.game.paddle) {
        window.game.paddle.setColor(paddleColor);
        console.log('Applied paddle color to running OOP game:', paddleColor);
    }
    
    showMessage('Paddle color saved successfully! Changes will apply when you restart the games.', 'success');
}

function resetPaddleColor() {
    document.getElementById('paddleColor').value = DEFAULT_SETTINGS.paddleColor;
    updatePaddlePreview();
    savePaddleColor();
}

// Video handling functions
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleVideoDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleVideoFile(files[0]);
    }
}

function handleVideoSelect(e) {
    if (e.target.files.length > 0) {
        handleVideoFile(e.target.files[0]);
    }
}

function handleVideoFile(file) {
    // Check file size first (10MB limit for upload)
    const maxUploadSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxUploadSize) {
        showVideoMessage(`File too large! Maximum upload size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`, 'error');
        return;
    }
    
    // Check file type - support MP4, MOV, WebM, OGV
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/ogg'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['mp4', 'mov', 'webm', 'ogv', 'ogg'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        showVideoMessage('Unsupported video format. Please use MP4, MOV, WebM, or OGV files.', 'error');
        return;
    }
    
    const targetSize = 2 * 1024 * 1024; // 2MB target for storage
    
    if (file.size > targetSize) {
        showVideoMessage(`File size: ${(file.size / 1024 / 1024).toFixed(1)}MB. Compressing to under 2MB for optimal game performance...`, 'info');
        compressVideo(file, targetSize);
    } else {
        processVideo(file);
    }
}

function compressVideo(file, maxSize) {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.addEventListener('loadedmetadata', function() {
        // Set canvas dimensions (reduce resolution if needed)
        const aspectRatio = video.videoWidth / video.videoHeight;
        let targetWidth = Math.min(video.videoWidth, 640); // Max width 640px
        let targetHeight = targetWidth / aspectRatio;
        
        // Further reduce if still too large
        if (targetHeight > 480) {
            targetHeight = 480;
            targetWidth = targetHeight * aspectRatio;
        }
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Create video recorder
        const stream = canvas.captureStream(15); // 15 FPS for compression
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 400000 // 400kbps for good compression
        });
        
        const chunks = [];
        
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = function() {
            const compressedBlob = new Blob(chunks, { type: 'video/webm' });
            
            if (compressedBlob.size <= maxSize) {
                // Convert compressed video to base64
                const reader = new FileReader();
                reader.onload = function(e) {
                    const videoData = e.target.result;
                    localStorage.setItem('gameBackgroundVideo', videoData);
                    displayVideoPreview(videoData);
                    const originalSize = (file.size / 1024 / 1024).toFixed(1);
                    const compressedSize = (compressedBlob.size / 1024 / 1024).toFixed(1);
                    showVideoMessage(`Video compressed successfully! ${originalSize}MB → ${compressedSize}MB`, 'success');
                    saveSettings();
                };
                reader.readAsDataURL(compressedBlob);
            } else {
                // If still too large, try more aggressive compression
                showVideoMessage('Video still too large after compression. Please use a shorter video or lower resolution.', 'error');
            }
        };
        
        // Start recording
        mediaRecorder.start();
        
        let currentTime = 0;
        const duration = Math.min(video.duration, 30); // Limit to 30 seconds max
        const fps = 15;
        const frameInterval = 1000 / fps;
        
        function captureFrame() {
            if (currentTime < duration) {
                video.currentTime = currentTime;
                
                video.addEventListener('seeked', function onSeeked() {
                    video.removeEventListener('seeked', onSeeked);
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    currentTime += 1 / fps;
                    setTimeout(captureFrame, frameInterval);
                });
            } else {
                mediaRecorder.stop();
            }
        }
        
        captureFrame();
    });
    
    video.addEventListener('error', function() {
        showVideoMessage('Error processing video for compression. Please try a different file.', 'error');
    });
    
    video.src = URL.createObjectURL(file);
    video.load();
}

function processVideo(file) {
    // Convert to base64 and store (original function for files under 2MB)
    const reader = new FileReader();
    reader.onload = function(e) {
        const videoData = e.target.result;
        localStorage.setItem('gameBackgroundVideo', videoData);
        displayVideoPreview(videoData);
        const fileExtension = file.name.split('.').pop().toUpperCase();
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
        
        // Show appropriate message based on file type
        if (fileExtension === 'MOV') {
            showVideoMessage(`QuickTime (.mov) video uploaded successfully! Size: ${fileSizeMB}MB`, 'success');
        } else {
            showVideoMessage(`${fileExtension} video uploaded successfully! Size: ${fileSizeMB}MB`, 'success');
        }
        
        saveSettings();
    };
    reader.readAsDataURL(file);
}

function displayVideoPreview(videoData) {
    const previewArea = document.getElementById('videoPreviewArea');
    const videoPreview = document.getElementById('videoPreview');
    const videoInfo = document.getElementById('videoInfo');
    
    videoPreview.src = videoData;
    previewArea.style.display = 'block';
    
    videoPreview.addEventListener('loadedmetadata', function() {
        const duration = Math.round(videoPreview.duration);
        const size = Math.round(videoData.length * 0.75 / 1024); // Approximate size in KB
        const format = videoData.substring(5, videoData.indexOf(';')); // Extract MIME type
        videoInfo.textContent = `Format: ${format} | Duration: ${duration}s | Size: ~${size}KB`;
    });
}

function saveBackgroundVideo() {
    const videoData = localStorage.getItem('gameBackgroundVideo');
    console.log('Checking for video data...', videoData ? 'Found' : 'Not found');
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    if (videoData) {
        // Force save to all game storage keys
        localStorage.setItem('gameBrickColors', localStorage.getItem('gameBrickColors') || JSON.stringify(DEFAULT_SETTINGS.brickColors));
        saveSettings();
        showVideoMessage('Background video settings applied to games!', 'success');
    } else {
        // Check if video preview is visible (means video was uploaded but not stored properly)
        const previewArea = document.getElementById('videoPreviewArea');
        const videoPreview = document.getElementById('videoPreview');
        
        if (previewArea.style.display !== 'none' && videoPreview.src) {
            // Video is previewing but not in localStorage - this is the bug
            showVideoMessage('Video is loaded but not saved. Try uploading again.', 'error');
        } else {
            showVideoMessage('No video to save. Please upload a video first.', 'error');
        }
    }
}

function removeBackgroundVideo() {
    localStorage.removeItem('gameBackgroundVideo');
    document.getElementById('videoPreviewArea').style.display = 'none';
    showVideoMessage('Background video removed.', 'success');
    saveSettings();
}

// Audio handling functions
function handleAudioSelect(audioType, file) {
    if (!file) return;
    
    // Check file size (1MB limit)
    const maxSize = 1024 * 1024; // 1MB in bytes
    if (file.size > maxSize) {
        showAudioMessage(`${audioType} file too large! Maximum size is 1MB.`, 'error');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('audio/')) {
        showAudioMessage(`Please select a valid audio file for ${audioType}.`, 'error');
        return;
    }
    
    // Convert to base64 and store
    const reader = new FileReader();
    reader.onload = function(e) {
        const audioData = e.target.result;
        localStorage.setItem(`gameAudio_${audioType}`, audioData);
        
        // Update preview audio
        const previewAudio = document.getElementById(`${audioType}Preview`);
        previewAudio.src = audioData;
        
        showAudioMessage(`${audioType} audio uploaded successfully!`, 'success');
        saveSettings();
    };
    reader.readAsDataURL(file);
}

function testAudio(audioType) {
    stopAudio(); // Stop any currently playing audio
    
    const audioData = localStorage.getItem(`gameAudio_${audioType}`);
    if (audioData) {
        currentAudio = new Audio(audioData);
        currentAudio.play().catch(error => {
            console.error('Error playing audio:', error);
            showAudioMessage(`Error playing ${audioType} audio.`, 'error');
        });
    } else {
        // Try default audio
        const defaultPath = `assets/${audioType === 'bgm' ? 'bgm' : audioType === 'block' ? 'blockSound' : audioType}.mp3`;
        currentAudio = new Audio(defaultPath);
        currentAudio.play().catch(error => {
            showAudioMessage(`No custom ${audioType} audio found and default audio not available.`, 'error');
        });
    }
}

function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

function saveAudioSettings() {
    showAudioMessage('Audio settings saved to games!', 'success');
    saveSettings();
}

function resetAudioSettings() {
    const audioTypes = ['bgm', 'bounce', 'block', 'gameOver', 'win'];
    audioTypes.forEach(type => {
        localStorage.removeItem(`gameAudio_${type}`);
        document.getElementById(`${type}Input`).value = '';
        document.getElementById(`${type}Preview`).src = '';
    });
    showAudioMessage('Audio settings reset to default.', 'success');
    saveSettings();
}

// Main action functions
function applyAllSettings() {
    saveSettings();
    showMessage('All settings applied to games! Changes will take effect when you restart the games.', 'success');
}

function resetAllSettings() {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
        // Reset brick colors
        resetBrickColors();
        
        // Reset paddle color
        resetPaddleColor();
        
        // Reset video
        removeBackgroundVideo();
        
        // Reset audio
        resetAudioSettings();
        
        // Clear all localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('game')) {
                localStorage.removeItem(key);
            }
        });
        
        showMessage('All settings reset to default!', 'success');
        location.reload(); // Reload page to reflect changes
    }
}

function exportSettings() {
    const settings = {
        brickColors: {},
        paddleColor: document.getElementById('paddleColor').value,
        backgroundVideo: localStorage.getItem('gameBackgroundVideo'),
        audio: {}
    };
    
    // Export brick colors
    for (let i = 0; i < 5; i++) {
        settings.brickColors[i] = document.getElementById(`color${i}`).value;
    }
    
    // Export audio settings
    const audioTypes = ['bgm', 'bounce', 'block', 'gameOver', 'win'];
    audioTypes.forEach(type => {
        settings.audio[type] = localStorage.getItem(`gameAudio_${type}`);
    });
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'game-settings.json';
    link.click();
    
    showMessage('Settings exported successfully!', 'success');
}

function importSettings() {
    const file = document.getElementById('importInput').files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const settings = JSON.parse(e.target.result);
            
            // Import brick colors
            if (settings.brickColors) {
                for (let i = 0; i < 5; i++) {
                    if (settings.brickColors[i]) {
                        document.getElementById(`color${i}`).value = settings.brickColors[i];
                    }
                }
                updateBrickPreview();
            }
            
            // Import paddle color
            if (settings.paddleColor) {
                document.getElementById('paddleColor').value = settings.paddleColor;
                updatePaddlePreview();
            }
            
            // Import background video
            if (settings.backgroundVideo) {
                localStorage.setItem('gameBackgroundVideo', settings.backgroundVideo);
                displayVideoPreview(settings.backgroundVideo);
            }
            
            // Import audio settings
            if (settings.audio) {
                const audioTypes = ['bgm', 'bounce', 'block', 'gameOver', 'win'];
                audioTypes.forEach(type => {
                    if (settings.audio[type]) {
                        localStorage.setItem(`gameAudio_${type}`, settings.audio[type]);
                        document.getElementById(`${type}Preview`).src = settings.audio[type];
                    }
                });
            }
            
            saveSettings();
            showMessage('Settings imported successfully!', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            showMessage('Error importing settings. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// Utility functions
function showMessage(message, type) {
    // Create or update a general message area
    let messageDiv = document.getElementById('generalMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'generalMessage';
        document.querySelector('.settings-container').appendChild(messageDiv);
    }
    
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 5000);
}

function showVideoMessage(message, type) {
    const messageDiv = document.getElementById('videoMessage');
    
    if (type === 'error') {
        messageDiv.className = 'error-message';
    } else if (type === 'info') {
        messageDiv.className = 'info-message';
    } else {
        messageDiv.className = 'success-message';
    }
    
    messageDiv.textContent = message;
    
    // Clear message after 8 seconds for compression messages, 5 seconds for others
    const timeout = type === 'info' ? 8000 : 5000;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }, timeout);
}

function showAudioMessage(message, type) {
    const messageDiv = document.getElementById('audioMessage');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 5000);
}

// Generate and play a win sound using Web Audio API
function generateAndPlayWinSound() {
    try {
        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a win sound (ascending notes)
        const notes = [261.63, 329.63, 392, 523.25]; // C4, E4, G4, C5
        const duration = 0.3; // seconds per note
        
        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Connect oscillator to gain to speakers
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Set up the oscillator
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * duration);
            
            // Set up the gain (volume envelope)
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * duration);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + index * duration + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (index + 1) * duration);
            
            // Start and stop the oscillator
            oscillator.start(audioContext.currentTime + index * duration);
            oscillator.stop(audioContext.currentTime + (index + 1) * duration);
        });
        
        showAudioMessage('Win sound generated and played!', 'success');
        
    } catch (error) {
        console.error('Error generating sound:', error);
        showAudioMessage('Error generating sound: ' + error.message, 'error');
    }
}

// Generate bounce sound
function generateBounceSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Bounce sound: quick frequency sweep
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
        
        // Quick volume envelope
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        
        showAudioMessage('Bounce sound generated!', 'success');
        
    } catch (error) {
        console.error('Error generating bounce sound:', error);
        showAudioMessage('Error generating bounce sound: ' + error.message, 'error');
    }
}

// Generate block hit sound
function generateBlockSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Block hit sound: sharp attack with noise
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.05);
        
        // Sharp attack
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
        
        showAudioMessage('Block hit sound generated!', 'success');
        
    } catch (error) {
        console.error('Error generating block sound:', error);
        showAudioMessage('Error generating block sound: ' + error.message, 'error');
    }
}

// Generate game over sound
function generateGameOverSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Game over sound: descending notes
        const notes = [523.25, 392, 329.63, 261.63]; // C5, G4, E4, C4
        const duration = 0.4; // seconds per note
        
        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * duration);
            
            // Sad, slow envelope
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * duration);
            gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + index * duration + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (index + 1) * duration);
            
            oscillator.start(audioContext.currentTime + index * duration);
            oscillator.stop(audioContext.currentTime + (index + 1) * duration);
        });
        
        showAudioMessage('Game over sound generated!', 'success');
        
    } catch (error) {
        console.error('Error generating game over sound:', error);
        showAudioMessage('Error generating game over sound: ' + error.message, 'error');
    }
} 