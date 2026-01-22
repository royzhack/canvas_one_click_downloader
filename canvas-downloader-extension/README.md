# Canvas One-Click Downloader

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-v0.3.0-blue)](https://chromewebstore.google.com/detail/canvas-one-click-download/hhkcckdgkhhmjmckcdlphjeiodjikeaf?hl=en-GB)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Download Canvas course materials into organized folders with granular selection and smart organization.

**Get it on the Chrome Web Store:** [Canvas One-Click Downloader](https://chromewebstore.google.com/detail/canvas-one-click-download/hhkcckdgkhhmjmckcdlphjeiodjikeaf?hl=en-GB)

---

## 📋 Overview

Canvas One-Click Downloader is a powerful Chrome extension that empowers students and educators to efficiently download and organize course materials from Canvas LMS. Stop downloading files one by one—with a modern, intuitive interface, you can grab exactly what you need, from a single lecture slide to an entire semester's worth of modules, in seconds.

### Key Highlights

- 🎯 **Granular Selection**: Browse course content in a tree view and select individual files, specific modules, or entire categories
- 📦 **Smart Organization**: Automatic folder organization keeps your local drive clean
- 🌍 **Universal Compatibility**: Works with ANY Canvas instance (NUS, Instructure, custom domains)
- 📄 **Content Capture**: Converts Pages, Assignments, Quizzes, and Announcements into offline-viewable HTML
- 🔒 **Privacy First**: API token stored locally, never sent to third-party servers

---

## ✨ Features

### Content Categories Supported

- **Modules**: Download entire modules or individual items within modules
- **Files**: Direct file downloads with size information
- **Assignments**: Convert assignments to HTML with descriptions
- **Quizzes**: Export quiz content and descriptions
- **Pages**: Download Canvas pages as HTML files
- **Discussions**: Export discussion topics and messages
- **Announcements**: Save announcements for offline viewing
- **Syllabus**: Download course syllabus
- **Grades**: Export personalized grades table with submissions
- **Home Page**: Capture the course front page

### User Interface Features

- **Tree View Navigation**: Expandable category structure for easy browsing
- **Select All Toggle**: Quickly select/deselect all items
- **Real-time Statistics**: See selected item count and total size before downloading
- **Modern UI**: Beautiful gradient design with glassmorphism effects
- **Responsive Design**: Optimized for the extension popup window

### Download Features

- **Granular Selection**: Choose specific items or entire categories
- **Organized Folders**: Files automatically organized by type and module
- **Safe Filenames**: Automatic sanitization of filenames for cross-platform compatibility
- **Progress Tracking**: Visual feedback during download process

---

## 🛠️ Tech Stack

### Core Technologies

#### **Chrome Extension Platform**
- **Manifest V3**: Latest Chrome extension architecture
  - Service Worker-based background scripts
  - Declarative permissions model
  - Enhanced security and performance

#### **JavaScript (ES6+)**
- **Modern ES6+ Features**:
  - `async/await` for asynchronous operations
  - Arrow functions and destructuring
  - Template literals
  - `Map` and `Set` data structures
  - Spread operator
  - Optional chaining (`?.`)

#### **Canvas LMS API Integration**
- RESTful API communication
- Pagination handling for large datasets
- Bearer token authentication
- Comprehensive endpoint coverage:
  - `/api/v1/courses/{id}`
  - `/api/v1/courses/{id}/files`
  - `/api/v1/courses/{id}/modules`
  - `/api/v1/courses/{id}/assignments`
  - `/api/v1/courses/{id}/quizzes`
  - `/api/v1/courses/{id}/pages`
  - `/api/v1/courses/{id}/discussion_topics`
  - `/api/v1/courses/{id}/students/submissions`

### Chrome Extension APIs

#### **Chrome Storage API**
- `chrome.storage.local`: Secure local storage for API tokens and domain settings
- Persistent data across extension sessions

#### **Chrome Downloads API**
- `chrome.downloads.download()`: Programmatic file downloads
- Automatic folder organization
- Filename sanitization and path management

#### **Chrome Tabs API**
- `chrome.tabs.query()`: Extract course ID from current tab URL
- Active tab detection for course page identification

#### **Chrome Runtime API**
- `chrome.runtime.sendMessage()`: Communication between popup and service worker
- Message passing for download requests

### Frontend Technologies

#### **HTML5**
- Semantic HTML structure
- Form inputs for authentication
- Dynamic DOM manipulation

#### **CSS3**
- **CSS Custom Properties (Variables)**: Theme management
- **CSS Gradients**: Beautiful gradient backgrounds
- **Glassmorphism**: Modern frosted glass effects
  - `backdrop-filter: blur()`
  - Semi-transparent backgrounds
- **Flexbox**: Layout management
- **CSS Transitions**: Smooth animations
- **Custom Scrollbars**: Hidden scrollbar styling

#### **Modern CSS Features**
- `:root` variables for theming
- `::after` pseudo-elements for checkboxes
- `:hover` and `:active` state styling
- Responsive design patterns

### Architecture Patterns

- **Service Worker Pattern**: Background script for download handling
- **Popup UI Pattern**: User interface in extension popup
- **Message Passing**: Communication between popup and background
- **State Management**: Centralized state object in popup
- **API Abstraction**: Reusable API helper functions

---

## 📦 Installation

### From Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store listing](https://chromewebstore.google.com/detail/canvas-one-click-download/hhkcckdgkhhmjmckcdlphjeiodjikeaf?hl=en-GB)
2. Click **"Add to Chrome"**
3. Confirm the installation
4. The extension icon will appear in your Chrome toolbar

### Manual Installation (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right)
4. Click **"Load unpacked"**
5. Select the extension directory
6. The extension will be loaded and ready to use

---

## 🚀 Usage Guide

### Initial Setup

1. **Navigate to a Canvas Course Page**
   - Open any Canvas course in your browser
   - The extension detects the course automatically

2. **Open the Extension**
   - Click the extension icon in your Chrome toolbar
   - The popup will open

3. **Configure API Token**
   - If this is your first time, you'll see the authentication screen
   - **Get Your Canvas API Token**:
     1. Go to your Canvas account → **Settings**
     2. Scroll to **"Approved Integrations"**
     3. Click **"+ New Access Token"**
     4. Give it a description (e.g., "Downloader Extension")
     5. Click **"Generate Token"**
     6. **Copy the token immediately** (you won't see it again!)

4. **Enter Your Domain**
   - Default: `canvas.nus.edu.sg`
   - For other Canvas instances, enter your domain (e.g., `canvas.instructure.com`)
   - The extension will automatically clean the URL format

5. **Save Settings**
   - Click **"Save Settings"**
   - The extension will verify your token
   - Upon success, you'll see the main interface

### Downloading Content

1. **Browse Categories**
   - Expand categories by clicking the arrow
   - Categories load items on first expansion
   - Default selections: Modules and Files are pre-checked

2. **Select Content**
   - **Category Level**: Check the category checkbox to select all items
   - **Item Level**: Expand and check individual items
   - **Select All**: Use the "Select All" checkbox in the header

3. **View Statistics**
   - The stats bar shows:
     - Number of selected items
     - Total size of selected content

4. **Download**
   - Click **"Download Selected"**
   - Files will be organized in folders:
     ```
     {CourseCode}/
     ├── Modules/
     │   └── {ModuleName}/
     │       └── {FileName}
     ├── Files/
     │   └── {FileName}
     ├── Assignments/
     │   └── {AssignmentName}.html
     ├── Quizzes/
     │   └── {QuizName}.html
     ├── Pages/
     │   └── {PageName}.html
     ├── Discussions/
     │   └── {DiscussionTitle}.html
     ├── Announcements/
     │   └── {AnnouncementTitle}.html
     ├── Syllabus/
     │   └── Syllabus.html
     ├── Grades/
     │   └── Grades.html
     └── Home/
         └── {HomePageTitle}.html
     ```

5. **Monitor Downloads**
   - Check Chrome's download manager for progress
   - Files are saved to your default download location

---

## 🏗️ Architecture

### File Structure

```
canvas-downloader-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup.html             # Main UI structure
├── popup.js               # Frontend logic and API communication
├── service_worker.js      # Background download handler
└── README.md              # This file
```

### Component Overview

#### **manifest.json**
- Defines extension metadata and permissions
- Configures popup UI and service worker
- Declares required permissions:
  - `storage`: For API token persistence
  - `downloads`: For file downloads
  - `activeTab`: For course page detection
  - `host_permissions`: For Canvas API access

#### **popup.html**
- UI structure with two main sections:
  - **Auth Screen**: Token and domain input
  - **Main UI**: Course tree view and download controls
- Embedded CSS for styling
- Minimal, focused design

#### **popup.js**
- **State Management**: Centralized `STATE` object
- **API Helpers**: Reusable Canvas API functions
- **UI Logic**: Category rendering, checkbox management
- **Message Passing**: Sends download requests to service worker
- **Features**:
  - Course detection from URL
  - Token validation
  - Paginated API fetching
  - File size mapping
  - Statistics calculation

#### **service_worker.js**
- **Background Processing**: Handles downloads without blocking UI
- **Download Logic**: Processes granular download requests
- **File Organization**: Creates folder structure
- **Content Conversion**: Converts Canvas content to HTML
- **Error Handling**: Graceful failure handling

### Data Flow

```
User Action (Popup)
    ↓
Select Content → Update State
    ↓
Click Download → Send Message to Service Worker
    ↓
Service Worker Receives Message
    ↓
Fetch Content from Canvas API
    ↓
Process & Organize Files
    ↓
Download via Chrome Downloads API
    ↓
Files Saved to User's Download Folder
```

### API Communication Flow

```
Popup (popup.js)
    ↓ [chrome.runtime.sendMessage]
Service Worker (service_worker.js)
    ↓ [fetch with Bearer token]
Canvas LMS API
    ↓ [JSON response]
Service Worker
    ↓ [chrome.downloads.download]
User's Download Folder
```

---

## 🔒 Privacy & Security

### Data Handling

- **API Token Storage**: 
  - Stored locally using `chrome.storage.local`
  - Never transmitted to third-party servers
  - Only used for direct Canvas API communication

- **Domain Information**:
  - Stored locally for convenience
  - Used only for API endpoint construction

- **Course Data**:
  - Fetched directly from Canvas API
  - Processed locally in the extension
  - Not logged or stored permanently

### Security Features

- **Token Validation**: Verifies token before saving
- **Direct API Communication**: No proxy servers or intermediaries
- **Local Processing**: All data processing happens in your browser
- **No Analytics**: Extension does not track usage or collect analytics

### Permissions Explained

- **`storage`**: Required to save your API token locally
- **`downloads`**: Required to download files to your computer
- **`activeTab`**: Required to detect which Canvas course page you're on
- **`host_permissions`**: Required to communicate with Canvas API endpoints

---

## 👨‍💻 Development

### Prerequisites

- Google Chrome (latest version)
- Basic knowledge of JavaScript, HTML, and CSS
- Understanding of Chrome Extension APIs
- Canvas LMS API access (for testing)

### Development Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd canvas-downloader-extension
   ```

2. **Load Extension in Developer Mode**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

3. **Make Changes**
   - Edit files as needed
   - Changes to `popup.js` and `popup.html` require reloading the popup
   - Changes to `service_worker.js` require reloading the extension

4. **Test Changes**
   - Reload the extension after code changes
   - Test on a Canvas course page
   - Check Chrome DevTools console for errors

### Debugging

- **Popup Debugging**: Right-click extension icon → "Inspect popup"
- **Service Worker Debugging**: Go to `chrome://extensions/` → Click "service worker" link
- **Console Logs**: Check both popup and service worker consoles

### Code Structure

- **Modular Functions**: Each major feature is a separate function
- **Error Handling**: Try-catch blocks around API calls
- **Async/Await**: Modern asynchronous programming patterns
- **Comments**: Code is well-commented for maintainability

---

## 🐛 Troubleshooting

### Common Issues

**"Your Canvas Token is invalid or expired"**
- Generate a new token from Canvas Settings
- Ensure you copied the full token (starts with numbers)
- Verify your domain is correct

**"Open a Canvas Course page first"**
- Navigate to a Canvas course page
- The URL should contain `/courses/{id}`
- Refresh the extension popup

**Downloads not starting**
- Check Chrome's download permissions
- Verify your download folder is accessible
- Check browser console for errors

**Files not organizing correctly**
- Ensure course code is available (some courses may not have codes)
- Check for special characters in filenames (automatically sanitized)

**Extension not loading**
- Verify Manifest V3 compatibility
- Check for syntax errors in console
- Ensure all required files are present

---

## 📝 Version History

### Version 0.3.0 (Current)
- Custom domain support
- Enhanced error handling
- Improved file organization
- Better token validation

### Version 1.0.0 (Chrome Web Store)
- Initial public release
- Comprehensive category support
- Granular file selection
- "Select All" functionality
- Custom domain support

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Areas for Contribution

- Additional Canvas content types
- UI/UX improvements
- Performance optimizations
- Bug fixes
- Documentation improvements
- Internationalization support

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## ⚠️ Disclaimer

This extension is an independent project and is **not affiliated with Instructure or Canvas LMS**. Use at your own discretion and in accordance with your institution's policies.

---

## 🔗 Links

- **Chrome Web Store**: [Canvas One-Click Downloader](https://chromewebstore.google.com/detail/canvas-one-click-download/hhkcckdgkhhmjmckcdlphjeiodjikeaf?hl=en-GB)
- **Canvas LMS**: [https://www.instructure.com/canvas](https://www.instructure.com/canvas)
- **Canvas API Documentation**: [https://canvas.instructure.com/doc/api/](https://canvas.instructure.com/doc/api/)

---

## 📧 Support

For issues, questions, or feedback:
- Open an issue on the repository
- Contact: downloadercanvas@gmail.com

---

**Made with ❤️ for students and educators**
