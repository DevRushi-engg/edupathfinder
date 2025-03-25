// Simple authentication system using localStorage

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        // User is logged in
        const user = JSON.parse(currentUser);
        
        // Update UI for logged in state
        if (document.getElementById('auth-section')) {
            document.getElementById('auth-section').style.display = 'none';
        }
        
        if (document.getElementById('user-section')) {
            document.getElementById('user-section').style.display = 'flex';
            document.getElementById('username-display').textContent = user.name;
        }
        
        // If on index page and user is logged in, they should have preferences
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            const userPreferences = localStorage.getItem(`preferences_${user.email}`);
            
            // If user is logged in but has no preferences, redirect to onboarding
            if (!userPreferences) {
                document.getElementById('get-started-btn').addEventListener('click', function() {
                    window.location.href = 'onboarding.html';
                });
            } else {
                // If user has preferences, redirect to dashboard
                document.getElementById('get-started-btn').addEventListener('click', function() {
                    window.location.href = 'dashboard.html';
                });
            }
        }
    } else {
        // User is not logged in
        if (document.getElementById('auth-section')) {
            document.getElementById('auth-section').style.display = 'flex';
        }
        
        if (document.getElementById('user-section')) {
            document.getElementById('user-section').style.display = 'none';
        }
        
        // If on restricted page and user is not logged in, redirect to home
        if (window.location.pathname.includes('dashboard.html') || 
            window.location.pathname.includes('onboarding.html')) {
            window.location.href = 'index.html';
        }
        
        // On index page, get started should open login modal
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            document.getElementById('get-started-btn').addEventListener('click', function() {
                openAuthModal('login');
            });
        }
    }
}

// Auth modal functionality
if (document.getElementById('login-btn')) {
    document.getElementById('login-btn').addEventListener('click', function() {
        openAuthModal('login');
    });
}

if (document.getElementById('register-btn')) {
    document.getElementById('register-btn').addEventListener('click', function() {
        openAuthModal('register');
    });
}

function openAuthModal(type) {
    const modal = document.getElementById('auth-modal');
    modal.style.display = 'block';
    
    if (type === 'login') {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    } else {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    }
    
    document.querySelectorAll('.close').forEach(element => {
        element.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Switch between login and register forms
if (document.getElementById('show-register')) {
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });
}

if (document.getElementById('show-login')) {
    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    });
}

// Handle form submissions
if (document.getElementById('login-form-element')) {
    document.getElementById('login-form-element').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Check if user exists
        const user = JSON.parse(localStorage.getItem(`user_${email}`));
        
        if (user && user.password === password) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            document.getElementById('auth-modal').style.display = 'none';
            
            // Check if user has preferences
            const userPreferences = localStorage.getItem(`preferences_${email}`);
            
            if (userPreferences) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'onboarding.html';
            }
        } else {
            alert('Invalid email or password.');
        }
    });
}

if (document.getElementById('register-form-element')) {
    document.getElementById('register-form-element').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        // Check if user already exists
        const existingUser = localStorage.getItem(`user_${email}`);
        
        if (existingUser) {
            alert('User with this email already exists.');
            return;
        }
        
        // Create new user
        const user = {
            name,
            email,
            password
        };
        
        localStorage.setItem(`user_${email}`, JSON.stringify(user));
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        document.getElementById('auth-modal').style.display = 'none';
        window.location.href = 'onboarding.html';
    });
}

// Logout functionality
if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}
