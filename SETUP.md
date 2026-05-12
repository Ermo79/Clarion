# Clarion Setup Guide

## Backend Server Setup

The Clarion application now includes a Node.js backend server for saving entries as markdown files.

### Installation

1. **Install dependencies:**
   ```bash
   cd "/Users/ermo79/iCloud Drive/Ermos-Valut/Clarion"
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3001`

3. **Verify it's running:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   You should see: `{"status":"ok","timestamp":"..."}`

### API Configuration

The server uses an API key for authentication. By default, it uses `dev-key-change-in-production`.

For production, set the environment variable:
```bash
export CLARION_API_KEY="your-secure-key-here"
npm start
```

### File Storage

- Markdown files are saved to: `/Users/ermo79/iCloud Drive/Ermos-Valut/Clarion/entries/`
- Directory structure: `entries/{category}/{entry-title}.md`
- Files are created automatically

## Frontend Configuration

The frontend expects the backend at `http://localhost:3001` by default.

To change the API URL, set the environment variable before opening the app:
```bash
export REACT_APP_API_URL="http://your-server:3001"
```

## New Features

### Multi-Entry Detection
- Click "Detect Multiple" to analyze documents for multiple articles
- Select which articles to extract as separate entries
- System automatically handles deduplication

### Smart Merging
- When an entry already exists, new information is merged automatically
- Complementary information is appended with full provenance tracking
- Conflicting information is flagged for review

### Markdown Export
- Download individual entries as .md files
- Export to backend to auto-save organized markdown files
- Full edit history preserved in each markdown file

### Edit History
- Every change is tracked with timestamp and source file
- View complete modification history in entry details
- Full changelog embedded in exported markdown

## Workflow

1. **Upload a document** with multiple articles
2. **Click "Detect Multiple"** to find all articles
3. **Select which entries** to extract
4. **Review any conflicts** that arise during merging
5. **Entries are saved** with full provenance tracking
6. **Export to markdown** for permanent file storage or download as .md file
