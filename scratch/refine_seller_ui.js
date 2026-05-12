const fs = require('fs');
const path = 'app/seller/orders/page.jsx';
let content = fs.readFileSync(path, 'utf8');

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
                                <div className="space-y-1 w-full">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{order.transactionId || order.id}</p>
                                        <span className={\`status-badge text-[8px] \${order.status === 'ORDER_PLACED' ? 'status-pending' : (order.status === 'COMPLETED' ? 'status-picked' : 'status-approved')}\`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm font-black text-slate-900 leading-tight">
                                        {order.orderItems?.map(item => item.product?.name).join(', ')} - {order.product?.lga || 'Lagos'}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon size={10} /> Ordered: {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 text-[#05DF72]">
                                            <TruckIcon size={10} /> Pickup: {order.collectionDate || 'Pending'}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Code to Share</span>
                                                <span className="text-lg font-black text-slate-900 tracking-[0.1em]">{order.verificationCode || '---'}</span>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(order.verificationCode);
                                                    toast.success("Code copied!");
                                                }}
                                                className="p-2 text-slate-300 hover:text-[#05DF72] transition-colors"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Buyer</span>
                                            <span className="text-sm font-bold text-slate-700">{order.user?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="flex flex-col items-start md:items-end">
                                <span className="text-xl font-black text-slate-900">₦{(order.payoutAmount || order.total || 0).toLocaleString()}</span>
                                {!order.isPaid ? (
                                    <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tight">UNPAID</span>
                                ) : (
                                    <span className="text-[8px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-tight">5% FEE DEDUCTED</span>
                                )}
                            </div>`;
    
    const before = lines.slice(0, startIndex + 1).join('\n');
    const after = lines.slice(actionCenterIndex).join('\n');
    content = before + '\n' + cardContent + '\n\n                                          ' + after;
}

fs.writeFileSync(path, content);
console.log('Successfully updated seller dashboard with detailed yet organized card structure.');
