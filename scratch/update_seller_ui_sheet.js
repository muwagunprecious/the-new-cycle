const fs = require('fs');
const path = 'app/seller/orders/page.jsx';
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
const searchStr = '{/* Reschedule Interface */}'; // This was in my previous script's comment
// Actually, let's find the block that says "{/* Reschedule UI */}" or similar
// Wait, I used a script to write the block, let's look at what's currently in the file around line 240

// From previous view_file:
// 241:                                           {order.status !== 'COMPLETED' && order.status !== 'PICKED_UP' && (
// 242:                                               <div className="w-full">
// 243:                                                   {order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'BUYER' ? (

const newActionArea = `                                          {/* Reschedule & Action Center */}
                                          {order.status !== 'COMPLETED' && order.status !== 'PICKED_UP' && (
                                              <div className="w-full">
                                                  <button 
                                                      onClick={() => {
                                                          setSelectedOrder(order);
                                                          setIsActionSheetOpen(true);
                                                      }}
                                                      className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10"
                                                  >
                                                      <CalendarIcon size={14} /> Manage Pickup
                                                      {order.collectionStatus === 'RESCHEDULE_REQUESTED' && (
                                                          <span className="w-2 h-2 rounded-full bg-[#05DF72] animate-pulse" />
                                                      )}
                                                  </button>
                                              </div>
                                          )}`;

// I'll replace from the start of the reschedule block to the end of it
const oldRescheduleBlockRegex = /\{\/\* Reschedule UI \*\/\}[\s\S]*?\{\/\* Reschedule Control Center \*\/\}[\s\S]*?\{order\.status !== 'COMPLETED' && order\.status !== 'PICKED_UP' && \([\s\S]*?<\/div>\s*\}\s*\)\}/;
// That's too complex. I'll just use line matching since I know the structure.

const lines = content.split('\n');
const startIndex = lines.findIndex(l => l.includes('Reschedule Management') || l.includes('Reschedule Interface') || l.includes('Reschedule UI'));
const endIndex = lines.findIndex(l => l.includes('order.status === \'PICKED_UP\''));

if (startIndex !== -1 && endIndex !== -1) {
    const before = lines.slice(0, startIndex).join('\n');
    const after = lines.slice(endIndex).join('\n');
    content = before + '\n' + newActionArea + '\n\n                                          ' + after;
}

// 4. Add the BottomActionSheet at the end
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
                                            Proposed By: {selectedOrder.proposedBy === 'SELLER' ? 'You' : 'Buyer'}
                                        </p>
                                    </div>
                                </div>

                                {selectedOrder.proposedBy === 'BUYER' ? (
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => {
                                                handleSellerRescheduleAction(selectedOrder.id, 'ACCEPT');
                                                setIsActionSheetOpen(false);
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
                                            Waiting for the buyer to confirm or suggest an alternative.
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
                    
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">
                        Coordination made secure by GoCycle
                    </p>
                </div>
            </BottomActionSheet>`;

    content = content.replace('            <RescheduleModal', sheetContent + '\n            <RescheduleModal');
}

fs.writeFileSync(path, content);
console.log('Successfully updated seller dashboard with BottomActionSheet.');
