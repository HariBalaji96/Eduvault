const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const replacements = [
    { regex: /\b(dark:)?bg-(blue|indigo|emerald|teal|cyan|violet)-[56]00\b/g, replace: '$1bg-primary' },
    { regex: /\b(dark:)?hover:bg-(blue|indigo|emerald|teal|cyan|violet)-[67]00\b/g, replace: '$1hover:bg-primary-dark' },
    { regex: /\b(dark:)?text-(blue|indigo|emerald|teal|cyan|violet)-[3456]00\b/g, replace: '$1text-primary' },
    { regex: /\b(dark:)?hover:text-(blue|indigo|emerald|teal|cyan|violet)-[4567]00\b/g, replace: '$1hover:text-primary-dark' },
    { regex: /\b(dark:)?border-(blue|indigo|emerald|teal|cyan|violet)-[56]00\b/g, replace: '$1border-primary' },
    { regex: /\b(dark:)?focus:ring-(blue|indigo|emerald|teal|cyan|violet)-[56]00\b/g, replace: '$1focus:ring-primary' },
    { regex: /\b(dark:)?focus:border-(blue|indigo|emerald|teal|cyan|violet)-[56]00\b/g, replace: '$1focus:border-primary' },
    { regex: /\b(dark:)?bg-(blue|indigo|emerald|teal|cyan|violet)-900\/30\b/g, replace: '$1bg-primary/30' },
    { regex: /\b(dark:)?bg-(blue|indigo|emerald|teal|cyan|violet)-[59]0\b/g, replace: '$1bg-primary/10' },
    { regex: /\b(dark:)?text-(blue|indigo|emerald|teal|cyan|violet)-[78]00\b/g, replace: '$1text-primary-dark' },
    { regex: /\b(dark:)?bg-(blue|indigo|emerald|teal|cyan|violet)-100\b/g, replace: '$1bg-primary/20' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            for (const { regex, replace } of replacements) {
                content = content.replace(regex, replace);
            }
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(directory);
console.log('Done replacing colors.');
