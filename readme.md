# 🌸 KawaiiBlog Static Site Generator

A ridiculously simple Node.js script that turns Markdown files into styled HTML blog posts for [kawaii-san.org](https://kawaii-san.org). Because manually writing HTML is for people with too much time on their hands.

## What This Does

Takes a Markdown file with frontmatter → Spits out a fully-styled HTML post → Gives you a JSON snippet to paste into your blog index. That's it. That's the whole thing.

## Installation

```bash
npm install
```

Dependencies:
- `marked` - Markdown to HTML conversion
- `front-matter` - YAML frontmatter parsing
- `chalk` - Pretty console output (because why not)

## Usage

```bash
node generate.js posts/DD-MM-YYYY/blog.md
```

The script will:
1. ✅ Parse your Markdown + frontmatter
2. ✅ Convert it to HTML with custom Tailwind styling
3. ✅ Generate `index.html` in the same directory as your `.md` file
4. ✅ Calculate reading time
5. ✅ Give you a JSON snippet to copy into `posts/all-posts.json`

## Frontmatter Format

Your Markdown file **must** include these fields:

```markdown
---
id: "unique-post-id"
title: "Your Awesome Post Title"
date: "2025-10-21"
category: "tech"
excerpt: "A brief description of your post (150-160 chars is sweet)"
---

## Your content starts here...
```

### Required Fields
- `id` - Unique identifier (usually slugified title)
- `title` - Post title
- `date` - ISO format: `YYYY-MM-DD`
- `category` - Post category (tech, commentary, etc.)
- `excerpt` - Short description for previews

## Markdown Features

The generator converts Markdown with custom styling:

### Headings
```markdown
## This becomes a styled h2
```
Headings rotate through kawaii color palette: pink → blue → mint → lavender

### Images
```markdown
![Alt text](/path/to/image.png)
```
Automatically centered and styled with shadows

### Blockquotes
```markdown
> Important note here
```
Rendered as highlighted boxes with pink border

### Code (coming soon™)
Inline and block code support planned but not yet implemented

## File Structure

```
your-blog/
├── posts/
│   └── 21-10-2025/           # Date format: DD-MM-YYYY
│       ├── blog.md           # Your markdown file
│       └── index.html        # Generated output
├── assets/
│   └── images/
│       ├── banners/
│       │   └── 21-10-2025.png
│       └── thumbnails/
│           └── 21-10-2025.webp
├── generate.js
├── template.html
└── package.json
```

## The Post-Generation Checklist

After running the script, you'll get a friendly checklist:

1. **Copy the JSON snippet** into `/posts/all-posts.json` (at the TOP of the array)
2. **Upload your images** to the correct paths:
   - Banner: `/assets/images/banners/DD-MM-YYYY.png`
   - Thumbnail: `/assets/images/thumbnails/DD-MM-YYYY.webp`
3. **Commit and push**:
   - The new `index.html`
   - Updated `all-posts.json`

## Customization

### Template
Edit `template.html` to change the layout. Placeholders:
- `[POST_TITLE]` - Post title
- `[YYYY-MM-DD]` - ISO date
- `[POST_DATE_FORMATTED]` - Pretty date (e.g., "Oct 21, 2025")
- `[CATEGORY]` - Post category
- `[EXCERPT]` - Post excerpt
- `[READING_TIME]` - Calculated reading time in minutes
- `[CONVERTED_HTML_CONTENT]` - Your Markdown converted to HTML
- `[POST_URL]` - Generated URL path
- `[BANNER_URL]` - Banner image path

### Colors
Want different heading colors? Edit the `headingColors` array in `generate.js`:

```javascript
const headingColors = [
    'text-kawaii-pink',
    'text-kawaii-blue',
    'text-kawaii-mint',
    'text-kawaii-lavender',
];
```

### Reading Time
Default calculation: 200 words per minute. Adjust in `calculateReadingTime()` if your readers are faster/slower.

## Common Issues

**"Missing required frontmatter"**
- Check that all required fields are present in your Markdown file
- Make sure the frontmatter is at the very top (no blank lines before `---`)

**Images not showing**
- Verify your banner is at `/assets/images/banners/DD-MM-YYYY.png`
- Verify your thumbnail is at `/assets/images/thumbnails/DD-MM-YYYY.webp`
- Double-check the date format matches (DD-MM-YYYY)

**Generated HTML looks wrong**
- Make sure `template.html` exists in the same directory as `generate.js`
- Check that all CSS/JS dependencies are correctly linked in the template

## Future Improvements (Maybe)

- [ ] Batch processing multiple posts
- [ ] Automatic image optimization
- [ ] Code syntax highlighting
- [ ] Tag support
- [ ] Draft mode
- [ ] Watch mode for live regeneration

## License

MIT - See LICENSE file

## Contributing

PRs welcome if you want to make this thing less janky. Just keep it simple, please.

---

Made with 💖 and probably too much caffeine by [Isaiah](https://kawaii-san.org/about/)
