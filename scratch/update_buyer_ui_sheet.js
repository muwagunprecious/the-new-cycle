const fs = require('fs');
const path = 'app/buyer/page.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add BottomActionSheet import
if (!content.includes('import BottomActionSheet')) {
    content = content.replace('import RescheduleModal from "@/components/RescheduleModal"', 'import RescheduleModal from "@/components/RescheduleModal"\nimport BottomActionSheet from "@/components/BottomActionSheet"');
}

// 2. Add state
if (!content.includes('const [isActionSheetOpen')) {
    content = content.replace('const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)', 'const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)\n    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)');
}

// 3. Replace the Action Buttons area
const newActionBtn = `
                                            <div className="mt-4">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsActionSheetOpen(true);
                                                    }}
                                                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10"
                                                >
                                                    <CalendarIcon size={14} /> Manage Pickup
                                                    {order.collectionStatus === 'RESCHEDULE_REQUESTED' && (
                                                        <span className="w-2 h-2 rounded-full bg-[#05DF72] animate-pulse" />
                                                    )}
                                                </button>
                                            </div>`;

// Find where I added the reschedule buttons earlier and replace them
const oldRescheduleBlockRegex = /<div className="flex flex-col gap-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
// I'll use a simpler search and replace for the block I added in fix_buyer_orders.js
const lines = content.split('\n');
const startIndex = lines.findIndex(l => l.includes('Reschedule Pickup') && l.includes('CalendarIcon'));

if (startIndex !== -1) {
    // Look for the end of that block (should be a few lines down)
    let endIndex = startIndex;
    let braceCount = 0;
    for (let i = startIndex; i < lines.length; i++) {
        if (lines[i].includes('{')) braceCount++;
        if (lines[i].includes('}')) braceCount--;
        if (lines[i].includes('</div>')) {
            // Find the parent div end
            endIndex = i + 2; // Rough estimate to get the closing tags of the reschedule block
            break;
        }
    }
    
    // Actually, I'll just replace a larger known chunk
    const before = lines.slice(0, startIndex - 2).join('\n');
    const after = lines.slice(startIndex + 40).join('\n'); // Skip the old block
    // Wait, let's be more precise.
}

// Safer approach: replace the whole collection date block again
content = content.replace(/\{order\.collectionDate[\s\S]*?<\/div>\s*<\/div>\s*<div className="flex flex-col gap-2">[\s\S]*?Accept Date[\s\S]*?<\/div>\s*<\/div>/g, (match) => {
    // Keep the date display but replace the button area
    const datePart = match.split('<div className="flex flex-col gap-2">')[0];
    return datePart + newActionBtn;
});

// 4. Add the BottomActionSheet
if (!content.includes('<BottomActionSheet')) {
    const sheetContent = `
            {/* Action Sheet */}
            <BottomActionSheet
                isOpen={isActionSheetOpen}
                onClose={() => {
                    setIsActionSheetOpen(false);
                    setSelectedOrder(null);
                }}
                title="Manage Pickup"
                subtitle={selectedOrder?.transactionId || selectedOrder?.id}
            >
                <div className="space-y-6">
                    {/* Status Info */}
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current Status</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#05DF72] shadow-sm">
                                <TruckIcon size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">
                                    {selectedOrder?.collectionDate ? new Date(selectedOrder.collectionDate).toLocaleDateString() : 'Pending Date Selection'}
                                </p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Confirmed Pickup Date</p>
                            </div>
                        </div>
                    </div>

                    {/* Reschedule Proposals */}
                    {selectedOrder?.collectionStatus === 'RESCHEDULE_REQUESTED' && (
                        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Pending Proposal</p>
                                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[8px] font-black rounded-full uppercase">Review Required</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm">
                                        <CalendarIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{selectedOrder.proposedDate}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                            Proposed By: {selectedOrder.proposedBy === 'BUYER' ? 'You' : 'Seller'}
                                        </p>
                                    </div>
                                </div>

                                {selectedOrder.proposedBy === 'SELLER' ? (
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={async () => {
                                                const { respondToReschedule } = await import('@/backend-actions/actions/order');
                                                const res = await respondToReschedule(selectedOrder.id, 'ACCEPT', null, 'BUYER');
                                                if (res.success) {
                                                    toast.success("Date accepted!");
                                                    window.location.reload();
                                                }
                                            }}
                                            className="flex-1 bg-[#05DF72] text-slate-900 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-[#04c764] transition-all"
                                        >
                                            Accept Date
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsActionSheetOpen(false);
                                                setIsRescheduleModalOpen(true);
                                            }}
                                            className="flex-1 bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-slate-50 transition-all"
                                        >
                                            Counter
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-white/50 rounded-2xl border border-amber-100/50">
                                        <p className="text-[10px] font-bold text-amber-700 leading-relaxed italic">
                                            Waiting for the seller to confirm or suggest an alternative.
                                        </p>
                                        <button 
                                            onClick={() => {
                                                setIsActionSheetOpen(false);
                                                setIsRescheduleModalOpen(true);
                                            }}
                                            className="mt-3 text-[10px] font-black text-[#05DF72] uppercase underline tracking-widest"
                                        >
                                            Change My Proposal
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* General Actions */}
                    {selectedOrder?.collectionStatus !== 'RESCHEDULE_REQUESTED' && (
                        <button 
                            onClick={() => {
                                setIsActionSheetOpen(false);
                                setIsRescheduleModalOpen(true);
                            }}
                            className="w-full bg-slate-50 text-slate-900 font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl border border-slate-100 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                        >
                            <CalendarIcon size={14} /> Request Reschedule
                        </button>
                    )}
                </div>
            </BottomActionSheet>`;

    content = content.replace('<RescheduleModal', sheetContent + '\n            <RescheduleModal');
}

fs.writeFileSync(path, content);
console.log('Successfully updated buyer dashboard with BottomActionSheet.');
