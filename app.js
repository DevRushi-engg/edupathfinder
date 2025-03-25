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
