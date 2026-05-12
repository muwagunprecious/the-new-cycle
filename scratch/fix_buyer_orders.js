const fs = require('fs');
const path = 'app/buyer/page.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports and state
if (!content.includes('import RescheduleModal')) {
    content = content.replace("import Link from \"next/link\"", "import Link from \"next/link\"\nimport RescheduleModal from \"@/components/RescheduleModal\"");
}

if (!content.includes('const [isRescheduleModalOpen')) {
    content = content.replace("const [verifying, setVerifying] = useState(false)", "const [verifying, setVerifying] = useState(false)\n    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)");
}

// 2. Add Reschedule button to order items
// Find the collection date section and add a button next to it
const rescheduleBtn = `
                                            <div className="flex flex-col gap-2">
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
                                            </div>`;

// Insert after the collection date display
content = content.replace(/\{order\.collectionDate[\s\S]*?<\/p>\s*<\/div>\s*<\/div>/g, (match) => {
    return match + rescheduleBtn;
});

// 3. Add the modal at the end of the file
if (!content.includes('<RescheduleModal')) {
    content = content.replace("</div>\n        </div>\n    )\n}", "</div>\n            <RescheduleModal \n                isOpen={isRescheduleModalOpen}\n                onClose={() => setIsRescheduleModalOpen(false)}\n                orderId={selectedOrder?.id}\n                role=\"BUYER\"\n                onRescheduled={() => window.location.reload()}\n            />\n        </div>\n    )\n}");
}

fs.writeFileSync(path, content);
console.log('Updated app/buyer/page.jsx');
