// Add to Home Screen (A2HS) functionality for Titanic Shop
// This script handles PWA installation prompts and home screen addition

// Prevent duplicate declarations
if (typeof window.TitanicInstaller === 'undefined') {

class TitanicInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.isInstallable = false;
        this.isInstalled = false;
        
        this.init();
    }

    init() {
        // Check if app is already installed
        this.checkIfInstalled();
        
        // Create install button
        this.createInstallButton();
        
        // Listen for beforeinstallprompt event
        this.setupInstallPromptListener();
        
        // Listen for app installed event
        this.setupInstalledListener();
        
        // Check for iOS devices
        this.handleiOSInstallation();
        
        // Show install button after page loads
        window.addEventListener('load', () => {
            setTimeout(() => this.showInstallPrompt(), 2000);
        });
    }

    checkIfInstalled() {
        // Check if running in standalone mode (already installed)
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            this.isInstalled = true;
            return true;
        }
        
        // Check for installed PWA indicators
        if (document.referrer.includes('android-app://')) {
            this.isInstalled = true;
            return true;
        }
        
        return false;
    }

    createInstallButton() {
        // Create install button container
        const installContainer = document.createElement('div');
        installContainer.id = 'installContainer';
        installContainer.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            z-index: 999;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            pointer-events: none;
        `;

        // Create install button
        this.installButton = document.createElement('button');
        this.installButton.id = 'installButton';
        this.installButton.innerHTML = `
            <span style="margin-right: 8px;">📱</span>
            Install App
        `;
        this.installButton.style.cssText = `
            background: linear-gradient(135deg, #0056b3, #1e90ff);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 86, 179, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            white-space: nowrap;
        `;

        // Add hover effects
        this.installButton.addEventListener('mouseenter', () => {
            this.installButton.style.transform = 'translateY(-2px)';
            this.installButton.style.boxShadow = '0 6px 20px rgba(0, 86, 179, 0.4)';
        });

        this.installButton.addEventListener('mouseleave', () => {
            this.installButton.style.transform = 'translateY(0)';
            this.installButton.style.boxShadow = '0 4px 15px rgba(0, 86, 179, 0.3)';
        });

        // Add click handler
        this.installButton.addEventListener('click', () => this.handleInstallClick());

        installContainer.appendChild(this.installButton);
        document.body.appendChild(installContainer);
    }

    setupInstallPromptListener() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            this.isInstallable = true;
            
            // Show install button
            this.showInstallButton();
        });
    }

    setupInstalledListener() {
        window.addEventListener('appinstalled', (e) => {
            console.log('App was installed');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showToast('App installed successfully! 🎉', 'success');
            
            // Clear the deferredPrompt
            this.deferredPrompt = null;
        });
    }

    handleiOSInstallation() {
        // Check if device is iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isInStandaloneMode = window.navigator.standalone;

        if (isIOS && !isInStandaloneMode) {
            // Show iOS specific install instructions
            this.installButton.innerHTML = `
                <span style="margin-right: 8px;">📱</span>
                Add to Home
            `;
            
            this.installButton.addEventListener('click', () => {
                this.showiOSInstructions();
            });
            
            // Show the install button for iOS
            setTimeout(() => this.showInstallButton(), 3000);
        }
    }

    showiOSInstructions() {
        // Create iOS instruction modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 350px;
            text-align: center;
            position: relative;
        `;

        modalContent.innerHTML = `
            <h3 style="color: #0056b3; margin-bottom: 20px;">Add Titanic Shop to Home Screen</h3>
            <div style="margin-bottom: 20px;">
                <p style="margin-bottom: 15px;">1. Tap the Share button <span style="font-size: 18px;">⬆️</span> at the bottom of your screen</p>
                <p style="margin-bottom: 15px;">2. Scroll down and tap "Add to Home Screen" <span style="font-size: 18px;">➕</span></p>
                <p style="margin-bottom: 15px;">3. Tap "Add" in the top right corner</p>
            </div>
            <button id="closeiOSModal" style="
                background: #0056b3;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
            ">Got it!</button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Close modal handler
        document.getElementById('closeiOSModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    async handleInstallClick() {
        if (!this.deferredPrompt) {
            // If no deferred prompt, show manual instructions
            this.showManualInstructions();
            return;
        }

        // Hide the install button
        this.hideInstallButton();

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`User response to install prompt: ${outcome}`);

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            this.showToast('Installing app...', 'success');
        } else {
            console.log('User dismissed the install prompt');
            // Show install button again if user dismissed
            setTimeout(() => this.showInstallButton(), 3000);
        }

        // Clear the deferred prompt
        this.deferredPrompt = null;
    }

    showManualInstructions() {
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        const isEdge = /Edg/.test(navigator.userAgent);

        let instructions = '';
        
        if (isChrome) {
            instructions = `
                <p><strong>Chrome:</strong></p>
                <p>1. Click the three dots menu (⋮) in the top right</p>
                <p>2. Select "Install Titanic Shop..."</p>
                <p>3. Click "Install" in the popup</p>
            `;
        } else if (isFirefox) {
            instructions = `
                <p><strong>Firefox:</strong></p>
                <p>1. Click the three lines menu (≡) in the top right</p>
                <p>2. Select "Install this site as an app"</p>
                <p>3. Click "Install" in the popup</p>
            `;
        } else if (isEdge) {
            instructions = `
                <p><strong>Edge:</strong></p>
                <p>1. Click the three dots menu (⋯) in the top right</p>
                <p>2. Select "Apps" → "Install this site as an app"</p>
                <p>3. Click "Install" in the popup</p>
            `;
        } else {
            instructions = `
                <p>To install this app:</p>
                <p>1. Look for an install option in your browser menu</p>
                <p>2. Or bookmark this page for quick access</p>
            `;
        }

        this.showToast(instructions, 'info');
    }

    showInstallButton() {
        if (this.isInstalled) return;
        
        const container = document.getElementById('installContainer');
        if (container) {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
            container.style.pointerEvents = 'auto';
        }
    }

    hideInstallButton() {
        const container = document.getElementById('installContainer');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            container.style.pointerEvents = 'none';
        }
    }

    showInstallPrompt() {
        // Only show if not installed and installable
        if (!this.isInstalled && (this.isInstallable || /iPad|iPhone|iPod/.test(navigator.userAgent))) {
            this.showInstallButton();
        }
    }

    showToast(message, type = 'info') {
        // Use existing toast function if available, otherwise create our own
        if (typeof showToast === 'function') {
            showToast(message, type === 'info' ? 'success' : type);
            return;
        }

        // Create our own toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;
        
        toast.innerHTML = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.TitanicInstaller = new TitanicInstaller();
    });
} else {
    window.TitanicInstaller = new TitanicInstaller();
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TitanicInstaller;
}

} 
