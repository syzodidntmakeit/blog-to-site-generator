# Blog-to-Site Generator - Technical Specification

## Project Overview
A CLI tool that converts Markdown blog posts into fully-templated HTML files with metadata extraction, automatic reading time calculation, and JSON updates.

---

## Core Functionality

### 1. **Input Processing**
- **Accept**: Single `.md` file as CLI argument
  ```bash
  node generate.js ./my-post.md
  ```
- **Frontmatter Parsing**: Extract metadata from top of file
  ```markdown
  ---
  title: "Post Title"
  date: 2025-10-21
  category: tech
  excerpt: "First 150-160 chars optional (auto-generate if missing)"
  thumbnail: "Blog-2025-10-21.png"
  ---
  
  # Actual post content here...
  ```

### 2. **Metadata Extraction**
If no frontmatter, extract from content:
- **Title**: First `# Heading`
- **Date**: Filename or prompt user
- **Category**: Prompt user (tech, commentary, etc.)
- **Excerpt**: First 150-160 chars of first paragraph
- **Thumbnail**: Filename pattern `Blog-YYYY-MM-DD.png`

### 3. **Markdown to HTML Conversion**
Convert Markdown syntax to HTML with proper Tailwind classes:
- Headings with color rotation
- Paragraphs with spacing classes
- Bold/italic/links
- Code blocks (inline and block)
- Blockquotes → highlighted boxes
- Lists → prose format
- Horizontal rules

### 4. **HTML Generation**
- Fill the template with converted content
- Replace all placeholders
- Output to `/posts/YYYY-MM-DD/index.html`
- Create directory if doesn't exist

### 5. **JSON Update**
Automatically add/update entry in `posts.json`:
```json
{
  "id": "unique-id-from-title",
  "date": "2025-10-21",
  "title": "Post Title",
  "excerpt": "...",
  "category": "tech",
  "url": "/posts/21-10-2025/",
  "thumbnailUrl": "/assets/images/Blog-2025-10-21.png"
}
```

### 6. **Reading Time (Optional)**
Calculate from converted HTML:
```javascript
const words = htmlContent.split(/\s+/).length;
const readingTime = Math.ceil(words / 200);
```

---

## Tech Stack Recommendation

### Language: **Node.js** (JavaScript)
**Why**: 
- Easy to learn, flexible
- Great ecosystem for this use case
- Can be run as CLI tool easily
- Works on Windows/Mac/Linux

### Dependencies You'll Need

```json
{
  "dependencies": {
    "marked": "^11.0.0",           // Markdown → HTML
    "front-matter": "^4.0.2",      // Parse YAML frontmatter
    "chalk": "^5.3.0",             // Colored CLI output
    "yargs": "^17.7.2"             // CLI argument parsing
  },
  "devDependencies": {
    "prettier": "^3.0.0"           // Code formatting (optional)
  }
}
```

**Alternative if you want simpler**: Use `showdown` instead of `marked` (more lightweight)

---

## File Structure

```
blog-to-site-generator/
├── README.md
├── package.json
├── .gitignore
├── bin/
│   └── generate.js              # CLI entry point
├── src/
│   ├── index.js                 # Main orchestration
│   ├── parser.js                # Markdown → HTML conversion
│   ├── extractor.js             # Metadata extraction
│   ├── templater.js             # Template filling
│   ├── json-updater.js          # posts.json management
│   └── utils.js                 # Helper functions
├── templates/
│   └── post.html                # Blog post template
└── tests/                        # Unit tests (optional)
    ├── parser.test.js
    └── extractor.test.js
```

---

## Module Breakdown

### `bin/generate.js` (CLI Entry Point)
```javascript
#!/usr/bin/env node

const yargs = require('yargs');
const { generatePost } = require('../src/index.js');

yargs
  .command(
    '$0 <file>',
    'Generate blog post from Markdown',
    (yargs) => {
      yargs.positional('file', {
        describe: 'Path to .md file',
        type: 'string'
      });
      yargs.option('output', {
        describe: 'Output directory',
        type: 'string',
        default: './'
      });
    },
    (argv) => {
      generatePost(argv.file, argv.output);
    }
  )
  .help()
  .argv;
```

### `src/index.js` (Orchestration)
```javascript
// Main function that:
// 1. Read markdown file
// 2. Extract metadata (frontmatter or auto-detect)
// 3. Convert markdown to HTML
// 4. Generate HTML file in correct directory
// 5. Update posts.json
// 6. Display success message with details
```

### `src/parser.js` (Markdown → HTML)
Handles all Markdown-to-HTML conversion:
- Uses `marked` library
- Custom token processors for styling
- Converts lists to prose
- Applies Tailwind classes

```javascript
module.exports = {
  parseMarkdown: (mdContent) => {
    // Convert to HTML with proper classes
    return htmlContent;
  }
};
```

### `src/extractor.js` (Metadata Extraction)
```javascript
module.exports = {
  extractFrontmatter: (content) => {
    // Parse YAML frontmatter if exists
  },
  extractFromContent: (content) => {
    // Extract title from first # heading
    // Extract excerpt from first paragraph
  },
  getUserInput: (prompt) => {
    // Prompt for date, category, etc.
  }
};
```

### `src/templater.js` (Template Filling)
```javascript
module.exports = {
  fillTemplate: (templatePath, data) => {
    // Read template
    // Replace all placeholders
    // Return filled HTML
  }
};
```

### `src/json-updater.js` (posts.json Management)
```javascript
module.exports = {
  addPostToJson: (postsJsonPath, postData) => {
    // Read existing posts.json
    // Add new post entry
    // Sort by date
    // Write back (pretty-printed)
  },
  updatePostInJson: (postsJsonPath, postId, newData) => {
    // Update existing entry if post already in JSON
  }
};
```

### `src/utils.js` (Helpers)
```javascript
module.exports = {
  slugify: (title) => {
    // "Why I Love Linux" → "why-i-love-linux"
  },
  formatDate: (date) => {
    // Convert various formats to YYYY-MM-DD
  },
  truncateExcerpt: (text, maxLength = 160) => {
    // Truncate at word boundary
  },
  generateId: (title) => {
    // Create unique ID from title
  },
  ensureDirectoryExists: (dirPath) => {
    // Create directory if needed
  }
};
```

---

## Workflow Example

### User runs:
```bash
node bin/generate.js ./my-awesome-post.md --output /path/to/kawaii-blog
```

### Script does:
1. ✅ Reads `my-awesome-post.md`
2. ✅ Parses frontmatter (or prompts for metadata)
3. ✅ Extracts title, date, category, excerpt
4. ✅ Converts Markdown to HTML with Tailwind classes
5. ✅ Fills template with converted content + metadata
6. ✅ Creates `/posts/YYYY-MM-DD/` directory
7. ✅ Writes HTML to `/posts/YYYY-MM-DD/index.html`
8. ✅ Updates `posts.json` with new entry
9. ✅ Prints success message:
   ```
   ✅ Post generated successfully!
   📝 Title: Why I Love Linux
   📅 Date: 2025-10-21
   🏷️  Category: tech
   ⏱️  Reading time: 12 minutes
   📁 Output: ./posts/21-10-2025/index.html
   📋 Updated: posts.json
   ```

---

## Advanced Features (Nice-to-Haves)

- **Batch processing**: Generate multiple posts
  ```bash
  node bin/generate.js ./posts/*.md
  ```
- **Dry-run mode**: Show what would happen without writing
  ```bash
  node bin/generate.js ./post.md --dry-run
  ```
- **Watch mode**: Regenerate on file changes
  ```bash
  node bin/generate.js ./post.md --watch
  ```
- **Config file**: `generator.config.js` for custom settings
- **Hooks**: Pre/post generation scripts
- **Image handling**: Copy banner.webp or validate it exists

---

## Testing Strategy

Unit tests for each module:

```javascript
// test/parser.test.js
test('converts h1 to h2 with kawaii-pink class', () => {
  const md = '# Title';
  const html = parseMarkdown(md);
  expect(html).toContain('text-kawaii-pink');
});

// test/extractor.test.js
test('truncates excerpt to 160 chars at word boundary', () => {
  const text = 'Lorem ipsum dolor sit amet...';
  const excerpt = truncateExcerpt(text);
  expect(excerpt.length).toBeLessThanOrEqual(160);
});
```

---

## README Sections You'll Need

- **Installation**: How to install globally or locally
- **Quick Start**: 5-minute guide
- **Configuration**: How to customize
- **API**: How to use as Node module (not just CLI)
- **Frontmatter Format**: YAML spec
- **Markdown Support**: What syntax is supported
- **Troubleshooting**: Common issues
- **Contributing**: How to contribute

---

## Optional: Package as Global CLI

In `package.json`:
```json
{
  "bin": {
    "blog-gen": "./bin/generate.js"
  }
}
```

Then users can:
```bash
npm install -g syzodidntmakeit/blog-to-site-generator
blog-gen my-post.md
```

---

## Complexity Estimate

| Component | Difficulty | Time |
|-----------|-----------|------|
| Basic CLI setup | Easy | 15 min |
| Markdown parser (using `marked`) | Easy | 30 min |
| Metadata extractor | Medium | 45 min |
| Template filler | Easy | 20 min |
| JSON updater | Easy | 20 min |
| Error handling | Medium | 30 min |
| Tests | Medium | 1 hour |
| Documentation | Easy | 30 min |
| **Total** | | **~4 hours** |

---

## My Recommendations

### Start With
1. ✅ Basic CLI that accepts file input
2. ✅ Markdown to HTML conversion (using `marked`)
3. ✅ Template filling
4. ✅ File output

### Then Add
5. ✅ Metadata extraction
6. ✅ posts.json updating
7. ✅ Error handling

### Nice-to-Have Later
8. Batch processing
9. Config files
10. Tests
11. Watch mode
