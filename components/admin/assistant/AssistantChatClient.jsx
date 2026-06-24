'use client'

import React, { useState, useRef, useEffect } from "react"
import { Sparkles, Send, Bot, User, Loader2, ShieldAlert, CheckCircle2, AlertTriangle, Trash2, Mail, HelpCircle, Activity, Info, BarChart3, Database, Key } from "lucide-react"
import { handleAssistantMessage } from "@/backend-actions/actions/ai-assistant"
import { toast, Toaster } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

// Simple parser for basic Markdown syntax (bold, tables, lists, links)
const formatMessageContent = (text) => {
    if (!text) return "";
    
    // Split text by lines
    const lines = text.split("\n");
    let inList = false;
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];

    const formattedLines = lines.map((line, idx) => {
        let trimmed = line.trim();

        // Handle markdown tables
        if (trimmed.startsWith("|")) {
            inTable = true;
            const cells = trimmed.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
            
            // Check if it's separator line (e.g., |---|---|)
            if (cells.every(c => c.match(/^:-*-?:*$/) || c.match(/^-+$/))) {
                return null; // Skip separator line
            }

            if (tableHeaders.length === 0) {
                tableHeaders = cells;
                return null;
            } else {
                tableRows.push(cells);
                return null;
            }
        } else if (inTable) {
            // End of table, render it
            inTable = false;
            const headers = [...tableHeaders];
            const rows = [...tableRows];
            tableHeaders = [];
            tableRows = [];

            return (
                <div key={`table-${idx}`} className="overflow-x-auto my-4 border border-slate-200 rounded-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 font-semibold text-slate-700">
                            <tr>
                                {headers.map((h, i) => (
                                    <th key={i} className="px-4 py-2 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-650 bg-white">
                            {rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-2 whitespace-nowrap">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Handle headers
        if (trimmed.startsWith("###")) {
            return <h4 key={idx} className="text-base font-bold text-slate-800 mt-4 mb-2">{trimmed.replace("###", "").trim()}</h4>;
        }
        if (trimmed.startsWith("##")) {
            return <h3 key={idx} className="text-lg font-bold text-slate-800 mt-5 mb-2 border-b border-slate-200 pb-1">{trimmed.replace("##", "").trim()}</h3>;
        }
        if (trimmed.startsWith("#")) {
            return <h2 key={idx} className="text-xl font-bold text-slate-800 mt-6 mb-3">{trimmed.replace("#", "").trim()}</h2>;
        }

        // Handle lists
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            inList = true;
            const content = trimmed.substring(1).trim();
            return (
                <li key={idx} className="ml-4 list-disc text-slate-600 my-1">
                    {parseInlineStyles(content)}
                </li>
            );
        }

        // Standard line
        if (trimmed === "") {
            inList = false;
            return <div key={idx} className="h-2" />;
        }

        return (
            <p key={idx} className="text-slate-650 leading-relaxed my-1">
                {parseInlineStyles(line)}
            </p>
        );
    });

    // If there's still a table being accumulated at the end of the text
    if (tableHeaders.length > 0) {
        formattedLines.push(
            <div key="table-final" className="overflow-x-auto my-4 border border-slate-200 rounded-sm">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 font-semibold text-slate-700">
                        <tr>
                            {tableHeaders.map((h, i) => (
                                <th key={i} className="px-4 py-2 text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-605 bg-white">
                        {tableRows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-4 py-2 whitespace-nowrap">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return formattedLines.filter(Boolean);
};

// Helper to parse bold (**bold**) and inline code (`code`)
const parseInlineStyles = (text) => {
    // Escape bold markdown
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/);
    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={index} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
            return <code key={index} className="px-1.5 py-0.5 bg-slate-100 rounded-sm text-rose-600 font-mono text-xs font-semibold border border-slate-200">{part.slice(1, -1)}</code>;
        }
        return part;
    });
};

const PAGE_GUIDES = [
    {
        title: "Dashboard Overview",
        path: "/admin",
        icon: BarChart3,
        description: "Provides summary counts of registered users, completed sales, pending manual verifications, and active stores. Features global performance chart showing monthly recycle metrics.",
        keyMetrics: ["Total Users", "Active Stores", "Pending Pickups", "Pending Cashouts"]
    },
    {
        title: "Disputes & Audits",
        path: "/admin/disputes",
        icon: AlertTriangle,
        description: "Search and audit transaction records. Renders an interactive order lifecycle visual timeline (stepper) with exact timestamps, buyer/seller metadata, product images, and all sent notification log previews.",
        keyMetrics: ["Timeline Stepper", "Notification Audit Log", "Email Previews"]
    },
    {
        title: "Manual Verifications",
        path: "/admin/manual-verifications",
        icon: CheckCircle2,
        description: "Admin verification queue for orders funded via manual bank transfers. Verify the buyer uploaded the payment slip and approve or decline the transfer reference to authorize order fulfillment.",
        keyMetrics: ["Payment Slips", "Reference Code Lookup", "Approve/Reject actions"]
    },
    {
        title: "Pending Products",
        path: "/admin/pending-products",
        icon: Database,
        description: "Product listings inspection dashboard. Scrap batteries uploaded by sellers are checked for quality, brand original parameters, collection dates, and images, and are either approved or rejected.",
        keyMetrics: ["Prisma Image Verify", "Amps Capacity", "Battery Type Classification"]
    },
    {
        title: "Pending Cashouts",
        path: "/admin/payments",
        icon: Key,
        description: "Payout clearance desk. Releases wallet credit funds to sellers after a successful battery pickup confirmation. Ensures platform fees are processed securely.",
        keyMetrics: ["Payout Released", "Platform Fee Deductions", "Wallet Balance Records"]
    },
    {
        title: "Contact Messages",
        path: "/admin/messages",
        icon: Mail,
        description: "User inquiry inbox. Reviews user complaints, feedback, and organizational inquiries submitted through the contact page.",
        keyMetrics: ["Sender Info", "Organization Details", "Message Status Tracking"]
    }
];

export default function AssistantChatClient() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hello! I am your **Go-Cycle AI Admin Co-pilot**. I can monitor system diagnostics, run deep account audits, search verification tokens, block or delete users, and answer dashboard questions. \n\nHow can I assist you today?"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTool, setActiveTool] = useState(null);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState(null);

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (messageText) => {
        const text = messageText || input;
        if (!text.trim()) return;

        const newMessages = [...messages, { role: "user", content: text }];
        setMessages(newMessages);
        if (!messageText) setInput("");
        setLoading(true);
        setActiveTool("Processing request...");

        try {
            const result = await handleAssistantMessage(newMessages);

            if (result.success) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: result.content,
                    toolLogs: result.toolLogs
                }]);
            } else {
                toast.error(result.content);
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: `⚠️ **Error:** ${result.content}`
                }]);
            }
        } catch (err) {
            toast.error("Failed to communicate with the co-pilot action.");
            setMessages(prev => [...prev, {
                role: "assistant",
                content: `⚠️ **Exception:** ${err.message}`
            }]);
        } finally {
            setLoading(false);
            setActiveTool(null);
        }
    };

    const runPreset = (text) => {
        handleSend(text);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50/50 rounded-sm border border-slate-200 overflow-hidden shadow-sm">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-[#05DF72]/15 border border-[#05DF72]/20 flex items-center justify-center text-slate-800">
                        <Sparkles size={20} className="text-[#05DF72]" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                            AI Co-pilot Assistant
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400">Monitoring & Administrative Co-pilot</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowGuideModal(true)}
                        className="text-xs font-bold text-slate-650 hover:text-[#05DF72] transition flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-sm border border-slate-200 uppercase tracking-wider"
                    >
                        <HelpCircle size={14} />
                        Page Guide
                    </button>
                    <button
                        onClick={() => runPreset("Check system status")}
                        className="text-xs font-bold text-slate-650 hover:text-amber-600 transition flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-sm border border-slate-200 uppercase tracking-wider"
                    >
                        <Activity size={14} />
                        Diagnostics
                    </button>
                </div>
            </div>

            {/* Main Chat Workspace */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border shadow-sm ${
                            msg.role === 'user'
                                ? 'bg-slate-800 border-slate-800 text-white'
                                : 'bg-emerald-50 border-emerald-250 text-[#05DF72]'
                        }`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>

                        {/* Content Card */}
                        <div className="flex flex-col gap-1.5">
                            <div className={`p-4 rounded-sm text-sm border shadow-sm leading-relaxed ${
                                msg.role === 'user'
                                    ? 'bg-slate-850 border-slate-750 text-white'
                                    : 'bg-white border-slate-200 text-slate-700'
                            }`}>
                                {formatMessageContent(msg.content)}
                            </div>

                            {/* Render associated executed tools */}
                            {msg.toolLogs && msg.toolLogs.length > 0 && (
                                <div className="ml-1 flex flex-col gap-1 bg-slate-50/50 p-2 rounded-sm border border-slate-200 max-w-fit">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Executed Commands</p>
                                    {msg.toolLogs.map((log, lIdx) => (
                                        <div key={lIdx} className="flex items-center gap-1.5 text-xs text-slate-500 px-1 py-0.5">
                                            <span className="w-1.5 h-1.5 rounded-sm bg-[#05DF72]" />
                                            <span className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded-sm font-semibold text-slate-650">{log.tool}</span>
                                            <span className="text-[10px] text-slate-400">at {log.timestamp}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading Status Indicator */}
                {loading && (
                    <div className="flex gap-3 max-w-[85%] mr-auto">
                        <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                            <Bot size={14} className="text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm text-sm text-slate-500 flex items-center gap-2.5">
                                <Loader2 size={16} className="animate-spin text-[#05DF72]" />
                                <span>Co-pilot is executing request...</span>
                            </div>
                            
                            {activeTool && (
                                <div className="flex items-center gap-2 text-xs font-medium text-[#05DF72] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-sm animate-pulse w-fit">
                                    <Activity size={14} className="shrink-0" />
                                    <span>{activeTool}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-6 py-3 bg-white/50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <button
                    onClick={() => runPreset("Check system status")}
                    className="text-xs bg-white text-slate-600 hover:text-[#05DF72] hover:bg-emerald-50 border border-slate-200 hover:border-emerald-250 px-3.5 py-1.5 rounded-sm shrink-0 font-medium transition shadow-sm"
                >
                    🔍 System Health Check
                </button>
                <button
                    onClick={() => runPreset("Audit account professorprecious03@gmail.com")}
                    className="text-xs bg-white text-slate-600 hover:text-[#05DF72] hover:bg-emerald-50 border border-slate-200 hover:border-emerald-250 px-3.5 py-1.5 rounded-sm shrink-0 font-medium transition shadow-sm"
                >
                    📋 Audit Dev Account
                </button>
                <button
                    onClick={() => runPreset("Find best selling sellers")}
                    className="text-xs bg-white text-slate-600 hover:text-[#05DF72] hover:bg-emerald-50 border border-slate-200 hover:border-emerald-250 px-3.5 py-1.5 rounded-sm shrink-0 font-medium transition shadow-sm"
                >
                    🏆 Best Sellers
                </button>
                <button
                    onClick={() => runPreset("Show pending cashouts")}
                    className="text-xs bg-white text-slate-600 hover:text-[#05DF72] hover:bg-emerald-50 border border-slate-200 hover:border-emerald-250 px-3.5 py-1.5 rounded-sm shrink-0 font-medium transition shadow-sm"
                >
                    💸 Payout Desk Stats
                </button>
                <button
                    onClick={() => runPreset("Explain what the disputes page does")}
                    className="text-xs bg-white text-slate-600 hover:text-[#05DF72] hover:bg-emerald-50 border border-slate-200 hover:border-emerald-250 px-3.5 py-1.5 rounded-sm shrink-0 font-medium transition shadow-sm"
                >
                    💡 Disputes Page Guide
                </button>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        placeholder="Ask the co-pilot (e.g. 'Check system status', 'Block user @email', 'Get verification code for Order GCY-...')"
                        className="flex-1 px-4 py-3 border border-slate-200 focus:border-[#05DF72]/40 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#05DF72]/20 transition placeholder-slate-400 bg-slate-50/50"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-100 disabled:text-slate-400 text-white p-3 px-5 rounded-sm font-bold text-sm transition flex items-center gap-1.5 shadow-sm"
                    >
                        <Send size={15} />
                        <span className="max-sm:hidden">Ask Co-pilot</span>
                    </button>
                </form>
            </div>

            {/* Page Guide Modal */}
            <AnimatePresence>
                {showGuideModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-sm w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Admin Portal Visual Guide</h3>
                                    <p className="text-xs text-slate-400 font-medium">Understand the components, metrics, and workflows on each page.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowGuideModal(false);
                                        setSelectedGuide(null);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-sm border border-slate-200 transition text-sm font-bold w-7 h-7 flex items-center justify-center"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 flex overflow-hidden max-md:flex-col">
                                {/* Left Sidebar Guide List */}
                                <div className="w-1/3 max-md:w-full border-r border-slate-200 overflow-y-auto p-4 space-y-1.5 bg-slate-50/50">
                                    {PAGE_GUIDES.map((guide, idx) => {
                                        const Icon = guide.icon;
                                        const isSelected = selectedGuide?.title === guide.title || (!selectedGuide && idx === 0);
                                        if (!selectedGuide && idx === 0) setSelectedGuide(guide);

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedGuide(guide)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-sm text-left transition ${
                                                    isSelected
                                                        ? 'bg-white text-[#05DF72] border border-slate-200 shadow-sm font-semibold'
                                                        : 'text-slate-600 hover:bg-white/50 border border-transparent'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-sm shrink-0 border ${
                                                    isSelected ? 'bg-emerald-50 border-emerald-200 text-[#05DF72]' : 'bg-slate-100 border-slate-200 text-slate-400'
                                                }`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-bold text-slate-900 truncate">{guide.title}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{guide.path}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Right Detail Panel */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                                    {selectedGuide && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-emerald-50 border border-emerald-250 text-[#05DF72] rounded-sm">
                                                    {React.createElement(selectedGuide.icon, { size: 24 })}
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-slate-800">{selectedGuide.title}</h4>
                                                    <p className="text-xs text-slate-400">Path: <code className="font-mono bg-slate-55 p-0.5 rounded-sm border border-slate-200 text-[#05DF72]">{selectedGuide.path}</code></p>
                                                </div>
                                            </div>

                                            <div>
                                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description & Purpose</h5>
                                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 border border-slate-200 rounded-sm">
                                                    {selectedGuide.description}
                                                </p>
                                            </div>

                                            <div>
                                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Core Metrics & Columns</h5>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {selectedGuide.keyMetrics.map((metric, index) => (
                                                        <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                                                            <Info size={14} className="text-[#05DF72]" />
                                                            <span className="text-xs font-semibold text-slate-700">{metric}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-200 flex justify-end">
                                                <button
                                                    onClick={() => {
                                                        setShowGuideModal(false);
                                                        runPreset(`Explain the ${selectedGuide.title} page details`);
                                                    }}
                                                    className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-sm transition shadow-sm uppercase tracking-wider"
                                                >
                                                    Ask AI Co-pilot for page analysis
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
