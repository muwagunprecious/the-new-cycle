'use client'
import Image from "next/image"
import { MapPin, Mail, Phone } from "lucide-react"

const StoreInfo = ({ store }) => {
    return (
        <div className="flex-1 space-y-2 text-sm">
            <Image width={100} height={100} src={store.logo} alt={store.name} className="max-w-20 max-h-20 object-contain shadow rounded-full max-sm:mx-auto" />
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <h3 className="text-xl font-semibold text-slate-800"> {store.name} </h3>
                <span className="text-sm">@{store.username}</span>

                {/* Status Badge */}
                <span
                    className={`text-xs font-semibold px-4 py-1 rounded-full ${store.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : store.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                >
                    {store.status}
                </span>

                {store.walletBalance !== undefined && (
                    <span className="text-xs font-black bg-[#05DF72]/10 text-[#05DF72] px-3 py-1 rounded-full border border-[#05DF72]/20">
                        Wallet: ₦{store.walletBalance.toLocaleString()}
                    </span>
                )}
            </div>

            {store.status === 'rejected' && store.rejectionReason && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start gap-2 text-rose-600 text-[10px] font-medium my-2">
                    <span className="font-black uppercase">Reason:</span>
                    <span>{store.rejectionReason}</span>
                </div>
            )}

            <p className="text-slate-600 my-5 max-w-2xl">{store.description}</p>
            <p className="flex items-center gap-2"> <MapPin size={16} /> {store.address}</p>
            <p className="flex items-center gap-2"><Phone size={16} /> {store.contact}</p>
            <p className="flex items-center gap-2"><Mail size={16} />  {store.email}</p>

            {/* Verification Content */}
            <div className="mt-4 p-5 bg-slate-50 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-slate-100">
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-1">Identification</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">NIN Number</p>
                            <p className="text-slate-700 font-bold">{store.nin || 'Not Provided'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">CAC Number</p>
                            <p className="text-slate-700 font-bold">{store.cac || 'Individual'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-1">Bank Details</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Account Name</p>
                            <p className="text-slate-700 font-bold">{store.accountName || 'Not Provided'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Bank</p>
                            <p className="text-slate-700 font-bold">{store.bankName || 'Not Provided'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Account Number</p>
                            <p className="text-slate-700 font-mono font-bold">{store.accountNumber || 'Not Provided'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-slate-700 mt-5">Applied  on <span className="text-xs">{new Date(store.createdAt).toLocaleDateString()}</span> by</p>
            <div className="flex items-center gap-2 text-sm ">
                <Image width={36} height={36} src={store.user.image} alt={store.user.name} className="w-9 h-9 rounded-full" />
                <div>
                    <p className="text-slate-600 font-medium">{store.user.name}</p>
                    <p className="text-slate-400">{store.user.email}</p>
                </div>
            </div>
        </div>
    )
}

export default StoreInfo