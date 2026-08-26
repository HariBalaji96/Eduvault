const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            content = content.replace(/className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"/g, 'className="modern-input"');
            content = content.replace(/className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"/g, 'className="modern-button shadow-primary/20"');
            content = content.replace(/className="w-full bg-primary text-white p-2 rounded hover:bg-primary-dark"/g, 'className="modern-button w-full mt-2 shadow-primary/20"');
            // generic select replacements
            content = content.replace(/className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600/g, 'className="modern-input');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + fullPath);
            }
        }
    }
}

replaceInDir(path.join(__dirname, 'src', 'pages', 'admin'));
replaceInDir(path.join(__dirname, 'src', 'pages', 'teacher'));
