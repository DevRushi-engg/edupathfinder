# EduPathFinder
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/DevRushi-engg/edupathfinder)

EduPathFinder is an intelligent web application that crafts personalized learning paths for users. By leveraging the power of Groq AI, it analyzes your interests, current skill level, and learning goals to recommend a curated list of high-quality educational resources, including courses, tutorials, books, and projects.

## Key Features

-   **AI-Powered Recommendations**: Utilizes the Groq API with the `gemma2-9b-it` model to generate fast and relevant learning paths.
-   **Personalized Onboarding**: A simple, intuitive form to capture user preferences for tailored results.
-   **Interactive Dashboard**: A central hub to view your learning path, track your progress, and filter resources by type or completion status.
-   **Resource Validation**: Automatically assesses the reliability of recommended resources, prioritizing well-known platforms like Coursera, edX, and freeCodeCamp.
-   **Progress Tracking**: Mark resources as complete and visualize your learning journey with a progress bar and completion statistics.
-   **Client-Side Authentication**: A lightweight user authentication system using browser `localStorage` to save user profiles, preferences, and progress.
-   **Responsive Design**: A clean and modern user interface that works seamlessly across desktop and mobile devices.

## How It Works

1.  **Register/Login**: Create a new account or log in to an existing one. All user data is stored locally in your browser.
2.  **Set Your Preferences**: On your first login, you'll be directed to an onboarding page. Here, you'll specify your learning interests (e.g., "Web Development, Python"), skill level, goals, and time commitment.
3.  **Generate Your Path**: The application sends your preferences to the Groq API. The AI generates a structured learning path consisting of various resources tailored to you.
4.  **Explore Your Dashboard**: Your personalized learning path is displayed on the dashboard. You can:
    -   Click on any resource to visit the URL.
    -   Mark resources as "completed" to track your progress.
    -   Search and filter resources.
    -   Refresh your recommendations if you want a new path.
5.  **Update Anytime**: You can update your learning preferences at any time to generate a new path that aligns with your evolving goals.

## Technology Stack

-   **Frontend**: HTML5, CSS3, Vanilla JavaScript
-   **AI Engine**: [Groq API](https://groq.com/)
-   **Data Storage**: Browser `localStorage`

## Getting Started

To run this project locally, follow these simple steps.

### 1. Prerequisites

You need a modern web browser that supports `localStorage`.

### 2. Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/DevRushi-engg/edupathfinder.git
cd edupathfinder
```

### 3. Configuration (API Key)

This application requires a Groq API key to generate recommendations. The free tier is generous and sufficient for personal use.

1.  Go to the [Groq Console](https://console.groq.com/keys) and sign up for a free account.
2.  Navigate to the "API Keys" section and create a new key.
3.  Copy the generated API key. **Note:** This key is only shown once, so save it securely.

### 4. Running the Application

1.  Open the `index.html` file in your web browser. For the best experience, it is recommended to use a live server extension (like "Live Server" for VS Code).
2.  Register a new user and log in.
3.  After completing the onboarding, navigate to the **Dashboard**.
4.  Click the **API Key** button in the top-right corner of the learning path section.
5.  Paste your Groq API key into the input field and click **"Save Key"**.

The application is now configured. You can refresh your recommendations to generate a new learning path using your API key.
