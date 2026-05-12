const fs = require('fs');
const path = 'app/seller/orders/page.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// The problematic lines are around 210
// 209:                                       </div>
// 210:                                 )}
// 211:                             </div>
// 212:                         </div>
// 213:                     </div>
// 214:                 ))}

// Let's remove the extra closing tags
if (lines[209] && lines[209].includes(')}')) {
    console.log('Removing extra closing brace at line 210 (index 209)');
    lines.splice(209, 1);
}

// Check if we still have issues
fs.writeFileSync(path, lines.join('\n'));
console.log('Applied potential fix.');
