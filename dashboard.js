// Manages the dashboard functionality

document.addEventListener('DOMContentLoaded', async function() {
    // Make sure user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Get user preferences
    const preferencesKey = `preferences_${currentUser.email}`;
    const preferences = JSON.parse(localStorage.getItem(preferencesKey));
    
    if (!preferences) {
        // If no preferences found, redirect to onboarding
        window.location.href = 'onboarding.html';
        return;
    }
    
    // Display user preferences in profile section
    document.getElementById('user-interests').textContent = preferences.interests;
    document.getElementById('user-level').textContent = formatSkillLevel(preferences.skillLevel);
    document.getElementById('user-goal').textContent = formatLearningGoal(preferences.learningGoal);
    
    // Update preferences button
    document.getElementById('update-preferences').addEventListener('click', function() {
        window.location.href = 'onboarding.html';
    });
    
    // Get learning path from localStorage or generate new one
    const learningPathKey = `learning_path_${currentUser.email}`;
    let learningPath = JSON.parse(localStorage.getItem(learningPathKey));
    
    // Add refresh button functionality
    document.getElementById('refresh-recommendations-btn').addEventListener('click', async function() {
        try {
            if (!confirm("Refreshing recommendations will reset your progress. Continue?")) {
                return;
            }
            
            this.disabled = true;
            this.innerHTML = '<span class="spinner"></span> Generating...';
            document.getElementById('loading-recommendations').style.display = 'flex';
            
            // Clear existing learning path to force regeneration
            localStorage.removeItem(learningPathKey);
            
            // Generate new recommendations
            learningPath = await generateRecommendations(preferences);
            localStorage.setItem(learningPathKey, JSON.stringify(learningPath));
            
            // Display new learning path
            displayLearningPath(learningPath);
            
            // Update progress statistics
            updateProgressStats(learningPath);
            
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
            alert('Failed to refresh recommendations. Please try again later.');
        } finally {
            this.disabled = false;
            this.innerHTML = 'Refresh Recommendations';
            document.getElementById('loading-recommendations').style.display = 'none';
        }
    });
    
    if (!learningPath) {
        // Generate recommendations if none exist
        try {
            document.getElementById('loading-recommendations').style.display = 'flex';
            learningPath = await generateRecommendations(preferences);
            localStorage.setItem(learningPathKey, JSON.stringify(learningPath));
        } catch (error) {
            console.error('Error generating recommendations:', error);
            document.getElementById('no-recommendations').style.display = 'block';
            return;
        } finally {
            document.getElementById('loading-recommendations').style.display = 'none';
        }
    }
    
    // Display learning path
    displayLearningPath(learningPath);
    
    // Update progress statistics
    updateProgressStats(learningPath);

    // Initialize the API key dropdown functionality
    initApiKeyUI();
    
    // Initialize API key help functionality
    initApiKeyHelp();
});

function formatSkillLevel(level) {
    switch(level) {
        case 'beginner': return 'Beginner';
        case 'intermediate': return 'Intermediate';
        case 'advanced': return 'Advanced';
        case 'expert': return 'Expert';
        default: return level;
    }
}

function formatLearningGoal(goal) {
    switch(goal) {
        case 'career': return 'Career advancement';
        case 'academic': return 'Academic achievement';
        case 'hobby': return 'Personal interest/hobby';
        case 'specific-skill': return 'Learn a specific skill';
        default: return goal;
    }
}

function displayLearningPath(learningPath) {
    const container = document.getElementById('learning-path-container');
    container.innerHTML = ''; // Clear existing content
    
    if (!learningPath || learningPath.length === 0) {
        document.getElementById('no-recommendations').style.display = 'block';
        return;
    }
    
    // Create HTML for each learning resource
    learningPath.forEach(resource => {
        const resourceElement = document.createElement('div');
        resourceElement.className = 'learning-path-item';
        resourceElement.dataset.id = resource.id;
        
        if (resource.completed) {
            resourceElement.classList.add('completed');
        }
        
        // Add verification classes based on resource confidence
        if (resource.resourceConfidence === 'high') {
            resourceElement.classList.add('verified-resource');
        } else if (resource.resourceConfidence === 'medium') {
            resourceElement.classList.add('likely-resource');
        } else {
            resourceElement.classList.add('unverified-resource');
        }
        
        // Add responsive classes for better mobile layout
        resourceElement.classList.add('responsive-item');
        
        // Create reliability badge
        let reliabilityBadge = '';
        if (resource.resourceConfidence === 'high') {
            reliabilityBadge = `<span class="reliability-badge high" title="${resource.verificationNote || 'Highly reliable resource'}">
                <i class="fas fa-check-circle"></i> Verified
            </span>`;
        } else if (resource.resourceConfidence === 'medium') {
            reliabilityBadge = `<span class="reliability-badge medium" title="${resource.verificationNote || 'Moderately reliable resource'}">
                <i class="fas fa-shield-alt"></i> Likely Available
            </span>`;
        } else {
            reliabilityBadge = `<span class="reliability-badge low" title="${resource.verificationNote || 'Reliability unknown'}">
                <i class="fas fa-question-circle"></i> Unverified
            </span>`;
        }
        
        // Platform badge
        const platformBadge = resource.platform ? 
            `<span class="platform-badge">${resource.platform}</span>` : '';
        
        resourceElement.innerHTML = `
            <div class="item-header">
                <div class="item-title">${resource.title}</div>
                <div class="item-type">${resource.type}</div>
            </div>
            <div class="item-description">${resource.description}</div>
            <div class="item-details">
                <span class="item-time">Estimated time: ${resource.estimatedTime}</span>
                <div class="item-badges">
                    ${platformBadge}
                    ${reliabilityBadge}
                </div>
                <a href="${resource.link}" class="item-link" target="_blank" rel="noopener noreferrer">View Resource</a>
            </div>
            <div class="completion-toggle">
                <input type="checkbox" id="complete_${resource.id}" ${resource.completed ? 'checked' : ''}>
                <label for="complete_${resource.id}">Mark as completed</label>
            </div>
        `;
        
        container.appendChild(resourceElement);
        
        // Add event listener for completion toggle
        const checkbox = resourceElement.querySelector(`#complete_${resource.id}`);
        checkbox.addEventListener('change', function() {
            toggleResourceCompletion(resource.id, this.checked);
        });
    });
}

function toggleResourceCompletion(resourceId, isCompleted) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const learningPathKey = `learning_path_${currentUser.email}`;
    const learningPath = JSON.parse(localStorage.getItem(learningPathKey));
    
    // Update the completion status
    const updatedLearningPath = learningPath.map(resource => {
        if (resource.id === resourceId) {
            return { ...resource, completed: isCompleted };
        }
        return resource;
    });
    
    // Save updated learning path
    localStorage.setItem(learningPathKey, JSON.stringify(updatedLearningPath));
    
    // Update progress statistics
    updateProgressStats(updatedLearningPath);
}

function updateProgressStats(learningPath) {
    if (!learningPath || learningPath.length === 0) return;
    
    const totalResources = learningPath.length;
    const completedResources = learningPath.filter(resource => resource.completed).length;
    const completionPercentage = Math.round((completedResources / totalResources) * 100);
    
    // Update UI elements
    document.getElementById('completed-count').textContent = completedResources;
    document.getElementById('overall-progress').style.width = `${completionPercentage}%`;
    document.getElementById('progress-percentage').textContent = `${completionPercentage}%`;
}

// Add reset progress functionality
document.getElementById('reset-progress-btn').addEventListener('click', function() {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const learningPathKey = `learning_path_${currentUser.email}`;
        const learningPath = JSON.parse(localStorage.getItem(learningPathKey));
        
        // Reset completion status for all resources
        const resetLearningPath = learningPath.map(resource => ({
            ...resource,
            completed: false
        }));
        
        // Save reset learning path
        localStorage.setItem(learningPathKey, JSON.stringify(resetLearningPath));
        
        // Update UI
        displayLearningPath(resetLearningPath);
        updateProgressStats(resetLearningPath);
        
        alert('Progress has been reset successfully.');
    }
});

// Add search and filter functionality
const searchInput = document.getElementById('resource-search');
const resourceFilter = document.getElementById('resource-filter');
const typeFilter = document.getElementById('type-filter');

// Apply filters when inputs change
searchInput.addEventListener('input', applyFilters);
resourceFilter.addEventListener('change', applyFilters);
typeFilter.addEventListener('change', applyFilters);

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const completionFilter = resourceFilter.value;
    const typeFilterValue = typeFilter.value;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const learningPathKey = `learning_path_${currentUser.email}`;
    const learningPath = JSON.parse(localStorage.getItem(learningPathKey));
    
    if (!learningPath) return;
    
    // Filter the resources
    const filteredResources = learningPath.filter(resource => {
        // Check search term
        const matchesSearch = searchTerm === '' || 
            resource.title.toLowerCase().includes(searchTerm) || 
            resource.description.toLowerCase().includes(searchTerm);
        
        // Check completion status
        const matchesCompletion = completionFilter === 'all' || 
            (completionFilter === 'completed' && resource.completed) || 
            (completionFilter === 'pending' && !resource.completed);
        
        // Check resource type
        const matchesType = typeFilterValue === 'all' || 
            resource.type === typeFilterValue;
        
        return matchesSearch && matchesCompletion && matchesType;
    });
    
    // Display filtered resources
    displayFilteredLearningPath(filteredResources);
}

function displayFilteredLearningPath(filteredResources) {
    const container = document.getElementById('learning-path-container');
    container.innerHTML = ''; // Clear existing content
    
    if (filteredResources.length === 0) {
        container.innerHTML = '<p>No resources match your filters. Try adjusting your search criteria.</p>';
        return;
    }
    
    // Create HTML for each filtered resource
    filteredResources.forEach(resource => {
        const resourceElement = document.createElement('div');
        resourceElement.className = 'learning-path-item';
        resourceElement.dataset.id = resource.id;
        
        if (resource.completed) {
            resourceElement.classList.add('completed');
        }
        
        resourceElement.innerHTML = `
            <div class="item-header">
                <div class="item-title">${resource.title}</div>
                <div class="item-type">${resource.type}</div>
            </div>
            <div class="item-description">${resource.description}</div>
            <div class="item-details">
                <span class="item-time">Estimated time: ${resource.estimatedTime}</span>
                <a href="${resource.link}" class="item-link" target="_blank">View Resource</a>
            </div>
            <div class="completion-toggle">
                <input type="checkbox" id="complete_${resource.id}" ${resource.completed ? 'checked' : ''}>
                <label for="complete_${resource.id}">Mark as completed</label>
            </div>
        `;
        
        container.appendChild(resourceElement);
        
        // Add event listener for completion toggle
        const checkbox = resourceElement.querySelector(`#complete_${resource.id}`);
        checkbox.addEventListener('change', function() {
            toggleResourceCompletion(resource.id, this.checked);
        });
    });
}

// Add this function to initialize API key UI
function initApiKeyUI() {
    // Check if API key exists and update UI accordingly
    const apiKey = localStorage.getItem('groq_api_key');
    const apiKeyBtn = document.getElementById('api-key-btn');
    
    if (apiKey && apiKeyBtn) {
        // Add an indicator that the API key is set
        apiKeyBtn.innerHTML = '<i class="fas fa-key"></i> API Key <span class="api-key-status">✓</span>';
        apiKeyBtn.classList.add('api-key-set');
    }
}

// Add this function to initialize API key help functionality
function initApiKeyHelp() {
    const helpBtn = document.getElementById('api-key-help-btn');
    const helpModal = document.getElementById('api-key-help-modal');
    const closeBtn = helpModal.querySelector('.close');
    const gotItBtn = document.getElementById('close-help-modal');
    
    // Show help modal when clicking the help button
    helpBtn.addEventListener('click', function(e) {
        e.preventDefault();
        helpModal.style.display = 'block';
    });
    
    // Close help modal when clicking the close button
    closeBtn.addEventListener('click', function() {
        helpModal.style.display = 'none';
    });
    
    // Close help modal when clicking the "Got It!" button
    gotItBtn.addEventListener('click', function() {
        helpModal.style.display = 'none';
    });
    
    // Close help modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
}
