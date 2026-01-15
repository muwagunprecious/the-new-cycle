'use client'
import { PlusIcon, SquarePenIcon, XIcon, ShieldCheckIcon, WalletIcon, TruckIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import CheckoutModal from './CheckoutModal';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = '₦';

    const router = useRouter();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('Pay Now');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const handleCouponCode = async (event) => {
        event.preventDefault();
        toast.error("Invalid coupon code for this region.")
    }

    const openCheckout = () => {
        if (!selectedAddress && addressList.length === 0) {
            toast.error("Please add a delivery address first.")
            return
        }
        setIsCheckoutOpen(true)
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[400px] card !p-8 border-2 border-slate-100 shadow-xl shadow-slate-200/50'>
            <div className='flex items-center gap-2 text-[#05DF72] mb-6'>
                <ShieldCheckIcon size={20} />
                <h2 className='text-lg font-black uppercase tracking-wider'>Order Summary</h2>
            </div>

            <div className='pb-6 border-b border-slate-100'>
                <div className='space-y-3'>
                    <div className='flex justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter'>
                        <span>Subtotal:</span>
                        <span className="text-slate-900">{currency}{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter'>
                        <span>Logistics:</span>
                        <span className="text-[#05DF72]">Calculated at next step</span>
                    </div>
                </div>
            </div>

            <div className='flex justify-between py-8'>
                <p className="font-black text-slate-900 uppercase text-sm">Total:</p>
                <p className='font-black text-2xl text-slate-900 tracking-tighter'>{currency}{totalPrice.toLocaleString()}</p>
            </div>

            <button onClick={openCheckout} className='w-full btn-primary !py-5 shadow-2xl shadow-[#05DF72]/30'>
                Proceed to Checkout
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                items={items}
                total={totalPrice}
            />

        </div>
    )
}

export default OrderSummary
