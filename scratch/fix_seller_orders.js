const fs = require('fs');
const path = 'app/seller/orders/page.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `<>
                                          {order.isPaid && (
                                               <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-100">
                                                  <CheckCircleIcon size={14} />
                                                  <span className="text-xs font-bold uppercase tracking-widest">Payment Verified</span>
                                              </div>
                                          )}

                                         {order.status === 'ORDER_PLACED' && !order.isPaid && (
                                              <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-2 rounded-lg border border-amber-100">
                                                 <ClockIcon size={14} />
                                                 <span className="text-xs font-bold uppercase tracking-widest">Awaiting Payment</span>
                                             </div>
                                         )}
                                         {order.status === 'PICKED_UP' && (
                                             <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-100">
                                                 <CheckCircleIcon size={14} />
                                                 <span className="text-xs font-bold uppercase tracking-widest">Picked Up</span>
                                             </div>
                                         )}
                                     </>`;

const newBlock = `<div className="flex flex-col items-end gap-3 w-full">
                                          <div className="flex flex-wrap gap-2 justify-end w-full">
                                             {order.isPaid && (
                                                  <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-100">
                                                     <CheckCircleIcon size={14} />
                                                     <span className="text-xs font-bold uppercase tracking-widest">Payment Verified</span>
                                                 </div>
                                             )}
    
                                            {order.status === 'ORDER_PLACED' && !order.isPaid && (
                                                 <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-2 rounded-lg border border-amber-100">
                                                    <ClockIcon size={14} />
                                                    <span className="text-xs font-bold uppercase tracking-widest">Awaiting Payment</span>
                                                </div>
                                            )}
                                          </div>

                                          {/* Reschedule Management */}
                                          {order.status !== 'COMPLETED' && order.status !== 'PICKED_UP' && (
                                              <div className="w-full">
                                                  {order.collectionStatus === 'RESCHEDULE_REQUESTED' ? (
                                                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-3 mt-1">
                                                          <div className="flex items-center justify-between">
                                                              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Proposed Date: {order.proposedDate}</p>
                                                              <span className="text-[8px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-black uppercase tracking-tight">Review Required</span>
                                                          </div>
                                                          <div className="flex gap-2">
                                                              <button 
                                                                  onClick={() => handleSellerRescheduleAction(order.id, 'ACCEPT')}
                                                                  className="flex-1 px-4 py-2 bg-[#05DF72] text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#04c764] transition-all"
                                                              >
                                                                  Accept
                                                              </button>
                                                              <button 
                                                                  onClick={() => {
                                                                      setSelectedOrder(order);
                                                                      setIsRescheduleModalOpen(true);
                                                                  }}
                                                                  className="flex-1 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                                                              >
                                                                  Counter
                                                              </button>
                                                          </div>
                                                      </div>
                                                  ) : (
                                                      <button 
                                                          onClick={() => {
                                                              setSelectedOrder(order);
                                                              setIsRescheduleModalOpen(true);
                                                          }}
                                                          className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                                      >
                                                          <CalendarIcon size={14} /> Reschedule Pickup
                                                      </button>
                                                  )}
                                              </div>
                                          )}

                                          {order.status === 'PICKED_UP' && (
                                              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-100">
                                                  <CheckCircleIcon size={14} />
                                                  <span className="text-xs font-bold uppercase tracking-widest">Picked Up</span>
                                              </div>
                                          )}
                                      </div>`;

// Use a regex that ignores whitespace differences between lines
const regex = /<>\s*\{order\.isPaid\s*&&\s*\([\s\S]*?<\/?>\s*\}\s*?\)\s*\}\s*\{order\.status\s*===\s*'ORDER_PLACED'[\s\S]*?<\/div>\s*\}\s*?\)\s*\}\s*\{order\.status\s*===\s*'PICKED_UP'[\s\S]*?<\/div>\s*\}\s*?\)\s*\}\s*<\/?>/;

// Actually, I'll just do a simpler search and replace for the exact lines if possible
// But I'll use a very simple line-by-line replacement

const lines = content.split('\n');
const startIndex = lines.findIndex(l => l.includes('<>'));
const endIndex = lines.findIndex(l => l.includes('</>'));

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = lines.slice(0, startIndex).join('\n');
    const after = lines.slice(endIndex + 1).join('\n');
    const result = before + '\n' + newBlock + '\n' + after;
    fs.writeFileSync(path, result);
    console.log('Successfully updated the file.');
} else {
    console.log('Could not find the target block.', {startIndex, endIndex});
}
