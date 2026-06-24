'use client'
import { useState, useEffect } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { lagosLGAs } from '@/assets/assets'

/**
 * SIMPLIFIED LOCATION SELECTOR (LAGOS ONLY)
 * Features:
 * - Restricted to Lagos as per business requirements
 * - Instant LGA population using static assets
 * - High-speed, zero-network dependency for maximum reliability
 */

const LocationSelector = ({ selectedState, selectedLga, onStateChange, onLgaChange, error }) => {
  // Hardcoded to Lagos only
  const states = ['Lagos']
  const [lgas, setLgas] = useState(lagosLGAs)

  // Ensure Lagos is always selected if not already
  useEffect(() => {
    if (selectedState !== 'Lagos') {
      onStateChange('Lagos')
    }
    setLgas(lagosLGAs)
  }, [selectedState, onStateChange])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-550">
      {/* State Selector (Locked to Lagos) */}
      <div className="space-y-1">
        <label className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider block">
          State
        </label>
        <div className="relative group">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#05DF72] transition-colors" size={13} />
          <select
            required
            className="w-full bg-[#111625] border border-slate-700 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-10 outline-none transition-all text-white text-xs appearance-none cursor-pointer"
            value={selectedState || 'Lagos'}
            onChange={(e) => onStateChange(e.target.value)}
          >
            {states.map(s => <option key={s} value={s} className="bg-[#111625] text-white">{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={13} />
        </div>
      </div>

      {/* LGA Selector */}
      <div className="space-y-1">
        <label className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider block">
          Local Government Area
        </label>
        <div className="relative group">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#05DF72] transition-colors" size={13} />
          <select
            required
            className="w-full bg-[#111625] border border-slate-700 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-10 outline-none transition-all text-white text-xs appearance-none cursor-pointer"
            value={selectedLga}
            onChange={(e) => onLgaChange(e.target.value)}
          >
            <option value="" disabled className="bg-[#111625] text-slate-500">-- Select LGA --</option>
            {lgas.map(l => <option key={l} value={l} className="bg-[#111625] text-white">{l}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={13} />
        </div>
      </div>
    </div>
  )
}

export default LocationSelector
