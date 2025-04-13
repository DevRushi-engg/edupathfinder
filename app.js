// Main application functionality

document.addEventListener('DOMContentLoaded', function() {
    // This file handles any global application functionality
    
    // Check if browser supports localStorage
    if (!storageAvailable('localStorage')) {
        alert('Your browser does not support local storage. Some features of this application may not work correctly.');
    }
    
    // Dynamic footer year update
    const footerYear = document.querySelector('footer .container p');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = footerYear.innerHTML.replace('2023', currentYear);
    }

    // Handle CTA buttons
    const ctaGetStartedBtn = document.getElementById('cta-get-started-btn');
    if (ctaGetStartedBtn) {
        ctaGetStartedBtn.addEventListener('click', function() {
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                // User is logged in
                const user = JSON.parse(currentUser);
                const userPreferences = localStorage.getItem(`preferences_${user.email}`);
                
                if (userPreferences) {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'onboarding.html';
                }
            } else {
                // User is not logged in, open login modal
                openAuthModal('login');
            }
        });
    }

    // Add mobile navigation toggle
    const header = document.querySelector('header');
    if (header) {
        const nav = header.querySelector('nav');
        
        // Create mobile menu toggle button if it doesn't exist
        if (!document.querySelector('.mobile-nav-toggle')) {
            const mobileToggle = document.createElement('button');
            mobileToggle.className = 'mobile-nav-toggle';
            mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            mobileToggle.setAttribute('aria-label', 'Toggle menu');
            nav.insertBefore(mobileToggle, nav.firstChild.nextSibling);
            
            // Event listener for mobile toggle
            mobileToggle.addEventListener('click', function() {
                const authSection = document.getElementById('auth-section');
                const userSection = document.getElementById('user-section');
                
                if (authSection) {
                    authSection.classList.toggle('active');
                    mobileToggle.innerHTML = authSection.classList.contains('active') ? 
                        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
                }
                
                if (userSection) {
                    userSection.classList.toggle('active');
                    mobileToggle.innerHTML = userSection.classList.contains('active') ? 
                        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
                }
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', function(event) {
                const authSection = document.getElementById('auth-section');
                const userSection = document.getElementById('user-section');
                
                if (!nav.contains(event.target)) {
                    if (authSection && authSection.classList.contains('active')) {
                        authSection.classList.remove('active');
                        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                    
                    if (userSection && userSection.classList.contains('active')) {
                        userSection.classList.remove('active');
                        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
            });
        }
    }
});

// Utility function to check localStorage availability
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch(e) {
        return false;
    }
}

// Add viewport height fix for mobile browsers
function setMobileViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set the height on first load
setMobileViewportHeight();

// Reset the height on resize
window.addEventListener('resize', setMobileViewportHeight);
