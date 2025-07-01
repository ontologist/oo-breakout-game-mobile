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
});

// Setup event listeners
function setupEventListeners() {
    // Color picker changes
    for (let i = 0; i < 5; i++) {
        document.getElementById(`color${i}`).addEventListener('change', updateBrickPreview);
    }
    
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
    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
        showVideoMessage('File too large! Maximum size is 2MB.', 'error');
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
    
    // Convert to base64 and store
    const reader = new FileReader();
    reader.onload = function(e) {
        const videoData = e.target.result;
        localStorage.setItem('gameBackgroundVideo', videoData);
        displayVideoPreview(videoData);
        const fileExtension = file.name.split('.').pop().toUpperCase();
        showVideoMessage(`${fileExtension} video uploaded successfully! Both MP4 and MOV formats are fully supported.`, 'success');
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
    if (videoData) {
        showVideoMessage('Background video saved to games!', 'success');
        saveSettings();
    } else {
        showVideoMessage('No video to save. Please upload a video first.', 'error');
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
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 5000);
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