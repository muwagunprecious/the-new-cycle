'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react'

/**
 * ScheduleCalendar Component
 * Displays a weekly view of pickup slots or days
 * 
 * Props:
 * - onSelect: (selection) => void
 * - blockedDates: array of strings (ISO dates)
 * - mode: "slots" (default) or "days" (simple date picker)
 * - multiSelect: boolean (default false)
 * - preSelected: array of strings (for multi-select)
 */
const ScheduleCalendar = ({
    onSelect,
    blockedDates = [],
    mode = "slots",
    multiSelect = false,
    preSelected = []
}) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
    const [selectedItems, setSelectedItems] = useState(multiSelect ? preSelected : null)
    const [weekDays, setWeekDays] = useState([])

    // Generate Mon-Fri for the current week view
    useEffect(() => {
        const start = new Date(currentWeekStart)
        // Adjust to Monday of the current week if not already
        const day = start.getDay()
        const diff = start.getDate() - day + (day === 0 ? -6 : 1)
        const monday = new Date(start.setDate(diff))

        const days = []
        for (let i = 0; i < 5; i++) {
            const d = new Date(monday)
            d.setDate(monday.getDate() + i)
            days.push(d)
        }
        setWeekDays(days)
    }, [currentWeekStart])

    const handlePrevWeek = () => {
        const newDate = new Date(currentWeekStart)
        newDate.setDate(newDate.getDate() - 7)
        // Prevent going to past weeks (simple check: tomorrow's week)
        const minStartDate = new Date()
        minStartDate.setDate(minStartDate.getDate() - 7)
        if (newDate > minStartDate) {
            setCurrentWeekStart(newDate)
        }
    }

    const handleNextWeek = () => {
        const newDate = new Date(currentWeekStart)
        newDate.setDate(newDate.getDate() + 7)
        setCurrentWeekStart(newDate)
    }

    const isDateInPast = (date) => {
        const minDate = new Date()
        minDate.setDate(minDate.getDate() + 1) // 24h buffer
        minDate.setHours(0, 0, 0, 0)
        return date < minDate
    }

    const handleItemClick = (date, slot = null) => {
        const dateStr = date.toISOString().split('T')[0]
        if (isDateBlocked(date) || isDateInPast(date)) return

        if (multiSelect) {
            let newItems = [...(selectedItems || [])]
            const selection = slot ? `${dateStr}:${slot}` : dateStr

            if (newItems.includes(selection)) {
                newItems = newItems.filter(i => i !== selection)
            } else {
                newItems.push(selection)
            }
            setSelectedItems(newItems)
            onSelect(newItems)
        } else {
            const selection = slot ? { date: dateStr, slot } : { date: dateStr }
            setSelectedItems(selection)
            onSelect(selection)
        }
    }

    const isDateBlocked = (date) => {
        return blockedDates.includes(date.toISOString().split('T')[0])
    }

    const isSelected = (date, slot = null) => {
        const dateStr = date.toISOString().split('T')[0]
        if (multiSelect) {
            const selection = slot ? `${dateStr}:${slot}` : dateStr
            return selectedItems?.includes(selection)
        } else {
            if (slot) {
                return selectedItems?.date === dateStr && selectedItems?.slot === slot
            }
            return selectedItems?.date === dateStr
        }
    }

    return (
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 text-lg uppercase tracking-wider">
                    {weekDays[0]?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                    <button onClick={handlePrevWeek} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNextWeek} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weekDays.map((day, index) => {
                    const isBlocked = isDateBlocked(day)
                    const isPast = isDateInPast(day)
                    const isToday = new Date().toDateString() === day.toDateString()
                    const isDisabled = isBlocked || isPast

                    return (
                        <div key={index} className={`relative flex flex-col gap-3 p-4 rounded-2xl border transition-all ${isToday ? 'bg-green-50/50 border-green-100' : isDisabled ? 'bg-slate-50/50 border-slate-50' : 'bg-slate-50 border-slate-100'}`}>

                            {/* Date Header */}
                            <div className={`text-center mb-2 ${isDisabled ? 'opacity-30' : ''}`}>
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className={`text-xl font-black ${isToday ? 'text-[#05DF72]' : 'text-slate-800'}`}>
                                    {day.getDate()}
                                </span>
                            </div>

                            {mode === "slots" ? (
                                <>
                                    {/* Morning Slot */}
                                    <button
                                        onClick={() => handleItemClick(day, 'Morning')}
                                        disabled={isDisabled}
                                        className={`w-full py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all group
                                            ${isDisabled
                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-transparent'
                                                : isSelected(day, 'Morning')
                                                    ? 'bg-[#05DF72] text-white shadow-lg shadow-[#05DF72]/30 scale-105'
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#05DF72] hover:text-[#05DF72] hover:shadow-md'
                                            }
                                        `}
                                    >
                                        {isSelected(day, 'Morning') && <CheckCircle size={14} />}
                                        {isBlocked ? 'Full' : 'Morning'}
                                    </button>

                                    {/* Afternoon Slot */}
                                    <button
                                        onClick={() => handleItemClick(day, 'Afternoon')}
                                        disabled={isDisabled}
                                        className={`w-full py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all group
                                            ${isDisabled
                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-transparent'
                                                : isSelected(day, 'Afternoon')
                                                    ? 'bg-[#05DF72] text-white shadow-lg shadow-[#05DF72]/30 scale-105'
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#05DF72] hover:text-[#05DF72] hover:shadow-md'
                                            }
                                        `}
                                    >
                                        {isSelected(day, 'Afternoon') && <CheckCircle size={14} />}
                                        {isBlocked ? 'Full' : 'Afternoon'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleItemClick(day)}
                                    disabled={isDisabled}
                                    className={`w-full py-4 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all group
                                        ${isDisabled
                                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-transparent'
                                            : isSelected(day)
                                                ? 'bg-[#05DF72] text-white shadow-lg shadow-[#05DF72]/30'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:border-[#05DF72] hover:text-[#05DF72] hover:shadow-md'
                                        }
                                    `}
                                >
                                    {isSelected(day) ? <CheckCircle size={14} /> : <span>Select</span>}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border border-slate-300"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#05DF72]"></div>
                    <span>{multiSelect ? 'Selected' : 'Selected Slot'}</span>
                </div>
                {mode === "slots" && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                        <span>Fully Booked</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ScheduleCalendar
