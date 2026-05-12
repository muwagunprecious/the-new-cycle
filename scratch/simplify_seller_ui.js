const fs = require('fs');
const path = 'app/seller/orders/page.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Simplify the Order Card
const searchStart = '{orders.map((order) => (';
const searchEnd = '{/* Reschedule & Action Center */}';

const lines = content.split('\n');
const startIndex = lines.findIndex(l => l.includes(searchStart));
const actionCenterIndex = lines.findIndex(l => l.includes(searchEnd));

if (startIndex !== -1 && actionCenterIndex !== -1) {
    const cardContent = `                {orders.map((order) => (
                    <div key={order.id} className="card p-6 bg-white flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center w-full">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 \${order.status === 'ORDER_PLACED' ? 'bg-orange-50 text-orange-500' : (order.status === 'COMPLETED' ? 'bg-green-50 text-green-500' : 'bg-[#05DF72]/10 text-[#05DF72]')}\`}>
                                    {order.status === 'ORDER_PLACED' ? <AlertCircleIcon /> : <CheckCircleIcon />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{order.transactionId || order.id}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-black text-slate-900 tracking-tight leading-none">{order.verificationCode || '---'}</span>
                                        <span className={\`status-badge text-[9px] \${order.status === 'ORDER_PLACED' ? 'status-pending' : (order.status === 'COMPLETED' ? 'status-picked' : 'status-approved')}\`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">{order.user?.name || 'Unknown Buyer'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-slate-900">₦{(order.payoutAmount || order.total || 0).toLocaleString()}</span>
                                {!order.isPaid && (
                                    <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tight">UNPAID</span>
                                )}
                            </div>`;
    
    const before = lines.slice(0, startIndex + 1).join('\n');
    const after = lines.slice(actionCenterIndex).join('\n');
    content = before + '\n' + cardContent + '\n\n                                          ' + after;
}

// 2. Update the BottomActionSheet
const sheetSearch = '<BottomActionSheet';
if (content.includes(sheetSearch)) {
    const newSheetContent = `            <BottomActionSheet
                isOpen={isActionSheetOpen}
                onClose={() => {
                    setIsActionSheetOpen(false);
                    setSelectedOrder(null);
                }}
                title="Order Details"
                subtitle={selectedOrder?.transactionId || selectedOrder?.id}
            >
                <div className="space-y-6">
                    {/* Buyer Information */}
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Buyer Information</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{selectedOrder?.user?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Customer</p>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder?.user?.phone && (
                                <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#05DF72]">
                                            <Phone size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{selectedOrder.user.phone}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedOrder.user.phone);
                                            toast.success("Phone copied!");
                                        }}
                                        className="p-2 text-slate-400 hover:text-[#05DF72] transition-colors"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Products</p>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                {selectedOrder?.orderItems?.map(item => item.product?.name).join(', ')}
                            </p>
                        </div>
                    </div>

                    {/* Status Info */}
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pickup Logistics</p>
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
                                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Reschedule Proposal</p>
                                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[8px] font-black rounded-full uppercase">Review</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-900">
                                    <CalendarIcon size={16} />
                                    <span className="text-sm font-black">{selectedOrder.proposedDate}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">({selectedOrder.proposedBy === 'SELLER' ? 'You' : 'Buyer'})</span>
                                </div>

                                {selectedOrder.proposedBy === 'BUYER' ? (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                handleSellerRescheduleAction(selectedOrder.id, 'ACCEPT');
                                                setIsActionSheetOpen(false);
                                            }}
                                            className="flex-1 bg-[#05DF72] text-slate-900 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-[#04c764] transition-all"
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsActionSheetOpen(false);
                                                setIsRescheduleModalOpen(true);
                                            }}
                                            className="flex-1 bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl"
                                        >
                                            Counter
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            setIsActionSheetOpen(false);
                                            setIsRescheduleModalOpen(true);
                                        }}
                                        className="w-full text-[10px] font-black text-[#05DF72] uppercase underline tracking-widest py-2 text-left"
                                    >
                                        Change Proposal
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reschedule Initiation */}
                    {selectedOrder?.collectionStatus !== 'RESCHEDULE_REQUESTED' && selectedOrder?.status !== 'COMPLETED' && (
                        <button 
                            onClick={() => {
                                setIsActionSheetOpen(false);
                                setIsRescheduleModalOpen(true);
                            }}
                            className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                        >
                            <CalendarIcon size={14} /> Request Reschedule
                        </button>
                    )}
                </div>
            </BottomActionSheet>`;

    // Replace the old BottomActionSheet block
    const sheetStartIndex = lines.findIndex(l => l.includes('<BottomActionSheet'));
    let depth = 0;
    let sheetEndIndex = -1;
    for (let i = sheetStartIndex; i < lines.length; i++) {
        if (lines[i].includes('<BottomActionSheet')) depth++;
        if (lines[i].includes('</BottomActionSheet')) depth--;
        if (depth === 0 && i > sheetStartIndex) {
            sheetEndIndex = i;
            break;
        }
    }
    
    if (sheetStartIndex !== -1 && sheetEndIndex !== -1) {
        const beforeSheet = lines.slice(0, sheetStartIndex).join('\n');
        const afterSheet = lines.slice(sheetEndIndex + 1).join('\n');
        content = beforeSheet + '\n' + newSheetContent + '\n' + afterSheet;
    }
}

fs.writeFileSync(path, content);
console.log('Successfully updated seller dashboard with ultra-clean cards and detailed action sheet.');
