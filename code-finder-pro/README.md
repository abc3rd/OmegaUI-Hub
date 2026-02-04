# Code Finder Pro

**Professional Code Search and Analysis Tool**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.7+-green)
![License](https://img.shields.io/badge/license-Proprietary-red)

Copyright © 2026 Omega UI, LLC / Cloud Connect  
Patent Pending: USPTO Application 63942196 (B.R.A.D.Y./UCP Systems)

---

## 🎯 Overview

Code Finder Pro is an enterprise-grade tool designed for developers who need to search, analyze, and manage code across large directory structures. Built on proprietary UCP (Universal Command Protocol) technology, it provides intelligent code discovery with advanced scoring algorithms.

### Key Features

✨ **Intelligent Search**
- Multi-format file support (Python, JavaScript, Dart, Java, PHP, C/C++, and more)
- Keyword-based search with optional regex support
- Smart scoring system that ranks files by relevance
- Pattern recognition for code quality indicators

📊 **Advanced Analytics**
- Positive pattern detection (functions, classes, components)
- Negative pattern warnings (errors, todos, deprecated code)
- Project file identification and bonus scoring
- Customizable score weights and thresholds

🎨 **Professional UI**
- Clean, intuitive interface with Omega UI brand styling
- Real-time search progress with cancel capability
- Interactive preview window with file details
- Incremental results display as files are found

💾 **Export & History**
- Export results to JSON, CSV, or TXT formats
- Search history with save/load functionality
- Persistent preferences across sessions
- Batch file copying to output directory

⚙️ **Enterprise Controls**
- File size limits to optimize performance
- Directory exclusion (node_modules, .git, etc.)
- Advanced filtering options
- Multi-threaded search engine

---

## 📋 Requirements

- **Python**: 3.7 or higher
- **Operating System**: Windows, macOS, or Linux
- **Dependencies**: 
  - tkinter (included with Python)
  - beautifulsoup4 (auto-installed)

---

## 🚀 Installation

### Method 1: Run from Source

1. **Clone or download** this repository

2. **Navigate to the directory**:
   ```bash
   cd code_finder_pro
   ```

3. **Run the application**:
   ```bash
   python code_finder_pro.py
   ```

   The application will automatically install any missing dependencies.

### Method 2: Create Standalone Executable

Use the provided build script to create a standalone executable:

```bash
python build_executable.py
```

This will create a `dist/` folder containing the executable that can run without Python installed.

---

## 📖 Usage Guide

### Basic Workflow

1. **Select Root Folder**
   - Choose the directory you want to search through
   - Can be a project folder, entire drive, or specific subdirectory

2. **Choose Output Folder**
   - Where results and copied files will be saved
   - Creates folder automatically if it doesn't exist

3. **Select File Types**
   - Check the file type groups you want to search
   - Use "Select All" or "Clear All" for convenience
   - Custom extensions can be added in advanced settings

4. **Enter Keywords**
   - Comma-separated list of search terms
   - Example: `authentication, login, user, password`
   - Leave blank to search all files of selected types

5. **Set Minimum Score**
   - Files below this score won't be included in results
   - Default: 10 points
   - Recommended: 10-30 for broad searches, 40+ for precise matches

6. **Run Search**
   - Click "Run Search" to begin
   - Watch real-time progress in status bar
   - Use "Cancel" to stop search early

7. **Preview Results**
   - Click "Preview Results" to browse findings
   - View file details, scores, and content snippets
   - Open files or folders directly from preview

8. **Export Results**
   - Save results in JSON, CSV, or TXT format
   - Perfect for reports, documentation, or further analysis

### Understanding Scores

The scoring system helps you identify the most relevant files:

| Factor | Points | Example |
|--------|--------|---------|
| Keyword Match | +10 | Keyword found in file content |
| Positive Pattern | +3 | Contains "function", "class", "component" |
| Negative Pattern | -5 | Contains "error", "todo", "deprecated" |
| Project File | +20 | package.json, requirements.txt, etc. |

**Example Calculation:**
- File contains 3 keywords: **+30 points**
- Has 5 function declarations: **+15 points**
- Contains 2 "TODO" comments: **-10 points**
- **Total Score: 35 points**

### Advanced Features

#### Regular Expressions

Enable regex in the Keywords section for advanced pattern matching:

```
# Find email addresses
\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b

# Find IP addresses
\b(?:\d{1,3}\.){3}\d{1,3}\b

# Find function definitions
def\s+\w+\s*\(
```

#### Directory Exclusion

Skip common directories that bloat search results:

```
node_modules, .git, __pycache__, venv, dist, build
```

#### File Size Limits

Set maximum file size (in MB) to skip large files:
- **Default**: 10 MB
- **Recommended**: 5-10 MB for general searches
- **Large Projects**: Increase to 50-100 MB if needed

### Search History

Code Finder Pro automatically saves your search history:

1. Navigate to the **History** tab
2. View all previous searches with timestamps
3. **Load** a previous search to reuse parameters
4. **Delete** individual history items
5. **Clear All** to start fresh

### Keyboard Shortcuts

- `Ctrl+N` - New Search
- `Ctrl+E` - Export Results
- `Ctrl+H` - Show Help

---

## 🎨 Customization

### Configuration Files

Preferences are stored in:
- **Windows**: `C:\Users\<username>\.codefinderpro\`
- **macOS**: `/Users/<username>/.codefinderpro/`
- **Linux**: `/home/<username>/.codefinderpro/`

Files:
- `config.json` - User preferences
- `history.json` - Search history

### Scoring Weights

Edit the `Config` class in `code_finder_pro.py` to customize:

```python
SCORE_KEYWORD_MATCH = 10      # Points per keyword match
SCORE_POSITIVE_PATTERN = 3    # Points for positive patterns
SCORE_NEGATIVE_PATTERN = -5   # Points for negative patterns
SCORE_PROJECT_FILE = 20       # Bonus for project files
```

### File Type Groups

Add new file type groups in the `Config.FILE_TYPES` dictionary:

```python
"Ruby": [".rb", ".rake", ".gemspec"],
"Go": [".go"],
"Rust": [".rs"],
```

---

## 🏢 Business Use Cases

### Development Teams
- **Code Audits**: Find deprecated functions, security issues, or technical debt
- **Refactoring**: Locate all instances of specific patterns or APIs
- **Documentation**: Generate lists of components, modules, or features
- **Onboarding**: Help new developers find relevant code quickly

### Quality Assurance
- **Test Coverage**: Find untested code or missing test files
- **Code Review**: Identify files with high negative pattern scores
- **Standards Compliance**: Search for non-compliant code patterns

### Project Management
- **Progress Tracking**: Monitor which files mention specific features
- **Dependency Analysis**: Find all files using specific libraries
- **Migration Planning**: Identify files that need updating for new frameworks

### Small Businesses (via Cloud Connect)
- **Custom Solutions**: Integrate into automated workflows
- **Client Projects**: Quick code discovery across multiple projects
- **Template Management**: Find and reuse proven code patterns

---

## 🔒 Security & Privacy

- **Local Processing**: All searches happen on your machine
- **No Cloud Upload**: Your code never leaves your computer
- **No Telemetry**: No usage data is collected or transmitted
- **Open Logs**: All operations logged locally for transparency

---

## 🐛 Troubleshooting

### Common Issues

**Application won't start**
- Ensure Python 3.7+ is installed: `python --version`
- Check tkinter is available: `python -c "import tkinter"`
- Try running with verbose output: `python -v code_finder_pro.py`

**Search is slow**
- Reduce file size limit in Advanced settings
- Add more directories to exclusion list
- Limit file type selection to relevant types only

**Files not appearing in results**
- Lower minimum score threshold
- Check file types are selected
- Verify files contain keywords
- Try disabling regex if enabled

**Can't open files from preview**
- Ensure files still exist at original location
- Check file permissions
- Try "Open Folder" and navigate manually

**BeautifulSoup installation fails**
- Install manually: `pip install beautifulsoup4`
- Check internet connection
- Try using a virtual environment

---

## 📞 Support

For support, questions, or feature requests:

- **Website**: https://www.omegaui.com
- **Email**: info@omegaui.com
- **Phone**: +1 239-347-6030
- **Address**: 2744 Edison Avenue, Unit-7, Suite C-3, Fort Myers, FL 33916

---

## 📜 License

Copyright © 2026 Omega UI, LLC / Cloud Connect

This software is proprietary and protected by patent law.  
USPTO Application: 63942196 (B.R.A.D.Y./UCP Systems)

All rights reserved. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

For licensing inquiries, contact: info@omegaui.com

---

## 🎯 Roadmap

### Version 1.1 (Q2 2026)
- [ ] Multi-language syntax highlighting in preview
- [ ] Git integration for version history
- [ ] Cloud sync for search history
- [ ] Team collaboration features

### Version 1.2 (Q3 2026)
- [ ] AI-powered semantic search
- [ ] Custom plugin system
- [ ] REST API for integrations
- [ ] Web-based version

### Version 2.0 (Q4 2026)
- [ ] Full UCP platform integration
- [ ] GoHighLevel workflow connector
- [ ] White-label capabilities
- [ ] Enterprise dashboard

---

## 🙏 Acknowledgments

Built with ❤️ by the Cloud Connect team at Omega UI, LLC.

Part of the Universal Command Protocol (UCP) initiative to revolutionize code discovery and management.

---

**Ready to supercharge your code discovery?**  
Download Code Finder Pro today and experience professional-grade code search.

© 2026 Omega UI, LLC. All Rights Reserved.
