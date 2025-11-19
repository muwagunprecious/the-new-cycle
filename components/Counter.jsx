'use client'
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ productId }) => {

    const { cartItems } = useSelector(state => state.cart);

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600 bg-slate-50">
            <span className="p-1">{cartItems[productId]}</span>
        </div>
    )
}

export default Counter