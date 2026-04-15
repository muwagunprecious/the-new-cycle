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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* State Selector (Locked to Lagos) */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
          State
        </label>
        <div className="relative group">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
          <select
            required
            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-xl focus:shadow-emerald-500/5 font-bold text-slate-950 text-lg appearance-none cursor-pointer"
            value={selectedState || 'Lagos'}
            onChange={(e) => onStateChange(e.target.value)}
          >
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* LGA Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
          Local Government Area
        </label>
        <div className="relative group">
          <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${selectedLga ? 'text-emerald-500' : 'text-slate-400'}`} size={18} />
          <select
            required
            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-xl focus:shadow-emerald-500/5 font-bold text-slate-950 text-lg appearance-none cursor-pointer"
            value={selectedLga}
            onChange={(e) => onLgaChange(e.target.value)}
          >
            <option value="" disabled>-- Select LGA --</option>
            {lgas.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        </div>
      </div>
    </div>
  )
}

export default LocationSelector
