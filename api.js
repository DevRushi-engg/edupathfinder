// API Integration for generating personalized recommendations using Groq AI

// Groq API configuration
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // You can also use 'mixtral-8x7b-32768' or other Groq models

// This would typically be stored securely and not in client-side code
// For a real production app, this should be handled by a backend service
// For demo purposes, we'll store it in localStorage (not recommended for production)
let GROQ_API_KEY = localStorage.getItem('groq_api_key');

async function generateRecommendations(preferences) {
    // Show loading state
    if (document.getElementById('loading-recommendations')) {
        document.getElementById('loading-recommendations').style.display = 'flex';
    }
    
    try {
        // Check if API key is set
        if (!GROQ_API_KEY) {
            // Prompt user for API key if not set
            GROQ_API_KEY = await promptForAPIKey();
            if (!GROQ_API_KEY) {
                throw new Error('API key is required to generate recommendations');
            }
            localStorage.setItem('groq_api_key', GROQ_API_KEY);
        }

        // Create prompt for the AI
        const prompt = createPromptFromPreferences(preferences);
        
        // Call Groq API
        const response = await callGroqAPI(prompt);
        
        // Parse learning path from response
        const learningPath = parseLearningPathFromResponse(response, preferences);
        
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

function promptForAPIKey() {
    return new Promise((resolve) => {
        const apiKey = prompt(
            "Please enter your Groq API key to generate personalized recommendations.\n" +
            "You can get a free API key at https://console.groq.com/keys\n" +
            "Your API key is stored locally on your device and not sent to our servers."
        );
        resolve(apiKey);
    });
}

function createPromptFromPreferences(preferences) {
    // Create a detailed prompt based on user preferences
    return `
You are an educational content recommendation system. Create a personalized learning path based on the following user preferences:

Interests: ${preferences.interests}
Skill Level: ${preferences.skillLevel}
Learning Goal: ${preferences.learningGoal}
Time Commitment: ${preferences.timeCommitment}
Preferred Resource Types: ${preferences.resourceTypes ? preferences.resourceTypes.join(', ') : 'All types'}

For each topic of interest, provide 3-5 learning resources that form a coherent learning path from the user's current skill level towards their goal.

For each resource, provide the following information in JSON format:
- title: The name of the resource
- type: The type of resource (e.g., Course, Book, Tutorial, Project)
- description: A brief description of what the user will learn
- link: URL to access the resource
- estimatedTime: Estimated time to complete (e.g., "2 weeks", "4 hours")

Ensure the resources match the user's skill level, build on each other in a logical order, and include a mix of theoretical learning and practical application.

Return your recommendations as a valid JSON array using the following structure:
[
  {
    "title": "Resource Title",
    "type": "Resource Type",
    "description": "Resource Description",
    "link": "https://resource-url.com",
    "estimatedTime": "Completion Time"
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
            
            // Handle specific error codes
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

// Keep the existing mock recommendation functions as fallback

function createMockRecommendations(preferences) {
    // Generate mock recommendations based on user preferences
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
                // For any other interest, provide some general resources
                learningPath = learningPath.concat(getGeneralResources(interest, level, goal));
        }
    });
    
    // Add unique IDs to each resource and initialize completion status
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
