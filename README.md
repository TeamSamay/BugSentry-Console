# 🛡️ BugSentry Console

### **AI-Powered Software Risk Intelligence & Security Analysis**

BugSentry Console is a state-of-the-art security dashboard designed to give developers and executives deep insights into their software's risk posture. Using a **7-agent AI pipeline**, BugSentry scans repositories in real-time to identify vulnerabilities, logic bugs, and code quality issues before they reach production.

---

## ✨ Key Features

*   **⚡ 7-Agent AI Pipeline**: Orchestrates multiple specialized AI agents to analyze Security, Logic, DevOps, and Code Quality simultaneously.
*   **🤖 BugSentry Copilot**: An interactive AI chat assistant trained on your repository's specific analysis results to help you fix issues instantly.
*   **🎯 Role-Based Dashboards**:
    *   **Developer Mode**: Deep technical insights, line-of-code vulnerabilities, and remediation steps.
    *   **CEO Mode**: High-level executive summaries, organization-wide risk trends, and compliance analytics.
*   **📊 Dynamic Risk Visualization**: Real-time graphing of repository risk trends and impact analysis using Recharts.
*   **🔒 OAuth Integration**: Secure authentication via GitHub, GitLab, and Google.
*   **🔍 Automated Remediation**: Provides code-level fixes and detailed remediation steps for every detected vulnerability.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js 18
*   **Styling**: Custom Vanilla CSS (Advanced Design System)
*   **Icons**: React Icons (Fa, Fi)
*   **Charts**: Recharts & Custom SVG Graphing
*   **State Management**: React Hooks (Custom Architecture)
*   **API & Backend Integration**: Seamless connectivity with `BugSentry-Auth` and `BugSentry-System`.

---

## 📂 Project Structure

```text
BugSentry-Console/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AnalysisBadge.jsx    # Status indicators (Scanned/Scanning)
│   │   ├── Charts.jsx           # Risk graphs and area charts
│   │   ├── ChatComponents.jsx   # Copilot chat message UI
│   │   └── Skeletons.jsx        # Loading states
│   ├── hooks/            # Custom logic & Data fetching
│   │   ├── useUser.js           # Auth & User state
│   │   └── useRepos.js          # GitHub repository synchronization
│   ├── views/            # Full-page application views
│   │   ├── LoginView.jsx        # Unified OAuth login
│   │   ├── RoleSelection.jsx    # Persona selection (Dev vs CEO)
│   │   ├── DeveloperDashboard.jsx # Primary technical interface
│   │   └── WorkspaceView.jsx    # Executive dashboard
│   ├── utils/            # Constants & Shared configurations
│   ├── App.jsx           # Root orchestrator
│   └── index.css         # Global design system & animations
└── README.md             # Project documentation
```

---



## 🚀 Getting Started

### **1. Prerequisites**
*   Node.js (v16.x or higher)
*   npm or yarn
*   Connection to `BugSentry-System` API

### **2. Installation**
```bash
# Clone the repository
git clone https://github.com/TeamSamay/BugSentry-Console.git

# Navigate to the project directory
cd BugSentry-Console

# Install dependencies
npm install
```

### **3. Running Locally**
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🛡️ Security Protocol

BugSentry follows strict security standards. All repository data is fetched via encrypted tokens, and AI analysis is performed in isolated environments to ensure zero leakage of proprietary source code.

---

## 🤝 Contribution

We welcome contributions from the Team Samay community!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ by **Team Samay**.