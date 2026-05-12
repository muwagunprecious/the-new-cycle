const fs = require('fs');
const path = 'app/buyer/page.jsx';
let content = fs.readFileSync(path, 'utf8');

// The script I ran earlier for buyer added this:
/*
                                                <button 
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsRescheduleModalOpen(true);
                                                    }}
                                                    className="text-[10px] font-black text-[#05DF72] uppercase tracking-widest hover:underline flex items-center gap-1"
                                                >
                                                    <CalendarIcon size={12} /> Reschedule Pickup
                                                </button>
                                                {order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'SELLER' && (
                                                    <div className="bg-amber-50 border border-amber-100 p-2 rounded-lg">
                                                        <p className="text-[9px] font-bold text-amber-700 uppercase tracking-tight">Seller Proposed: {order.proposedDate}</p>
                                                        <button 
                                                            onClick={async () => {
                                                                const { respondToReschedule } = await import('@/backend-actions/actions/order');
                                                                const res = await respondToReschedule(order.id, 'ACCEPT', null, 'BUYER');
                                                                if (res.success) {
                                                                    toast.success("Date accepted!");
                                                                    window.location.reload();
                                                                }
                                                            }}
                                                            className="text-[9px] font-black text-amber-900 uppercase underline mt-1"
                                                        >
                                                            Accept Date
                                                        </button>
                                                    </div>
                                                )}
*/

// I need to add the "Awaiting Seller Response" for when the buyer proposes.

const brokenPart = `{order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'SELLER' && (`;

const replacement = `{order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'BUYER' && (
                                                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">You Proposed: {order.proposedDate}</p>
                                                        <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Awaiting Seller Acceptance
                                                        </p>
                                                    </div>
                                                )}
                                                {order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'SELLER' && (`;

if (content.includes(brokenPart)) {
    content = content.replace(brokenPart, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully fixed buyer dashboard reschedule logic.');
} else {
    console.log('Could not find the broken part in buyer dashboard.');
}
