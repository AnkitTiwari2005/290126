// script.js - UPDATED WITH SUPABASE DATABASE INTEGRATION

// ============================================
// SECURITY CONFIGURATION - REPLACE THESE VALUES
// ============================================
// Get these from your Supabase project settings → API
const SUPABASE_URL = 'https://ytzbijjmyplvyydawpxk.supabase.co'; // Replace with your URL
const SUPABASE_ANON_KEY = 'sb_publishable_1Z0wvjzbmGurMCR1bVZP5g_dIFnJyru'; // Replace with your key
// ============================================

// Security variables
let loginAttempts = 0;
const MAX_ATTEMPTS = 5;
let securityTimeout = false;
let supabaseClient = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test database connection
    testDatabaseConnection().then(success => {
        if (success) {
            setTimeout(() => {
                document.getElementById('security-overlay').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('security-overlay').style.display = 'none';
                    renderLoginPage();
                    createParticles();
                    updateTime();
                    setInterval(updateTime, 1000);
                }, 500);
            }, 1000);
        } else {
            showSecurityAlert('Database connection failed. Please check configuration.');
        }
    });
});

// Test database connection
async function testDatabaseConnection() {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('username')
            .limit(1);
        
        if (error) {
            console.error('Database connection error:', error);
            return false;
        }
        
        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Connection test failed:', error);
        return false;
    }
}

// Hash function for PIN (simple example - in production use stronger hashing)
async function hashPIN(pin) {
    // Simple hash for demonstration
    // In production, use: await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify PIN against database
async function verifyPIN(pin) {
    try {
        // Hash the entered PIN
        const hashedPin = await hashPIN(pin);
        
        // Query database for user with matching PIN
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('username', 'Elias Virex')
            .eq('pin_hash', hashedPin);
        
        if (error) {
            console.error('Database query error:', error);
            return false;
        }
        
        return data && data.length > 0;
    } catch (error) {
        console.error('PIN verification error:', error);
        return false;
    }
}

// Security alert system
function showSecurityAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'security-alert';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <h1>SECURITY ALERT</h1>
        <p>${message}</p>
        <p style="font-size: 16px; margin-top: 20px; color: #aaa;">
            System has been locked for security reasons.<br>
            Please contact system administrator.
        </p>
    `;
    document.body.appendChild(alertDiv);
    alertDiv.style.display = 'flex';
    
    // Lock all inputs
    document.querySelectorAll('input, button').forEach(el => {
        el.disabled = true;
    });
}

// Render the login page
function renderLoginPage() {
    const root = document.getElementById('root');
    
    // Check if security lock is active
    if (securityTimeout) {
        showSecurityAlert('Too many failed login attempts. System locked for 30 minutes.');
        return;
    }
    
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
    pinLabel.textContent = 'Enter 6-digit PIN';
    
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
        pinDigit.inputMode = 'numeric';
        pinDigit.pattern = '[0-9]*';
        
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
    loginMessage.id = 'loginMessage';
    
    // Create attempts counter
    const attemptsCounter = document.createElement('div');
    attemptsCounter.className = 'pin-label';
    attemptsCounter.style.marginTop = '10px';
    attemptsCounter.style.fontSize = '12px';
    attemptsCounter.style.color = 'rgba(255, 255, 255, 0.5)';
    attemptsCounter.id = 'attemptsCounter';
    attemptsCounter.textContent = `Attempts remaining: ${MAX_ATTEMPTS - loginAttempts}`;
    
    // Create login footer
    const loginFooter = document.createElement('div');
    loginFooter.className = 'login-footer';
    loginFooter.innerHTML = `
        <div><i class="fas fa-shield-alt"></i> Secure Database Authentication</div>
        <div style="margin-top: 5px; font-size: 12px;">PIN is securely stored in encrypted database</div>
    `;
    
    // Create particles container
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.id = 'particlesContainer';
    
    // Assemble the login page
    pinInputContainer.appendChild(pinLabel);
    pinInputContainer.appendChild(pinInputWrapper);
    pinInputContainer.appendChild(loginMessage);
    pinInputContainer.appendChild(attemptsCounter);
    
    loginWrapper.appendChild(userAvatar);
    loginWrapper.appendChild(userName);
    loginWrapper.appendChild(pinInputContainer);
    loginWrapper.appendChild(loginButton);
    
    loginContainer.appendChild(loginWrapper);
    loginContainer.appendChild(loginFooter);
    loginContainer.appendChild(particlesContainer);
    
    root.appendChild(loginContainer);
    
    // Add event listener to the login button
    loginButton.addEventListener('click', async function() {
        await attemptLogin(pinDigits, loginButton, loginMessage, attemptsCounter);
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
    input.value = input.value.replace(/[^0-9]/g, '');
    
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
    
    // Auto-submit if last digit filled
    if (allFilled && index === 5) {
        setTimeout(() => {
            loginButton.click();
        }, 100);
    }
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

// Attempt login with database verification
async function attemptLogin(pinDigits, loginButton, loginMessage, attemptsCounter) {
    // Get the entered PIN
    const enteredPin = pinDigits.map(digit => digit.value).join('');
    
    // Validate PIN format
    if (enteredPin.length !== 6 || !/^\d+$/.test(enteredPin)) {
        loginMessage.textContent = 'Please enter a valid 6-digit PIN';
        loginMessage.style.color = '#ff6b6b';
        loginMessage.classList.add('show');
        return;
    }
    
    // Check security attempts
    if (loginAttempts >= MAX_ATTEMPTS) {
        securityTimeout = true;
        showSecurityAlert('Maximum login attempts exceeded.');
        return;
    }
    
    // Show loading on button
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    loginButton.disabled = true;
    
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Verify PIN against database
    const isValid = await verifyPIN(enteredPin);
    
    if (isValid) {
        // Successful login
        loginAttempts = 0; // Reset attempts on success
        loginMessage.textContent = '✓ PIN verified successfully';
        loginMessage.style.color = '#4CAF50';
        loginMessage.classList.add('show');
        
        // Add success animation to PIN digits
        pinDigits.forEach(digit => {
            digit.style.borderColor = '#4CAF50';
            digit.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        });
        
        // Update attempts counter
        if (attemptsCounter) {
            attemptsCounter.textContent = `Attempts remaining: ${MAX_ATTEMPTS - loginAttempts}`;
        }
        
        // Transition to desktop after delay
        setTimeout(() => {
            renderDesktop();
        }, 1000);
        
    } else {
        // Failed login
        loginAttempts++;
        
        // Update attempts counter
        if (attemptsCounter) {
            attemptsCounter.textContent = `Attempts remaining: ${MAX_ATTEMPTS - loginAttempts}`;
            
            if (MAX_ATTEMPTS - loginAttempts <= 2) {
                attemptsCounter.style.color = '#ff6b6b';
            }
        }
        
        loginMessage.textContent = `Incorrect PIN. ${MAX_ATTEMPTS - loginAttempts} attempts remaining.`;
        loginMessage.style.color = '#ff6b6b';
        loginMessage.classList.add('show');
        
        // Add error animation to PIN digits
        pinDigits.forEach(digit => {
            digit.style.borderColor = '#ff6b6b';
            digit.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
            
            // Shake animation
            digit.style.animation = 'securityShake 0.5s';
            setTimeout(() => {
                digit.style.animation = '';
            }, 500);
        });
        
        // Reset button
        loginButton.textContent = 'Sign in';
        loginButton.disabled = false;
        
        // Check if max attempts reached
        if (loginAttempts >= MAX_ATTEMPTS) {
            securityTimeout = true;
            setTimeout(() => {
                showSecurityAlert('Maximum login attempts exceeded. System locked.');
            }, 1000);
            return;
        }
        
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
        { icon: 'fas fa-cog', name: 'Settings', color: '#607D8B' },
        { icon: 'fas fa-database', name: 'Database', color: '#00BCD4' }
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
    
    // Create security status
    const securityStatus = document.createElement('div');
    securityStatus.className = 'security-notice';
    securityStatus.innerHTML = '<i class="fas fa-lock"></i> Database Secured';
    securityStatus.style.left = '10px';
    securityStatus.style.right = 'auto';
    
    // Assemble the desktop
    desktopContainer.appendChild(desktopBackground);
    desktopContainer.appendChild(desktopIcons);
    desktopContainer.appendChild(taskbar);
    desktopContainer.appendChild(securityStatus);
    
    // Add desktop container with fade-in effect
    desktopContainer.style.opacity = '0';
    root.appendChild(desktopContainer);
    
    setTimeout(() => {
        desktopContainer.style.display = 'block';
        setTimeout(() => {
            desktopContainer.style.opacity = '1';
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
    modalTitle.innerHTML = '<i class="fas fa-file-alt"></i> secret.txt - Protected Document';
    
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
    modalBody.innerHTML = `
        <div style="text-align: center;">
            <i class="fas fa-lock" style="font-size: 24px; color: #FFC107; margin-bottom: 15px;"></i>
            <p style="font-size: 20px; margin-bottom: 20px;">Reach the podium, and continue your search</p>
            <p style="font-size: 14px; color: #888; margin-top: 20px;">
                <i class="fas fa-info-circle"></i> This message was securely retrieved from the database
            </p>
        </div>
    `;
    
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
        `;
        document.head.appendChild(style);
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
