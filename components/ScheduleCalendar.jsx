'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'

/**
 * ScheduleCalendar Component
 * Displays a weekly view of pickup slots
 * 
 * Props:
 * - onSelect: (date, slot) => void
 * - blockedDates: array of strings (ISO dates)
 */
const ScheduleCalendar = ({ onSelect, blockedDates = [] }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
    const [selectedSlot, setSelectedSlot] = useState(null)
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
        // Prevent going to past weeks (simple check)
        if (newDate > new Date().setDate(new Date().getDate() - 7)) {
            setCurrentWeekStart(newDate)
        }
    }

    const handleNextWeek = () => {
        const newDate = new Date(currentWeekStart)
        newDate.setDate(newDate.getDate() + 7)
        setCurrentWeekStart(newDate)
    }

    const handleSlotClick = (date, timeSlot) => {
        const dateStr = date.toISOString().split('T')[0]
        const isBlocked = blockedDates.includes(dateStr)

        if (isBlocked) return

        const newSelection = { date: dateStr, slot: timeSlot }
        setSelectedSlot(newSelection)
        onSelect(newSelection)
    }

    const isDateBlocked = (date) => {
        return blockedDates.includes(date.toISOString().split('T')[0])
    }

    const isSelected = (date, slot) => {
        return selectedSlot?.date === date.toISOString().split('T')[0] && selectedSlot?.slot === slot
    }

    return (
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 text-lg">
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
                    const dateStr = day.toISOString().split('T')[0]
                    const isBlocked = isDateBlocked(day)
                    const isToday = new Date().toDateString() === day.toDateString()

                    return (
                        <div key={index} className={`relative flex flex-col gap-3 p-4 rounded-2xl border transition-all ${isToday ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>

                            {/* Date Header */}
                            <div className="text-center mb-2">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className={`text-xl font-black ${isToday ? 'text-[#05DF72]' : 'text-slate-800'}`}>
                                    {day.getDate()}
                                </span>
                            </div>

                            {/* Morning Slot */}
                            <button
                                onClick={() => handleSlotClick(day, 'Morning')}
                                disabled={isBlocked}
                                className={`w-full py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all group
                                    ${isBlocked
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-transparent'
                                        : isSelected(day, 'Morning')
                                            ? 'bg-[#05DF72] text-white shadow-lg shadow-[#05DF72]/30 scale-105'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-[#05DF72] hover:text-[#05DF72] hover:shadow-md'
                                    }
                                `}
                            >
                                {isSelected(day, 'Morning') && <CheckCircle2 size={14} />}
                                {isBlocked ? 'Booked' : 'Morning'}
                            </button>

                            {/* Afternoon Slot */}
                            <button
                                onClick={() => handleSlotClick(day, 'Afternoon')}
                                disabled={isBlocked}
                                className={`w-full py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all group
                                    ${isBlocked
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-transparent'
                                        : isSelected(day, 'Afternoon')
                                            ? 'bg-[#05DF72] text-white shadow-lg shadow-[#05DF72]/30 scale-105'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-[#05DF72] hover:text-[#05DF72] hover:shadow-md'
                                    }
                                `}
                            >
                                {isSelected(day, 'Afternoon') && <CheckCircle2 size={14} />}
                                {isBlocked ? 'Booked' : 'Afternoon'}
                            </button>

                            {/* Mobile visual cue for blocked */}
                            {isBlocked && (
                                <div className="absolute inset-0 bg-slate-50/50 rounded-2xl md:hidden pointer-events-none flex items-center justify-center">
                                    <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full opacity-80">Full</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border border-slate-300"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#05DF72]"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <span>Booked</span>
                </div>
            </div>
        </div>
    )
}

export default ScheduleCalendar
