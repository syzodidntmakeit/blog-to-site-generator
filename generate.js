// generate.js
// A custom static site generator for kawaii-san.org (Now with 100% less Python)

const fs = require('fs');
const path = require('path');
const os = require('os'); // <-- ADD THIS LINE to get access to the OS module
const marked = require('marked');
const fm = require('front-matter');
const chalk = require('chalk');

// --- CONFIGURATION ---
const TEMPLATE_PATH = path.join(__dirname, 'template.html');
// --- THIS IS THE FIXED LINE ---
const OUTPUT_DIR_BASE = path.join(os.homedir(), 'kawaiiblog', 'posts'); // <-- THE FIX!

// --- HELPER FUNCTIONS ---

/**
 * Calculates the estimated reading time of a text.
 * @param {string} text - The text to calculate.
 * @returns {number} Estimated reading time in minutes.
 */
const calculateReadingTime = (text) => {
    const wordsPerMinute = 200; // Average reading speed
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// --- CORE LOGIC ---

/**
 * The main function that generates a blog post.
 * @param {string} markdownPath - The path to the input Markdown file.
 */
const generatePost = (markdownPath) => {
    console.log(chalk.blue(`🚀 Starting generation for: ${markdownPath}`));

    // 1. Read the Markdown file
    if (!fs.existsSync(markdownPath)) {
        console.error(chalk.red.bold(`❌ Error: File not found at ${markdownPath}`));
        process.exit(1);
    }
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');

    // 2. Read the HTML template
    if (!fs.existsSync(TEMPLATE_PATH)) {
        console.error(chalk.red.bold(`❌ Error: Template not found at ${TEMPLATE_PATH}`));
        process.exit(1);
    }
    let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    // 3. Parse Frontmatter and Markdown
    const { attributes: metadata, body } = fm(markdownContent);

    // Validate metadata
    if (!metadata.title || !metadata.date || !metadata.category || !metadata.excerpt) {
        console.error(chalk.red.bold('❌ Error: Markdown file is missing required frontmatter (title, date, category, excerpt).'));
        process.exit(1);
    }

    // Convert Markdown body to HTML
    const htmlContent = marked.parse(body);
    const readingTime = calculateReadingTime(body);

    // 4. Fill the template
    const replacements = {
        '[POST_TITLE]': metadata.title,
        '[YYYY-MM-DD]': metadata.date,
        '[CATEGORY]': metadata.category,
        '[EXCERPT_TRUNCATED_TO_160_CHARS]': metadata.excerpt,
        '[CONVERTED_HTML_CONTENT]': htmlContent,
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
        template = template.replace(new RegExp(placeholder.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g'), value);
    }
    
    // Additional specific replacements
    template = template.replace(/Blog-\[YYYY-MM-DD\]\.png/g, `Blog-${metadata.date}.png`);
    template = template.replace(/<span class="reading-time">--<\/span>/g, `<span class="reading-time">${readingTime}</span>`);


    // 5. Save the output file
    const outputDir = path.join(OUTPUT_DIR_BASE, metadata.date);
    ensureDirectoryExists(outputDir);
    const outputPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputPath, template);

    // 6. Print success message
    console.log(chalk.green.bold('\n✅ Post generated successfully!'));
    console.log(chalk.white(`📝 Title: ${metadata.title}`));
    console.log(chalk.white(`📅 Date: ${metadata.date}`));
    console.log(chalk.white(`🏷️  Category: ${metadata.category}`));
    console.log(chalk.white(`⏱️  Reading time: ${readingTime} min read`));
    console.log(chalk.cyan(`📁 Output: ${outputPath}`));
};

// --- SCRIPT EXECUTION ---

const inputFile = process.argv[2];

if (!inputFile) {
    console.error(chalk.red.bold('❌ Error: Please provide the path to a Markdown file.'));
    console.log(chalk.yellow('Usage: node generate.js <path-to-your-post.md>'));
    process.exit(1);
}

generatePost(path.resolve(inputFile));
