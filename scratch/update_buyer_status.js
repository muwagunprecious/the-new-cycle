const fs = require('fs');
const path = 'app/buyer/page.jsx';
let content = fs.readFileSync(path, 'utf8');

const searchStr = '{order.collectionDate';
const lines = content.split('\n');
const targetLineIndex = lines.findIndex(l => l.includes(searchStr));

if (targetLineIndex !== -1) {
    // Find the end of the collection date display block
    let endIndex = -1;
    for (let i = targetLineIndex; i < lines.length; i++) {
        if (lines[i].includes('</p>')) {
            endIndex = i;
            break;
        }
    }

    if (endIndex !== -1) {
        const badgeBlock = [
            '                                                    {order.collectionStatus === \'RESCHEDULE_REQUESTED\' && (',
            '                                                        <span className="mt-1 block w-fit px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded-full animate-pulse">',
            '                                                            PENDING RESCHEDULE',
            '                                                        </span>',
            '                                                    )}'
        ];
        
        lines.splice(endIndex + 1, 0, ...badgeBlock);
        fs.writeFileSync(path, lines.join('\n'));
        console.log('Successfully updated buyer dashboard with pending status.');
    }
} else {
    console.log('Could not find collection date block in buyer dashboard.');
}
