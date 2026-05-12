const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.CLARION_API_KEY || 'dev-key-change-in-production';
const ENTRIES_DIR = path.join(__dirname, 'entries');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure entries directory exists
if (!fs.existsSync(ENTRIES_DIR)) {
  fs.mkdirSync(ENTRIES_DIR, { recursive: true });
}

// API Key middleware
const validateApiKey = (req, res, next) => {
  const key = req.headers['x-api-key'] || req.query.apiKey;
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: invalid API key' });
  }
  next();
};

app.use(validateApiKey);

/**
 * Sanitize filename to prevent directory traversal
 */
function sanitizeFilename(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/**
 * POST /api/entries/save
 * Save a single entry as markdown file
 */
app.post('/api/entries/save', (req, res) => {
  try {
    const { entry, markdown } = req.body;

    if (!entry || !entry.category || !entry.title || !markdown) {
      return res.status(400).json({ error: 'Missing required fields: entry, markdown' });
    }

    // Create category subdirectory
    const categoryDir = path.join(ENTRIES_DIR, entry.category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Create filename from title
    const filename = sanitizeFilename(entry.title) + '.md';
    const filepath = path.join(categoryDir, filename);

    // Write markdown file
    fs.writeFileSync(filepath, markdown, 'utf8');

    res.json({
      success: true,
      path: `entries/${entry.category}/${filename}`,
      file: filepath
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to save entry: ${error.message}` });
  }
});

/**
 * POST /api/entries/export
 * Export multiple entries as markdown files
 */
app.post('/api/entries/export', (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'entries must be an array' });
    }

    const saved = [];
    const errors = [];

    entries.forEach(({ entry, markdown }) => {
      try {
        if (!entry || !entry.category || !entry.title || !markdown) {
          errors.push(`Skipped entry: missing required fields`);
          return;
        }

        const categoryDir = path.join(ENTRIES_DIR, entry.category);
        if (!fs.existsSync(categoryDir)) {
          fs.mkdirSync(categoryDir, { recursive: true });
        }

        const filename = sanitizeFilename(entry.title) + '.md';
        const filepath = path.join(categoryDir, filename);
        fs.writeFileSync(filepath, markdown, 'utf8');

        saved.push({
          title: entry.title,
          path: `entries/${entry.category}/${filename}`
        });
      } catch (err) {
        errors.push(`Error saving "${entry?.title}": ${err.message}`);
      }
    });

    res.json({
      success: true,
      count: saved.length,
      files: saved,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ error: `Export failed: ${error.message}` });
  }
});

/**
 * GET /api/entries/exists
 * Check if an entry markdown file already exists
 */
app.get('/api/entries/exists', (req, res) => {
  try {
    const { title, category } = req.query;

    if (!title || !category) {
      return res.status(400).json({ error: 'Missing required query params: title, category' });
    }

    const filename = sanitizeFilename(title) + '.md';
    const filepath = path.join(ENTRIES_DIR, category, filename);

    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      return res.json({
        exists: true,
        lastModified: stats.mtime.toISOString(),
        path: `entries/${category}/${filename}`
      });
    }

    res.json({
      exists: false,
      path: `entries/${category}/${filename}`
    });
  } catch (error) {
    res.status(500).json({ error: `Check failed: ${error.message}` });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Clarion API Server running on http://localhost:${PORT}`);
  console.log(`Entries directory: ${ENTRIES_DIR}`);
  console.log(`API Key required: ${API_KEY === 'dev-key-change-in-production' ? 'DEFAULT (⚠️  CHANGE IN PRODUCTION)' : 'Custom'}`);
});

module.exports = app;
