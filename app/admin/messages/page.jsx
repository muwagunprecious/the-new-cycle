'use client'
import React, { useEffect, useState } from 'react'
import { getContactMessages, markMessageAsRead } from '@/backend-actions/actions/contact'
import toast from 'react-hot-toast'
import Script from 'next/script';
import { Search, Loader2, Mail, MailOpen, Clock, Phone, Building } from "lucide-react";

const MessagesPage = () => {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        const res = await getContactMessages()
        if (res.success) {
            setMessages(res.data)
        } else {
            toast.error(res.message)
        }
        setLoading(false)
    }

    const handleMarkAsRead = async (id) => {
        toast.promise(markMessageAsRead(id), {
            loading: 'Updating...',
            success: 'Marked as read',
            error: 'Failed to update'
        })
        setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m))
    }

    const filteredMessages = messages.filter(m => 
        m.firstName.toLowerCase().includes(search.toLowerCase()) || 
        m.lastName.toLowerCase().includes(search.toLowerCase()) || 
        m.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-6">
            <div className="mb-8">
                <div className="relative">
                    <>
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input
                         type="text"
                         placeholder="Search messages..."
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                         className="pl-12 pr-4 py-3 rounded-sm border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00D166] focus:border-[#00D166] w-full md:w-80 shadow-sm"
                       />
                     </>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[#00D166]" size={32} />
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-sm border border-slate-200 shadow-sm">
                    <MailOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">No messages found</h3>
                    <p className="text-slate-500 mt-2">Inbox is currently empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredMessages.map((msg) => (
                        <div key={msg.id} className={`bg-white p-6 rounded-sm shadow-sm border transition-all ${msg.status === 'unread' ? 'border-l-4 border-l-[#00D166] border-t-slate-200 border-r-slate-200 border-b-slate-200 bg-white shadow-md' : 'border-slate-200'}`}>
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* User Details Sidebar */}
                                <div className="lg:w-1/3 space-y-4 pr-6 lg:border-r border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center font-bold text-lg border border-slate-200 ${msg.status === 'unread' ? 'bg-[#00D166]/10 text-[#00D166]' : 'bg-slate-100 text-slate-500'}`}>
                                            {msg.firstName[0]}{msg.lastName[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{msg.firstName} {msg.lastName}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Clock size={14} />
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 pt-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-slate-400" />
                                            <a href={`mailto:${msg.email}`} className="hover:text-[#00D166]">{msg.email}</a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-slate-400" />
                                            <a href={`tel:${msg.phone}`} className="hover:text-[#00D166]">{msg.phone}</a>
                                        </div>
                                        {msg.organization && (
                                            <div className="flex items-center gap-3">
                                                <Building size={16} className="text-slate-400" />
                                                <span>{msg.organization}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Message Content */}
                                <div className="lg:w-2/3 flex flex-col justify-between space-y-4">
                                    <div>
                                        <span className={`inline-block px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider mb-4 ${msg.status === 'unread' ? 'bg-[#00D166]/10 text-[#00D166]' : 'bg-slate-100 text-slate-500'}`}>
                                            {msg.status}
                                        </span>
                                        <div className="bg-slate-50 p-6 rounded-sm text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-200">
                                            {msg.message}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end gap-3 pt-4">
                                        <a href={`mailto:${msg.email}`} className="px-5 py-2.5 bg-slate-900 text-white rounded-sm font-medium hover:bg-slate-800 transition-colors">
                                            Reply
                                        </a>
                                        {msg.status === 'unread' && (
                                            <button 
                                                onClick={() => handleMarkAsRead(msg.id)}
                                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-sm font-medium hover:bg-slate-50 transition-colors"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MessagesPage
