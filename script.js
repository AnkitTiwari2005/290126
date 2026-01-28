// script.js

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create and append the main container
    const root = document.getElementById('root');
    
    // Create loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading Secure Environment...</div>
    `;
    
    root.appendChild(loadingScreen);
    
    // After a short delay, remove loading screen and render the login page
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            root.removeChild(loadingScreen);
            renderLoginPage();
            createParticles();
            updateTime();
            setInterval(updateTime, 1000);
        }, 500);
    }, 1500);
});

// Render the login page
function renderLoginPage() {
    const root = document.getElementById('root');
    
    // Create login container
    const loginContainer = document.createElement('div');
    loginContainer.className = 'login-container';
    loginContainer.id = 'loginContainer';
    
    // Create login wrapper
    const loginWrapper = document.createElement('div');
    loginWrapper.className = 'login-wrapper';
    
    // Create user avatar
    const userAvatar = document.createElement('div');
    userAvatar.className = 'user-avatar';
    userAvatar.innerHTML = '<i class="fas fa-user"></i>';
    
    // Create user name
    const userName = document.createElement('div');
    userName.className = 'user-name';
    userName.textContent = 'Elias Virex';
    
    // Create PIN input container
    const pinInputContainer = document.createElement('div');
    pinInputContainer.className = 'pin-input-container';
    
    const pinLabel = document.createElement('div');
    pinLabel.className = 'pin-label';
    pinLabel.textContent = 'Enter PIN';
    
    const pinInputWrapper = document.createElement('div');
    pinInputWrapper.className = 'pin-input-wrapper';
    
    // Create 6 PIN digit inputs
    const pinDigits = [];
    for (let i = 0; i < 6; i++) {
        const pinDigit = document.createElement('input');
        pinDigit.type = 'password';
        pinDigit.className = 'pin-digit';
        pinDigit.maxLength = 1;
        pinDigit.dataset.index = i;
        
        // Add input event listener
        pinDigit.addEventListener('input', function(e) {
            handlePinInput(e, pinDigits);
        });
        
        // Add keydown event listener for navigation
        pinDigit.addEventListener('keydown', function(e) {
            handlePinKeyDown(e, pinDigits);
        });
        
        pinDigits.push(pinDigit);
        pinInputWrapper.appendChild(pinDigit);
    }
    
    // Create login button
    const loginButton = document.createElement('button');
    loginButton.className = 'login-button';
    loginButton.textContent = 'Sign in';
    loginButton.disabled = true;
    
    // Create login message
    const loginMessage = document.createElement('div');
    loginMessage.className = 'login-message';
    
    // Create login footer
    const loginFooter = document.createElement('div');
    loginFooter.className = 'login-footer';
    loginFooter.innerHTML = `
        <div><i class="fas fa-shield-alt"></i> Secure Login System</div>
        <div style="margin-top: 5px; font-size: 12px;">Enter your 6-digit PIN to continue</div>
    `;
    
    // Create particles container
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.id = 'particlesContainer';
    
    // Create security notice
    const securityNotice = document.createElement('div');
    securityNotice.className = 'security-notice';
    securityNotice.textContent = 'SECURE CONNECTION • ENCRYPTED';
    
    // Assemble the login page
    pinInputContainer.appendChild(pinLabel);
    pinInputContainer.appendChild(pinInputWrapper);
    pinInputContainer.appendChild(loginMessage);
    
    loginWrapper.appendChild(userAvatar);
    loginWrapper.appendChild(userName);
    loginWrapper.appendChild(pinInputContainer);
    loginWrapper.appendChild(loginButton);
    
    loginContainer.appendChild(loginWrapper);
    loginContainer.appendChild(loginFooter);
    loginContainer.appendChild(particlesContainer);
    loginContainer.appendChild(securityNotice);
    
    root.appendChild(loginContainer);
    
    // Add event listener to the login button
    loginButton.addEventListener('click', function() {
        attemptLogin(pinDigits, loginButton, loginMessage);
    });
    
    // Auto-focus first PIN digit
    setTimeout(() => {
        pinDigits[0].focus();
    }, 100);
}

// Handle PIN input
function handlePinInput(e, pinDigits) {
    const input = e.target;
    const index = parseInt(input.dataset.index);
    
    // Only allow numbers
    if (!/^\d*$/.test(input.value)) {
        input.value = '';
        return;
    }
    
    // Move to next input if a digit was entered
    if (input.value !== '') {
        if (index < 5) {
            pinDigits[index + 1].focus();
        }
        
        // Add filled class for styling
        input.classList.add('filled');
    } else {
        // Remove filled class if empty
        input.classList.remove('filled');
    }
    
    // Check if all digits are filled
    const allFilled = pinDigits.every(digit => digit.value !== '');
    const loginButton = document.querySelector('.login-button');
    loginButton.disabled = !allFilled;
}

// Handle PIN keydown for navigation
function handlePinKeyDown(e, pinDigits) {
    const index = parseInt(e.target.dataset.index);
    
    // Handle backspace
    if (e.key === 'Backspace') {
        if (pinDigits[index].value === '' && index > 0) {
            // Move to previous input if current is empty
            pinDigits[index - 1].focus();
            pinDigits[index - 1].value = '';
            pinDigits[index - 1].classList.remove('filled');
        } else {
            // Clear current input
            pinDigits[index].value = '';
            pinDigits[index].classList.remove('filled');
        }
        
        // Disable login button
        const loginButton = document.querySelector('.login-button');
        loginButton.disabled = true;
    }
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
        pinDigits[index - 1].focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
        pinDigits[index + 1].focus();
    }
}

// Attempt login
function attemptLogin(pinDigits, loginButton, loginMessage) {
    // Get the entered PIN
    const enteredPin = pinDigits.map(digit => digit.value).join('');
    const correctPin = "032395";
    
    // Show loading on button
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    loginButton.disabled = true;
    
    // Simulate authentication delay
    setTimeout(() => {
        if (enteredPin === correctPin) {
            // Successful login
            loginMessage.textContent = 'Login successful! Redirecting...';
            loginMessage.style.color = '#4CAF50';
            loginMessage.classList.add('show');
            
            // Add success animation to PIN digits
            pinDigits.forEach(digit => {
                digit.style.borderColor = '#4CAF50';
                digit.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            });
            
            // Transition to desktop after delay
            setTimeout(() => {
                renderDesktop();
            }, 1000);
            
        } else {
            // Failed login
            loginMessage.textContent = 'Incorrect PIN. Please try again.';
            loginMessage.style.color = '#ff6b6b';
            loginMessage.classList.add('show');
            
            // Add error animation to PIN digits
            pinDigits.forEach(digit => {
                digit.style.borderColor = '#ff6b6b';
                digit.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                
                // Shake animation
                digit.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    digit.style.animation = '';
                }, 500);
            });
            
            // Reset button
            loginButton.textContent = 'Sign in';
            loginButton.disabled = false;
            
            // Clear PIN after a short delay
            setTimeout(() => {
                pinDigits.forEach((digit, index) => {
                    digit.value = '';
                    digit.classList.remove('filled');
                    digit.style.borderColor = '';
                    digit.style.backgroundColor = '';
                    
                    if (index === 0) {
                        digit.focus();
                    }
                });
                
                loginMessage.classList.remove('show');
            }, 1500);
        }
    }, 800);
}

// Render the desktop
function renderDesktop() {
    const root = document.getElementById('root');
    
    // Remove login container
    const loginContainer = document.getElementById('loginContainer');
    if (loginContainer) {
        loginContainer.style.opacity = '0';
        setTimeout(() => {
            root.removeChild(loginContainer);
        }, 500);
    }
    
    // Create desktop container
    const desktopContainer = document.createElement('div');
    desktopContainer.className = 'desktop-container';
    desktopContainer.id = 'desktopContainer';
    
    // Create desktop background
    const desktopBackground = document.createElement('div');
    desktopBackground.className = 'desktop-background';
    
    // Create desktop icons container
    const desktopIcons = document.createElement('div');
    desktopIcons.className = 'desktop-icons';
    
    // Create desktop icons
    const icons = [
        { icon: 'fas fa-folder', name: 'Documents', color: '#4CAF50' },
        { icon: 'fas fa-file-alt', name: 'secret.txt', color: '#FFC107' },
        { icon: 'fas fa-images', name: 'Pictures', color: '#2196F3' },
        { icon: 'fas fa-music', name: 'Music', color: '#9C27B0' },
        { icon: 'fas fa-film', name: 'Videos', color: '#F44336' },
        { icon: 'fas fa-cog', name: 'Settings', color: '#607D8B' }
    ];
    
    icons.forEach((iconData, index) => {
        const desktopIcon = document.createElement('div');
        desktopIcon.className = 'desktop-icon';
        desktopIcon.innerHTML = `
            <i class="${iconData.icon}" style="color: ${iconData.color};"></i>
            <div class="desktop-icon-text">${iconData.name}</div>
        `;
        
        // Add click event for the text file
        if (iconData.name === 'secret.txt') {
            desktopIcon.addEventListener('click', function() {
                showTextFileModal();
            });
        }
        
        desktopIcons.appendChild(desktopIcon);
    });
    
    // Create taskbar
    const taskbar = document.createElement('div');
    taskbar.className = 'taskbar';
    
    const startButton = document.createElement('button');
    startButton.className = 'start-button';
    startButton.innerHTML = '<i class="fab fa-windows"></i> Start';
    
    const taskbarTime = document.createElement('div');
    taskbarTime.className = 'taskbar-time';
    taskbarTime.id = 'taskbarTime';
    
    taskbar.appendChild(startButton);
    taskbar.appendChild(taskbarTime);
    
    // Create particles container for desktop
    const desktopParticles = document.createElement('div');
    desktopParticles.className = 'particles';
    desktopParticles.id = 'desktopParticles';
    
    // Assemble the desktop
    desktopContainer.appendChild(desktopBackground);
    desktopContainer.appendChild(desktopIcons);
    desktopContainer.appendChild(taskbar);
    desktopContainer.appendChild(desktopParticles);
    
    // Add desktop container with fade-in effect
    desktopContainer.style.opacity = '0';
    root.appendChild(desktopContainer);
    
    setTimeout(() => {
        desktopContainer.style.display = 'block';
        setTimeout(() => {
            desktopContainer.style.opacity = '1';
            createDesktopParticles();
        }, 10);
    }, 10);
}

// Show the text file modal
function showTextFileModal() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('div');
    modalTitle.className = 'modal-title';
    modalTitle.innerHTML = '<i class="fas fa-file-alt"></i> secret.txt';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', function() {
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modalOverlay);
        }, 300);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.textContent = 'Reach the podium, and continue your search';
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalOverlay.appendChild(modalContent);
    
    // Add to document
    document.body.appendChild(modalOverlay);
    
    // Activate modal with slight delay
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeButton.click();
        }
    });
}

// Create particles for login screen
function createParticles() {
    const particlesContainer = document.getElementById('particlesContainer');
    if (!particlesContainer) return;
    
    // Clear existing particles
    particlesContainer.innerHTML = '';
    
    // Create particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size and position
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        // Random animation
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.animation = `float ${duration}s ${delay}s infinite linear`;
        
        particlesContainer.appendChild(particle);
    }
    
    // Add CSS for floating animation if not already present
    if (!document.getElementById('particleStyles')) {
        const style = document.createElement('style');
        style.id = 'particleStyles';
        style.textContent = `
            @keyframes float {
                0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Create particles for desktop
function createDesktopParticles() {
    const desktopParticles = document.getElementById('desktopParticles');
    if (!desktopParticles) return;
    
    // Clear existing particles
    desktopParticles.innerHTML = '';
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size and position
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        
        // Random animation
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * 5;
        
        particle.style.animation = `float ${duration}s ${delay}s infinite linear`;
        
        desktopParticles.appendChild(particle);
    }
}

// Update time in taskbar
function updateTime() {
    const taskbarTime = document.getElementById('taskbarTime');
    if (!taskbarTime) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    
    taskbarTime.textContent = `${timeString} • ${dateString}`;
}
