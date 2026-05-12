const fs = require('fs');
const path = 'app/seller/orders/page.jsx';
let content = fs.readFileSync(path, 'utf8');

const brokenBlock = `{order.collectionStatus === 'RESCHEDULE_REQUESTED' ? (
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
                                                  ) : (`;

const fixedBlock = `{order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'BUYER' ? (
                                                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-3 mt-1">
                                                          <div className="flex items-center justify-between">
                                                              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Buyer Proposed: {order.proposedDate}</p>
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
                                                  ) : order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'SELLER' ? (
                                                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2 mt-1">
                                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">You Proposed: {order.proposedDate}</p>
                                                          <div className="flex items-center gap-2">
                                                              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Awaiting Buyer Acceptance</p>
                                                          </div>
                                                          <button 
                                                              onClick={() => {
                                                                  setSelectedOrder(order);
                                                                  setIsRescheduleModalOpen(true);
                                                              }}
                                                              className="text-[9px] font-black text-[#05DF72] uppercase underline"
                                                          >
                                                              Change Proposal
                                                          </button>
                                                      </div>
                                                  ) : (`;

if (content.includes(brokenBlock)) {
    content = content.replace(brokenBlock, fixedBlock);
    fs.writeFileSync(path, content);
    console.log('Successfully fixed seller dashboard reschedule logic.');
} else {
    console.log('Could not find the broken block.');
}
