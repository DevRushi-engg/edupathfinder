# 🎓 EduPathFinder

[![Stars](https://img.shields.io/github/stars/DevRushi-engg/edupathfinder?style=flat-square)](https://github.com/DevRushi-engg/edupathfinder/stargazers)
[![Forks](https://img.shields.io/github/forks/DevRushi-engg/edupathfinder?style=flat-square)](https://github.com/DevRushi-engg/edupathfinder/network/members)
[![Language](https://img.shields.io/badge/language-JavaScript-yellow?style=flat-square)](https://javascript.com)
[![Language](https://img.shields.io/badge/language-HTML-orange?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Language](https://img.shields.io/badge/language-CSS-blue?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/CSS)

**EduPathFinder** is a comprehensive platform designed to empower students in navigating their academic and professional journeys. By providing personalized recommendations and curated resources, it helps users discover educational paths and career options tailored to their unique interests and goals.

---

## 📖 Table of Contents
- [✨ Features](#-features)
- [📂 Project Structure](#-project-structure)
- [🚀 Installation](#-installation)
- [💻 Usage](#-usage)
- [🔌 API & Authentication](#-api--authentication)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

- 🎯 **Personalized Recommendations**: Tailored educational paths based on user input during onboarding.
- 🔐 **Secure Authentication**: Integrated authentication logic for user data protection.
- 📊 **Interactive Dashboard**: A centralized hub for tracking progress and exploring courses.
- 📋 **Onboarding Flow**: A seamless step-by-step process to capture student preferences and background.
- 📱 **Responsive Design**: Clean and modern UI built with CSS and HTML for cross-device compatibility.

---

## 📂 Project Structure

```text
edupathfinder/
├── .vscode/                # Editor configurations
├── api.js                  # API interaction logic
├── app.js                  # Main application entry point
├── auth.js                 # Authentication and authorization logic
├── dashboard.html          # User dashboard interface
├── dashboard.js            # Frontend logic for the dashboard
├── google49e9c5b3abe901fd.html # Google site verification
├── index.html              # Landing page
├── onboarding.html         # User onboarding interface
├── onboarding.js           # Logic for the onboarding process
├── styles.css              # Global styles and layout
└── image.png               # Asset/Preview image
```

---

## 🚀 Installation

To set up the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DevRushi-engg/edupathfinder.git
   cd edupathfinder
   ```

2. **Setup a local server:**
   Since this is a frontend-heavy application, you can use a simple HTTP server to view the project.
   
   *Using Python:*
   ```bash
   python -m http.server 8000
   ```
   *Using Node.js (Live Server):*
   ```bash
   npx live-server
   ```

3. **Open in Browser:**
   Navigate to `http://localhost:8000` (or the port provided by your server).

---

## 💻 Usage

1. **Landing Page**: Start at `index.html` to learn about the platform.
2. **Authentication**: Use the sign-in/sign-up features powered by `auth.js`.
3. **Onboarding**: Complete the profile setup in `onboarding.html` to receive personalized path suggestions.
4. **Dashboard**: View your saved paths, recommended courses, and career insights in `dashboard.html`.

### Main Entry Point
The `app.js` file serves as the primary controller for the application, orchestrating the transitions between the authentication state and the user interface.

---

## 🔌 API & Authentication

The project utilizes modular JavaScript files to handle data and security:

| File | Responsibility |
| :--- | :--- |
| `api.js` | Contains functions for fetching course data and career resources from external or internal endpoints. |
| `auth.js` | Manages user sessions, login/logout logic, and communication with the identity provider. |

To configure your own API endpoints, modify the base URL constants within `api.js`.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. (Note: Please check the repository for a specific LICENSE file if applicable).

---
**Developed by [DevRushi-engg](https://github.com/DevRushi-engg)**
