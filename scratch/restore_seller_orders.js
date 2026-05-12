const fs = require('fs');
const path = 'app/seller/orders/page.jsx';
let content = fs.readFileSync(path, 'utf8');

// Using a very specific search string that avoids complex template literals
const searchStr = 'truncate max-w-[150px] sm:max-w-none">{order.transactionId || order.id}</span>';

const lines = content.split('\n');
const targetLineIndex = lines.findIndex(l => l.includes(searchStr));

if (targetLineIndex !== -1) {
    // We found the line. Now we need to check if the next lines are broken.
    // The broken state has:
    // 129:                                         <span className={`status-badge text-[9px] ...
    // 130:                                             {order.status.replace('_', ' ')}
    // 131:                                         </span>
    // 132:                                     </div>
    // 133:                                 <div className="space-y-2 min-w-[140px]">
    
    // We want to insert the missing block after line 132 (the end of the header div)
    const insertIndex = targetLineIndex + 5; // Skip the span, status badge, etc.
    
    const missingBlock = [
        '                                    <p className="text-sm font-bold text-slate-600 line-clamp-1">{order.orderItems?.map(item => item.product?.name).join(\', \') || \'Battery Order\'}</p>',
        '                                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">',
        '                                        <div className="flex items-center gap-1.5">',
        '                                            <CalendarIcon size={12} />',
        '                                            Ordered: {new Date(order.createdAt).toLocaleDateString()}',
        '                                        </div>',
        '                                        <div className="flex items-center gap-1.5 text-[#05DF72]">',
        '                                            <TruckIcon size={12} />',
        '                                            Pickup: {order.collectionDate || \'Pending Selection\'}',
        '                                            {order.collectionStatus === \'RESCHEDULE_REQUESTED\' && (',
        '                                                <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded-full animate-pulse">',
        '                                                    RESCHEDULE PENDING',
        '                                                </span>',
        '                                            )}',
        '                                        </div>',
        '                                    </div>',
        '                                </div>',
        '                            </div>',
        '',
        '                            {/* Buyer & Verification Info */}',
        '                            <div className="flex flex-wrap gap-6 items-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">'
    ];

    // Remove the broken line 133 if it's there
    if (lines[insertIndex] && lines[insertIndex].includes('<div className="space-y-2 min-w-[140px]">')) {
         lines.splice(insertIndex, 0, ...missingBlock);
         fs.writeFileSync(path, lines.join('\n'));
         console.log('Successfully restored and updated the file.');
    } else {
         console.log('Broken state not found as expected at index', insertIndex);
         console.log('Line at index:', lines[insertIndex]);
    }
} else {
    console.log('Could not find the target search string.');
}
