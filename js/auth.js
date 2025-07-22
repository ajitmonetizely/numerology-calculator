// Authentication Management Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.backendUrl = 'https://numerology-backend-87645a83ad1c.herokuapp.com';
        this.init();
    }

    /**
     * Initialize authentication system
     */
    async init() {
        await this.checkAuthStatus();
        this.setupEventListeners();
        this.handleUrlParams();
    }

    /**
     * Check if user is currently authenticated
     */
    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/me`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.updateUI();
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.updateUI();
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
            this.currentUser = null;
            this.isAuthenticated = false;
            this.updateUI();
        }
    }

    /**
     * Handle URL parameters for OAuth callbacks
     */
    handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const loginStatus = urlParams.get('login');
        
        if (loginStatus === 'success') {
            this.showMessage('Successfully logged in with Google!', 'success');
            // Remove URL parameters and refresh auth status
            window.history.replaceState({}, document.title, window.location.pathname);
            this.checkAuthStatus();
        } else if (loginStatus === 'error') {
            this.showMessage('Google login failed. Please try again.', 'error');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    /**
     * Setup event listeners for auth UI
     */
    setupEventListeners() {
        // Login form
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin(e.target);
            }
        });

        // Register form
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'registerForm') {
                e.preventDefault();
                this.handleRegister(e.target);
            }
        });

        // Auth modal controls
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-auth-action]')) {
                const action = e.target.getAttribute('data-auth-action');
                this.handleAuthAction(action);
            }
        });
    }

    /**
     * Handle various auth actions
     */
    handleAuthAction(action) {
        switch (action) {
            case 'show-login':
                this.showAuthModal('login');
                break;
            case 'show-register':
                this.showAuthModal('register');
                break;
            case 'close-modal':
                this.closeAuthModal();
                break;
            case 'logout':
                this.handleLogout();
                break;
            case 'google-login':
                this.handleGoogleLogin();
                break;
        }
    }

    /**
     * Handle user login
     */
    async handleLogin(form) {
        const formData = new FormData(form);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';

            const response = await fetch(`${this.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.updateUI();
                this.closeAuthModal();
                this.showMessage(`Welcome back, ${data.user.display_name}!`, 'success');
            } else {
                this.showMessage(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Login failed. Please try again.', 'error');
        } finally {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Log In';
        }
    }

    /**
     * Handle user registration
     */
    async handleRegister(form) {
        const formData = new FormData(form);
        const registerData = {
            email: formData.get('email'),
            password: formData.get('password'),
            display_name: formData.get('display_name')
        };

        // Basic validation
        if (registerData.password !== formData.get('confirm_password')) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        try {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';

            const response = await fetch(`${this.backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.updateUI();
                this.closeAuthModal();
                this.showMessage(`Welcome, ${data.user.display_name}!`, 'success');
            } else {
                this.showMessage(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('Registration failed. Please try again.', 'error');
        } finally {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        }
    }

    /**
     * Handle user logout
     */
    async handleLogout() {
        try {
            await fetch(`${this.backendUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            this.currentUser = null;
            this.isAuthenticated = false;
            this.updateUI();
            this.showMessage('Successfully logged out', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('Logout failed', 'error');
        }
    }

    /**
     * Handle Google OAuth login
     */
    handleGoogleLogin() {
        window.location.href = `${this.backendUrl}/api/auth/google`;
    }

    /**
     * Show authentication modal
     */
    showAuthModal(mode = 'login') {
        const modal = document.getElementById('authModal');
        const loginForm = document.getElementById('loginContainer');
        const registerForm = document.getElementById('registerContainer');

        if (mode === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close authentication modal
     */
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Clear forms
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
    }

    /**
     * Update UI based on authentication status
     */
    updateUI() {
        const authButton = document.getElementById('authButton');
        const userInfo = document.getElementById('userInfo');

        if (this.isAuthenticated && this.currentUser) {
            // Show authenticated state
            authButton.style.display = 'none';
            userInfo.style.display = 'flex';
            userInfo.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="text-right">
                        <div class="font-medium text-gray-800">${this.currentUser.display_name}</div>
                        <div class="text-sm text-gray-600">${this.currentUser.email}</div>
                    </div>
                    <button data-auth-action="logout" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        Logout
                    </button>
                </div>
            `;
            
            // Show family management controls
            if (window.familyManager) {
                window.familyManager.updateFamilyManagementUI();
            }
        } else {
            // Show unauthenticated state
            authButton.style.display = 'block';
            userInfo.style.display = 'none';
            
            // Hide family management controls
            if (window.familyManager) {
                window.familyManager.updateFamilyManagementUI();
            }
        }
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        messageEl.className += ` ${colors[type] || colors.info}`;
        messageEl.textContent = message;

        document.body.appendChild(messageEl);

        // Animate in
        setTimeout(() => {
            messageEl.classList.remove('translate-x-full');
        }, 100);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageEl.classList.add('translate-x-full');
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 5000);
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    getIsAuthenticated() {
        return this.isAuthenticated;
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();