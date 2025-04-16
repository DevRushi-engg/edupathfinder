// API Integration for generating personalized recommendations using Groq AI

// Groq API configuration
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'gemma2-9b-it'; // Here we can change models for different use cases

// For demo purposes, storing store api key in localStorage
let GROQ_API_KEY = localStorage.getItem('groq_api_key');

// List of reliable educational platforms for resource validation
const RELIABLE_PLATFORMS = [
  { domain: 'coursera.org', name: 'Coursera', confidence: 'high' },
  { domain: 'udemy.com', name: 'Udemy', confidence: 'high' },
  { domain: 'edx.org', name: 'edX', confidence: 'high' },
  { domain: 'khanacademy.org', name: 'Khan Academy', confidence: 'high' },
  { domain: 'freecodecamp.org', name: 'freeCodeCamp', confidence: 'high' },
  { domain: 'codecademy.com', name: 'Codecademy', confidence: 'high' },
  { domain: 'w3schools.com', name: 'W3Schools', confidence: 'high' },
  { domain: 'udacity.com', name: 'Udacity', confidence: 'high' },
  { domain: 'pluralsight.com', name: 'Pluralsight', confidence: 'high' },
  { domain: 'linkedin.com/learning', name: 'LinkedIn Learning', confidence: 'high' },
  { domain: 'skillshare.com', name: 'Skillshare', confidence: 'medium' },
  { domain: 'datacamp.com', name: 'DataCamp', confidence: 'high' },
  { domain: 'youtube.com', name: 'YouTube', confidence: 'medium' },
  { domain: 'github.com', name: 'GitHub', confidence: 'medium' },
  { domain: 'stackoverflow.com', name: 'Stack Overflow', confidence: 'medium' },
  { domain: 'mit.edu', name: 'MIT OpenCourseWare', confidence: 'high' },
  { domain: 'microsoft.com/learn', name: 'Microsoft Learn', confidence: 'high' },
  { domain: 'developer.mozilla.org', name: 'MDN Web Docs', confidence: 'high' }
];

async function generateRecommendations(preferences) {
    // Show loading state
    if (document.getElementById('loading-recommendations')) {
        document.getElementById('loading-recommendations').style.display = 'flex';
    }
    
    try {
        // Check if API key is set
        if (!GROQ_API_KEY) {
            // Show API key dropdown if not set
            showApiKeyDropdown();
            throw new Error('Please enter your Groq API key to generate recommendations');
        }

        // Create enhanced prompt for the AI
        const prompt = createEnhancedPromptFromPreferences(preferences);
        
        // Call Groq API
        const response = await callGroqAPI(prompt);
        
        // Parse learning path from response
        let learningPath = parseLearningPathFromResponse(response, preferences);
        
        // Validate and enhance the learning resources
        learningPath = validateAndEnhanceResources(learningPath);
        
        return learningPath;
    } catch (error) {
        console.error('Error generating recommendations:', error);
        alert(`Failed to generate recommendations: ${error.message}`);
        
        // Fall back to mock data if API fails
        return createMockRecommendations(preferences);
    } finally {
        // Hide loading state
        if (document.getElementById('loading-recommendations')) {
            document.getElementById('loading-recommendations').style.display = 'none';
        }
    }
}

// Replacing the prompt function with a UI-based approach(use for entering the API key)
function promptForAPIKey() {
    showApiKeyDropdown();
    return new Promise((resolve) => {
        // The promise will be resolved by the save button click event
        // This is now handled by the event listeners added in initApiKeyHandlers
    });
}

// Function to show the API key dropdown
function showApiKeyDropdown() {
    const dropdown = document.getElementById('api-key-dropdown');
    if (dropdown) {
        dropdown.classList.add('active');
    }
}

// Initialize API key handling - add this to the file
document.addEventListener('DOMContentLoaded', function() {
    initApiKeyHandlers();
});

function initApiKeyHandlers() {
    // API key dropdown toggle
    const apiKeyBtn = document.getElementById('api-key-btn');
    const apiKeyDropdown = document.getElementById('api-key-dropdown');
    const groqApiKeyInput = document.getElementById('groq-api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const clearApiKeyBtn = document.getElementById('clear-api-key');
    
    if (!apiKeyBtn || !apiKeyDropdown) return;
    
    // Update input with stored API key if available
    if (GROQ_API_KEY) {
        groqApiKeyInput.value = GROQ_API_KEY;
    }
    
    // Toggle dropdown on button click
    apiKeyBtn.addEventListener('click', function() {
        apiKeyDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!apiKeyBtn.contains(event.target) && !apiKeyDropdown.contains(event.target)) {
            apiKeyDropdown.classList.remove('active');
        }
    });
    
    // Save API key
    saveApiKeyBtn.addEventListener('click', function() {
        const apiKey = groqApiKeyInput.value.trim();
        if (apiKey) {
            GROQ_API_KEY = apiKey;
            localStorage.setItem('groq_api_key', apiKey);
            apiKeyDropdown.classList.remove('active');
            alert('API key saved successfully!');
        } else {
            alert('Please enter a valid API key');
        }
    });
    
    // Clear API key
    clearApiKeyBtn.addEventListener('click', function() {
        groqApiKeyInput.value = '';
        GROQ_API_KEY = null;
        localStorage.removeItem('groq_api_key');
        alert('API key cleared successfully!');
    });
}

function createEnhancedPromptFromPreferences(preferences) {
    // Here Created a detailed prompt based on user preferences with focus on valid resources
    return `
You are an educational content recommendation system. Create a personalized learning path based on the following user preferences:

Interests: ${preferences.interests}
Skill Level: ${preferences.skillLevel}
Learning Goal: ${preferences.learningGoal}
Time Commitment: ${preferences.timeCommitment}
Preferred Resource Types: ${preferences.resourceTypes ? preferences.resourceTypes.join(', ') : 'All types'}

IMPORTANT GUIDELINES FOR RECOMMENDATIONS:
1. Only recommend resources from well-established, reliable platforms that definitely exist and are accessible
2. Double-check all URLs to make sure they point to actual resources and not just homepages
3. Prioritize these reliable platforms: Coursera, edX, Udemy, Khan Academy, freeCodeCamp, Codecademy, W3Schools, YouTube, MIT OpenCourseWare, DataCamp
4. For each URL, verify the exact path to the specific course/resource (not just the platform's homepage)
5. Include ONLY resources that you are CERTAIN exist with valid, functioning URLs
6. If recommending a course, ensure it's a currently available course

For each topic of interest, provide 3-5 learning resources that form a coherent learning path from the user's current skill level towards their goal.

For each resource, provide the following information in JSON format:
- title: The name of the resource
- type: The type of resource (e.g., Course, Book, Tutorial, Project)
- description: A brief description of what the user will learn
- link: URL to access the resource (must be a direct link to the specific resource)
- estimatedTime: Estimated time to complete (e.g., "2 weeks", "4 hours")
- platform: The platform hosting the resource (e.g., "Coursera", "YouTube", "freeCodeCamp")

Ensure the resources match the user's skill level, build on each other in a logical order, and include a mix of theoretical learning and practical application.

Return your recommendations as a valid JSON array using the following structure:
[
  {
    "title": "Resource Title",
    "type": "Resource Type",
    "description": "Resource Description",
    "link": "https://specific-resource-url.com/course-name",
    "estimatedTime": "Completion Time",
    "platform": "Platform Name"
  }
]
`;
}

async function callGroqAPI(prompt) {
    try {
        // Check for internet connection
        if (!navigator.onLine) {
            throw new Error('You are offline. Please check your internet connection and try again.');
        }
        
        const response = await fetch(GROQ_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are an educational resources recommendation system specialized in creating personalized learning paths."
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // For Handling specific error codes
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your Groq API key and try again.');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            } else if (response.status >= 500) {
                throw new Error('Groq API is currently experiencing issues. Please try again later.');
            }
            
            throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling Groq API:', error);
        
        // Improve error messages based on error type
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection and try again.');
        }
        
        throw error;
    }
}

function parseLearningPathFromResponse(response, preferences) {
    try {
        // Extract JSON from the response
        let jsonStr = response;
        
        // If the response contains markdown code blocks, extract the JSON
        if (response.includes('```json')) {
            jsonStr = response.split('```json')[1].split('```')[0].trim();
        } else if (response.includes('```')) {
            jsonStr = response.split('```')[1].split('```')[0].trim();
        }
        
        // Parse the JSON
        let learningPath = JSON.parse(jsonStr);
        
        // Validate and normalize each resource
        learningPath = learningPath.map((resource, index) => {
            // Ensure all required fields exist
            return {
                id: `resource_${index}`,
                title: resource.title || 'Untitled Resource',
                type: resource.type || 'Course',
                description: resource.description || 'No description provided',
                link: resource.link || '#',
                estimatedTime: resource.estimatedTime || 'Unknown',
                platform: resource.platform || extractPlatformFromUrl(resource.link || ''),
                completed: false
            };
        });
        
        return learningPath;
    } catch (error) {
        console.error('Error parsing AI response:', error);
        console.log('Raw response:', response);
        
        // If parsing fails, fall back to mock data
        alert('Error parsing AI recommendations. Falling back to standard recommendations.');
        return createMockRecommendations(preferences);
    }
}

// Function to validate and enhance resources
function validateAndEnhanceResources(learningPath) {
    return learningPath.map(resource => {
        // Check URL validity
        const urlValidationResult = validateResourceUrl(resource.link);
        
        // Assign platform confidence based on domain
        let platformConfidence = 'low';
        let platformName = resource.platform || extractPlatformFromUrl(resource.link);
        
        const matchedPlatform = RELIABLE_PLATFORMS.find(platform => 
            resource.link.includes(platform.domain)
        );
        
        if (matchedPlatform) {
            platformConfidence = matchedPlatform.confidence;
            platformName = matchedPlatform.name;
        }
        
        // Enhance the resource object
        return {
            ...resource,
            platform: platformName,
            urlValidity: urlValidationResult.valid ? 'valid' : 'unknown',
            resourceConfidence: platformConfidence,
            verified: platformConfidence === 'high',
            verificationNote: urlValidationResult.valid 
                ? `This resource is from ${platformName}, a reliable learning platform`
                : `This resource may not have a valid or direct link`
        };
    });
}

// Basic URL validation function
function validateResourceUrl(url) {
    try {
        // Parse the URL to check basic validity
        const parsedUrl = new URL(url);
        
        // Check if URL has proper protocol
        const hasValidProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        
        // Check if it's not just a homepage but a specific resource
        // Good URLs typically have more path segments or query parameters
        const isSpecificResource = parsedUrl.pathname.length > 1 && parsedUrl.pathname !== '/';
        
        // Determining if the URL appears to be a search results page rather than a specific resource
        const isSearchPage = parsedUrl.pathname.includes('search') || 
                           parsedUrl.pathname.includes('find') || 
                           parsedUrl.search.includes('search') || 
                           parsedUrl.search.includes('query');
                           
        // Check if URL is from a reliable domain
        const isReliableDomain = RELIABLE_PLATFORMS.some(platform => parsedUrl.hostname.includes(platform.domain));
        
        return {
            valid: hasValidProtocol && isSpecificResource && !isSearchPage,
            isReliableDomain,
            isSearchPage
        };
    } catch (error) {
        console.warn('URL validation error:', error);
        return { valid: false };
    }
}

// Extract platform name from URL
function extractPlatformFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname.replace('www.', '');
        
        // Extract the main domain part (e.g., 'coursera.org' from 'www.coursera.org')
        const domainParts = domain.split('.');
        if (domainParts.length >= 2) {
            return domainParts[domainParts.length - 2].charAt(0).toUpperCase() + 
                   domainParts[domainParts.length - 2].slice(1);
        }
        return domain;
    } catch (error) {
        return 'Unknown Platform';
    }
}

// Keep the existing mock recommendation functions as fallback

function createMockRecommendations(preferences) {
    //Mock Data for demonstration purposes
    const interests = preferences.interests.split(',').map(i => i.trim());
    const level = preferences.skillLevel;
    const goal = preferences.learningGoal;
    
    // Create a learning path with multiple resources for each interest
    let learningPath = [];
    
    interests.forEach(interest => {
        // Add resources based on interest and skill level
        switch(interest.toLowerCase()) {
            case 'web development':
            case 'web dev':
            case 'webdev':
                learningPath = learningPath.concat(getWebDevResources(level, goal));
                break;
            case 'machine learning':
            case 'ml':
                learningPath = learningPath.concat(getMLResources(level, goal));
                break;
            case 'data science':
            case 'datascience':
                learningPath = learningPath.concat(getDataScienceResources(level, goal));
                break;
            case 'programming':
            case 'coding':
                learningPath = learningPath.concat(getProgrammingResources(level, goal));
                break;
            case 'python':
                learningPath = learningPath.concat(getPythonResources(level, goal));
                break;
            case 'javascript':
            case 'js':
                learningPath = learningPath.concat(getJavaScriptResources(level, goal));
                break;
            default:
                // For any other interest, providing some general resources
                learningPath = learningPath.concat(getGeneralResources(interest, level, goal));
        }
    });
    
    // Adding unique IDs to each resource and initialize completion status
    learningPath = learningPath.map((resource, index) => {
        return {
            ...resource,
            id: `resource_${index}`,
            completed: false
        };
    });
    
    return learningPath;
}

// Resource generator functions for different topics

function getWebDevResources(level, goal) {
    const resources = [];
    
    if (level === 'beginner') {
        resources.push({
            title: 'HTML Fundamentals',
            type: 'Course',
            description: 'Learn the basics of HTML to structure web content.',
            link: 'https://www.w3schools.com/html/',
            estimatedTime: '2 weeks'
        });
        resources.push({
            title: 'CSS Basics',
            type: 'Course',
            description: 'Style your web pages with CSS fundamentals.',
            link: 'https://www.w3schools.com/css/',
            estimatedTime: '2 weeks'
        });
        resources.push({
            title: 'JavaScript Essentials',
            type: 'Course',
            description: 'Add interactivity to your websites with JavaScript.',
            link: 'https://www.w3schools.com/js/',
            estimatedTime: '3 weeks'
        });
    } else if (level === 'intermediate') {
        resources.push({
            title: 'Responsive Web Design',
            type: 'Course',
            description: 'Create websites that work on any device.',
            link: 'https://www.freecodecamp.org/learn/responsive-web-design/',
            estimatedTime: '4 weeks'
        });
        resources.push({
            title: 'JavaScript Frameworks Overview',
            type: 'Course',
            description: 'Explore popular frameworks like React, Vue, and Angular.',
            link: 'https://www.codecademy.com/learn/introduction-to-javascript',
            estimatedTime: '3 weeks'
        });
    } else {
        resources.push({
            title: 'Advanced React Patterns',
            type: 'Course',
            description: 'Master advanced React concepts and patterns.',
            link: 'https://frontendmasters.com/courses/advanced-react-patterns/',
            estimatedTime: '2 weeks'
        });
        resources.push({
            title: 'Full Stack Development',
            type: 'Project',
            description: 'Build a complete web application with frontend and backend.',
            link: 'https://fullstackopen.com/',
            estimatedTime: '8 weeks'
        });
    }
    
    return resources;
}

function getMLResources(level, goal) {
    const resources = [];
    
    if (level === 'beginner') {
        resources.push({
            title: 'Introduction to Machine Learning',
            type: 'Course',
            description: 'Understand the fundamentals of machine learning algorithms.',
            link: 'https://www.coursera.org/learn/machine-learning',
            estimatedTime: '8 weeks'
        });
        resources.push({
            title: 'Python for Data Science',
            type: 'Course',
            description: 'Learn Python programming for data analysis and machine learning.',
            link: 'https://www.datacamp.com/courses/intro-to-python-for-data-science',
            estimatedTime: '4 weeks'
        });
    } else if (level === 'intermediate') {
        resources.push({
            title: 'Deep Learning Specialization',
            type: 'Course',
            description: 'Master deep learning techniques and neural networks.',
            link: 'https://www.coursera.org/specializations/deep-learning',
            estimatedTime: '12 weeks'
        });
        resources.push({
            title: 'TensorFlow in Practice',
            type: 'Course',
            description: 'Learn to use TensorFlow for various machine learning tasks.',
            link: 'https://www.coursera.org/specializations/tensorflow-in-practice',
            estimatedTime: '10 weeks'
        });
    } else {
        resources.push({
            title: 'Advanced Machine Learning Specialization',
            type: 'Course',
            description: 'Master advanced ML techniques like reinforcement learning and NLP.',
            link: 'https://www.coursera.org/specializations/aml',
            estimatedTime: '16 weeks'
        });
        resources.push({
            title: 'ML Research Project',
            type: 'Project',
            description: 'Implement a research paper from a recent ML conference.',
            link: 'https://paperswithcode.com/',
            estimatedTime: '8 weeks'
        });
    }
    
    return resources;
}

function getDataScienceResources(level, goal) {
    const resources = [];
    
    if (level === 'beginner') {
        resources.push({
            title: 'Data Science Fundamentals',
            type: 'Course',
            description: 'Learn the basics of data analysis and visualization.',
            link: 'https://www.coursera.org/specializations/data-science-fundamentals-python-sql',
            estimatedTime: '8 weeks'
        });
        resources.push({
            title: 'Statistics for Data Science',
            type: 'Course',
            description: 'Understand statistical methods essential for data analysis.',
            link: 'https://www.edx.org/course/statistics-for-data-science',
            estimatedTime: '6 weeks'
        });
    } else if (level === 'intermediate') {
        resources.push({
            title: 'Data Visualization with Python',
            type: 'Course',
            description: 'Create impactful visualizations using Python libraries.',
            link: 'https://www.coursera.org/learn/python-for-data-visualization',
            estimatedTime: '4 weeks'
        });
        resources.push({
            title: 'SQL for Data Analysis',
            type: 'Course',
            description: 'Master database queries for extracting and analyzing data.',
            link: 'https://www.udacity.com/course/sql-for-data-analysis--ud198',
            estimatedTime: '4 weeks'
        });
    } else {
        resources.push({
            title: 'Advanced Data Science Techniques',
            type: 'Course',
            description: 'Learn cutting-edge methods for complex data analysis.',
            link: 'https://www.coursera.org/specializations/jhu-data-science',
            estimatedTime: '12 weeks'
        });
        resources.push({
            title: 'Real-world Data Science Project',
            type: 'Project',
            description: 'Apply your skills to a comprehensive data analysis project.',
            link: 'https://www.kaggle.com/competitions',
            estimatedTime: '8 weeks'
        });
    }
    
    return resources;
}

function getProgrammingResources(level, goal) {
    const resources = [];
    
    if (level === 'beginner') {
        resources.push({
            title: 'Programming Fundamentals',
            type: 'Course',
            description: 'Learn the core concepts of programming logic and structure.',
            link: 'https://www.edx.org/course/cs50s-introduction-to-computer-science',
            estimatedTime: '12 weeks'
        });
        resources.push({
            title: 'Introduction to Algorithms',
            type: 'Course',
            description: 'Understand basic algorithms and problem-solving techniques.',
            link: 'https://www.khanacademy.org/computing/computer-science/algorithms',
            estimatedTime: '6 weeks'
        });
    } else if (level === 'intermediate') {
        resources.push({
            title: 'Data Structures',
            type: 'Course',
            description: 'Master common data structures and their implementations.',
            link: 'https://www.coursera.org/learn/data-structures',
            estimatedTime: '8 weeks'
        });
        resources.push({
            title: 'Object-Oriented Programming',
            type: 'Course',
            description: 'Learn to design programs using object-oriented principles.',
            link: 'https://www.edx.org/course/software-construction-object-oriented-design',
            estimatedTime: '6 weeks'
        });
    } else {
        resources.push({
            title: 'Advanced Algorithms',
            type: 'Course',
            description: 'Study complex algorithmic techniques and optimization.',
            link: 'https://www.coursera.org/specializations/algorithms',
            estimatedTime: '16 weeks'
        });
        resources.push({
            title: 'System Design',
            type: 'Course',
            description: 'Learn to design large-scale software systems.',
            link: 'https://www.educative.io/courses/grokking-the-system-design-interview',
            estimatedTime: '8 weeks'
        });
    }
    
    return resources;
}

function getPythonResources(level, goal) {
    const resources = [];
    
    if (level === 'beginner') {
        resources.push({
            title: 'Python Basics',
            type: 'Course',
            description: 'Learn Python syntax and basic programming concepts.',
            link: 'https://www.codecademy.com/learn/learn-python-3',
            estimatedTime: '4 weeks'
        });
        resources.push({
            title: 'Python Data Structures',
            type: 'Course',
            description: 'Understand lists, dictionaries, and other Python data structures.',
            link: 'https://www.coursera.org/learn/python-data',
            estimatedTime: '4 weeks'
        });
    } else if (level === 'intermediate') {
        resources.push({
            title: 'Python for Data Analysis',
            type: 'Course',
            description: 'Learn to use NumPy, pandas, and matplotlib for data analysis.',
            link: 'https://www.udemy.com/course/data-analysis-with-pandas-and-python/',
            estimatedTime: '6 weeks'
        });
        resources.push({
            title: 'Python Web Development',
            type: 'Course',
            description: 'Build web applications using Flask or Django.',
            link: 'https://www.fullstackpython.com/',
            estimatedTime: '8 weeks'
        });
    } else {
        resources.push({
            title: 'Advanced Python Techniques',
            type: 'Course',
            description: 'Master advanced concepts like decorators, generators, and metaprogramming.',
            link: 'https://realpython.com/python-advanced-features/',
            estimatedTime: '6 weeks'
        });
        resources.push({
            title: 'Python for Machine Learning',
            type: 'Course',
            description: 'Use Python for implementing machine learning algorithms.',
            link: 'https://www.coursera.org/learn/machine-learning-with-python',
            estimatedTime: '8 weeks'
        });
    }
    
    return resources;
}

function getJavaScriptResources(level, goal) {
    const resources = [];
    
    if (level === 'beginner') {
        resources.push({
            title: 'JavaScript Fundamentals',
            type: 'Course',
            description: 'Learn the basics of JavaScript programming.',
            link: 'https://www.codecademy.com/learn/introduction-to-javascript',
            estimatedTime: '4 weeks'
        });
        resources.push({
            title: 'DOM Manipulation',
            type: 'Course',
            description: 'Learn to interact with web page elements using JavaScript.',
            link: 'https://www.javascripttutorial.net/javascript-dom/',
            estimatedTime: '3 weeks'
        });
    } else if (level === 'intermediate') {
        resources.push({
            title: 'Modern JavaScript Features',
            type: 'Course',
            description: 'Master ES6+ features and modern JavaScript syntax.',
            link: 'https://es6.io/',
            estimatedTime: '4 weeks'
        });
        resources.push({
            title: 'Introduction to React',
            type: 'Course',
            description: 'Learn to build user interfaces with the React framework.',
            link: 'https://reactjs.org/tutorial/tutorial.html',
            estimatedTime: '6 weeks'
        });
    } else {
        resources.push({
            title: 'Advanced JavaScript Patterns',
            type: 'Course',
            description: 'Study advanced design patterns and best practices.',
            link: 'https://www.patterns.dev/javascript',
            estimatedTime: '6 weeks'
        });
        resources.push({
            title: 'Full Stack JavaScript',
            type: 'Project',
            description: 'Build a complete application with Node.js and a modern frontend framework.',
            link: 'https://fullstackopen.com/en/',
            estimatedTime: '12 weeks'
        });
    }
    
    return resources;
}

function getGeneralResources(topic, level, goal) {
    // Generate generic resources for topics not specifically covered
    const resources = [];
    
    resources.push({
        title: `Introduction to ${topic}`,
        type: 'Course',
        description: `Learn the fundamentals of ${topic} for beginners.`,
        link: `https://www.coursera.org/search?query=${encodeURIComponent(topic)}`,
        estimatedTime: '6 weeks'
    });
    
    if (level === 'beginner') {
        resources.push({
            title: `${topic} for Beginners`,
            type: 'Book',
            description: `A comprehensive introduction to ${topic} with no prior knowledge required.`,
            link: `https://www.amazon.com/s?k=${encodeURIComponent(topic)}+for+beginners`,
            estimatedTime: '4 weeks'
        });
    } else if (level === 'intermediate') {
        resources.push({
            title: `Intermediate ${topic}`,
            type: 'Course',
            description: `Expand your knowledge of ${topic} with more advanced concepts.`,
            link: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(topic)}`,
            estimatedTime: '8 weeks'
        });
    } else {
        resources.push({
            title: `Advanced ${topic} Techniques`,
            type: 'Course',
            description: `Master complex concepts and methodologies in ${topic}.`,
            link: `https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`,
            estimatedTime: '10 weeks'
        });
        
        resources.push({
            title: `${topic} Research Project`,
            type: 'Project',
            description: `Apply your advanced knowledge to a practical project in ${topic}.`,
            link: `https://github.com/search?q=${encodeURIComponent(topic)}`,
            estimatedTime: '12 weeks'
        });
    }
    
    return resources;
}
