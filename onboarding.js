// Handles the onboarding process and user preferences

document.addEventListener('DOMContentLoaded', function() {
    // Make sure user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Handle form submission
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect user preferences
            const interests = document.getElementById('interests').value;
            const skillLevel = document.getElementById('skill-level').value;
            const learningGoal = document.getElementById('learning-goal').value;
            const timeCommitment = document.getElementById('time-commitment').value;
            
            // Get selected resource types
            const resourceTypes = [];
            document.querySelectorAll('input[name="resource-type"]:checked').forEach(checkbox => {
                resourceTypes.push(checkbox.value);
            });
            
            // Validate at least one resource type is selected
            if (resourceTypes.length === 0) {
                alert('Please select at least one type of learning resource you prefer.');
                return;
            }
            
            // Create preferences object
            const preferences = {
                interests,
                skillLevel,
                learningGoal,
                timeCommitment,
                resourceTypes,
                lastUpdated: new Date().toISOString()
            };
            
            // Save preferences to localStorage
            localStorage.setItem(`preferences_${currentUser.email}`, JSON.stringify(preferences));
            
            // Clear existing learning path to force regeneration
            localStorage.removeItem(`learning_path_${currentUser.email}`);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        });
    }
    
    // Check if user already has preferences (for updating scenario)
    const existingPreferences = localStorage.getItem(`preferences_${currentUser.email}`);
    if (existingPreferences) {
        const preferences = JSON.parse(existingPreferences);
        
        // Pre-fill form with existing preferences
        document.getElementById('interests').value = preferences.interests || '';
        document.getElementById('skill-level').value = preferences.skillLevel || '';
        document.getElementById('learning-goal').value = preferences.learningGoal || '';
        document.getElementById('time-commitment').value = preferences.timeCommitment || '';
        
        // Check appropriate resource type checkboxes
        if (preferences.resourceTypes && preferences.resourceTypes.length > 0) {
            preferences.resourceTypes.forEach(type => {
                const checkbox = document.querySelector(`input[name="resource-type"][value="${type}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }
});
