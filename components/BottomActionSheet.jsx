'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronUp } from 'lucide-react'

export default function BottomActionSheet({ isOpen, onClose, title, subtitle, children }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm md:hidden"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-sm shadow-2xl border-t border-slate-200 p-8 md:hidden"
                    >
                        {/* Pull Bar */}
                        <div className="w-12 h-1.5 bg-slate-200 rounded-sm mx-auto mb-6" />

                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-none">{title}</h3>
                                {subtitle && <p className="text-slate-400 font-bold text-[10px] mt-2 uppercase tracking-widest">{subtitle}</p>}
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 overflow-y-auto max-h-[60vh] no-scrollbar pb-8">
                            {children}
                        </div>
                    </motion.div>

                    {/* Desktop Modal Fallback */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="hidden md:flex fixed inset-0 z-[100] items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    >
                        <div className="bg-white rounded-sm w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 p-8">
                             <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-none">{title}</h3>
                                    {subtitle && <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">{subtitle}</p>}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-12 h-12 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar pr-2">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
