// generate.js
// A custom static site generator for kawaii-san.org
// ---------------------------------------------------
// This script now provides a full checklist upon completion to make updating
// your all-posts.json and git repo foolproof.
// ---------------------------------------------------

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const fm = require('front-matter');

// --- COLOR CONFIGURATION ---
const headingColors = [
    'text-kawaii-pink',
    'text-kawaii-blue',
    'text-kawaii-mint',
    'text-kawaii-lavender',
];
let colorIndex = 0;

// --- MARKED CUSTOM RENDERER ---
const renderer = {
    heading(token) {
        if (token.depth === 2) {
            const colorClass = headingColors[colorIndex];
            colorIndex = (colorIndex + 1) % headingColors.length;
            return `<h2 class="text-3xl font-bold mt-12 mb-6 ${colorClass}">${this.parser.parseInline(token.tokens)}</h2>\n`;
        }
        // By not returning 'false', Marked will use its default
        // renderer for all other heading levels (h1, h3, h4, etc.)
    },
    paragraph(token) {
        const text = this.parser.parseInline(token.tokens);
        if (text.trim().startsWith('<div class="my-8 flex justify-center">')) {
            return text;
        }
        return `<p class="mb-6">${text}</p>\n`;
    },
    hr() {
        return '';
    },
    blockquote(quote) {
        return `<div class="bg-gray-800 p-6 rounded-lg my-8 border-l-4 border-kawaii-pink">${quote}</div>\n`;
    },
    image(href, title, text) {
        // Use the 'href' (the URL from your markdown)
        return `<div class="my-8 flex justify-center">
            <img src="${href}" alt="${text}" class="w-full max-w-3xl rounded-lg shadow-lg" />
        </div>\n`;
    }
};

marked.use({ renderer });

// --- HELPER FUNCTIONS ---
const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

const formatDisplayDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

// --- CORE LOGIC ---
const runGenerator = async (markdownPath) => {
    const { default: chalk } = await import('chalk');
    console.log(chalk.blue(`🚀 Starting generation for: ${markdownPath}`));

    // Reset counters for each run
    colorIndex = 0;

    const mdFilePath = path.resolve(markdownPath);
    // Assumes template.html is in the same directory as generate.js
    const templatePath = path.join(__dirname, 'template.html');

    if (!fs.existsSync(mdFilePath) || !fs.existsSync(templatePath)) {
        console.error(chalk.red.bold(`❌ Error: Make sure both ${markdownPath} and template.html exist.`));
        process.exit(1);
    }

    const markdownContent = fs.readFileSync(mdFilePath, 'utf8');
    let template = fs.readFileSync(templatePath, 'utf8');
    const { attributes: metadata, body } = fm(markdownContent);

    const requiredFields = ['id', 'title', 'date', 'category', 'excerpt'];
    const missingFields = requiredFields.filter(field => !metadata[field]);
    if (missingFields.length > 0) {
        console.error(chalk.red.bold('❌ Error: Markdown file is missing required frontmatter:'), chalk.yellow(missingFields.join(', ')));
        process.exit(1);
    }
    
    const htmlContent = marked.parse(body);
    const readingTime = calculateReadingTime(body);
    const displayDate = formatDisplayDate(metadata.date);
    
    // Create the path from the YYYY-MM-DD date
    // e.g., '2025-10-19' -> '19-10-2025'
    const dateForPath = metadata.date.split('-').reverse().join('-');
    
    const postUrl = `/posts/${dateForPath}/`;
    const thumbnailUrl = `/assets/images/thumbnails/${dateForPath}.webp`;
    const bannerUrl = `/assets/images/banners/${dateForPath}.png`;

    const replacements = {
        '[POST_TITLE]': metadata.title,
        '[YYYY-MM-DD]': metadata.date,
        '[POST_DATE_FORMATTED]': displayDate,
        '[CATEGORY]': metadata.category,
        '[EXCERPT]': metadata.excerpt,
        '[READING_TIME]': readingTime,
        '[CONVERTED_HTML_CONTENT]': htmlContent,
        '[POST_URL]': postUrl,
        '[BANNER_URL]': bannerUrl,
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
        const regex = new RegExp(placeholder.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g');
        template = template.replace(regex, value);
    }

    const outputPath = path.join(path.dirname(mdFilePath), 'index.html');
    fs.writeFileSync(outputPath, template);

    // --- ENHANCED SUCCESS MESSAGE & CHECKLIST ---
    const jsonSnippet = {
        id: metadata.id,
        date: displayDate, // e.g., "Oct 19, 2025"
        title: metadata.title,
        excerpt: metadata.excerpt,
        category: metadata.category,
        url: postUrl,
        thumbnailUrl: thumbnailUrl,
        bannerUrl: bannerUrl,
        readingTime: readingTime,
    };

    console.log(chalk.green.bold('\n✅ Success! Your post is cooked. Here\'s your final checklist:'));

    console.log(chalk.yellow.bold('\n1. Copy this JSON object and paste it at the TOP of the array in `/posts/all-posts.json`:\n'));
    console.log(chalk.white(JSON.stringify(jsonSnippet, null, 2) + ','));

    console.log(chalk.yellow.bold('\n2. Make sure you\'ve uploaded your images to the correct paths:\n'));
    console.log(chalk.cyan(`   - Banner:    ${bannerUrl}`));
    console.log(chalk.cyan(`   - Thumbnail: ${thumbnailUrl}`));

    console.log(chalk.yellow.bold('\n3. Commit and push the following new/updated files:\n'));
    console.log(chalk.magenta(`   - ${path.relative(process.cwd(), outputPath)}`));
    console.log(chalk.magenta(`   - posts/all-posts.json`));
};

// --- SCRIPT EXECUTION ---
const inputFile = process.argv[2];
if (!inputFile) {
    console.error(chalk.red.bold('❌ Error: Please provide the path to a Markdown file.'));
    console.log(chalk.cyan('   Usage: node generate.js posts/DD-MM-YYYY/blog.md'));
    process.exit(1);
}
runGenerator(inputFile).catch(err => {
    console.error('An unexpected error occurred:', err);
    process.exit(1);
});