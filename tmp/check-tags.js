import fs from 'fs';

const content = fs.readFileSync('c:/Users/TINGO-AI-010/Documents/Go-cycle/app/(public)/signup/page.jsx', 'utf8');
const lines = content.split('\n');

function countTags(content) {
    const stack = [];
    const regex = /<(div|form)|<\/(div|form)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
        const tag = match[0];
        const lineNum = content.substring(0, match.index).split('\n').length;
        
        if (tag.startsWith('</')) {
            if (stack.length === 0) {
                console.log(`Unexpected closing tag ${tag} at line ${lineNum}`);
            } else {
                stack.pop();
            }
        } else {
            stack.push({ tag, line: lineNum, index: match.index });
        }
    }
    
    if (stack.length > 0) {
        console.log("Unclosed tags:");
        stack.forEach(s => {
            console.log(`Tag ${s.tag} at line ${s.line}`);
        });
    } else {
        console.log("All tags balanced!");
    }
}

countTags(content);
