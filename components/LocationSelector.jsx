'use client'
import { useState, useEffect, useMemo } from 'react'
import { MapPin, ChevronDown, Loader2, AlertCircle } from 'lucide-react'

/**
 * PRODUCTION-GRADE NIGERIAN LOCATION SELECTOR
 * Features:
 * - Async State/LGA fetching with Error Handling
 * - 24h localStorage Caching for State list
 * - In-memory Caching for LGA results
 * - Premium SaaS UI with loading states
 */

const CACHE_KEY = 'gocycle_nigeria_states'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

const LocationSelector = ({ selectedState, selectedLga, onStateChange, onLgaChange, error }) => {
  const [states, setStates] = useState([])
  const [lgas, setLgas] = useState([])
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isLoadingLgas, setIsLoadingLgas] = useState(false)
  const [apiError, setApiError] = useState(null)

  // In-memory cache for LGAs to prevent redundant network calls within a session
  const [lgaCache, setLgaCache] = useState({})

  // Fetch States on mount
  useEffect(() => {
    const fetchStates = async () => {
      // 1. Check LocalStorage Cache
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData)
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setStates(data)
          return
        }
      }

      // 2. Fetch from API
      setIsLoadingStates(true)
      setApiError(null)
      try {
        const response = await fetch('https://nga-states-lga.onrender.com/fetch')
        if (!response.ok) throw new Error('API unreachable')
        const data = await response.json()
        
        // Update state and cache
        setStates(data)
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
        }))
      } catch (err) {
        console.error('State Fetch Error:', err)
        setApiError('Failed to load locations. Using default.')
        // Fallback to essential states if API fails
        setStates(['Lagos', 'Abuja (FCT)', 'Ogun', 'Oyo', 'Rivers', 'Kano'])
      } finally {
        setIsLoadingStates(false)
      }
    }

    fetchStates()
  }, [])

  // Fetch LGAs when state changes
  useEffect(() => {
    if (!selectedState) {
      setLgas([])
      return
    }

    const fetchLgas = async () => {
      // Check in-memory cache
      if (lgaCache[selectedState]) {
        setLgas(lgaCache[selectedState])
        return
      }

      setIsLoadingLgas(true)
      try {
        const response = await fetch(`https://nga-states-lga.onrender.com/fetch?state=${selectedState}`)
        if (!response.ok) throw new Error('LGA fetch failed')
        const data = await response.json()

        setLgas(data)
        setLgaCache(prev => ({ ...prev, [selectedState]: data }))
      } catch (err) {
        console.error('LGA Fetch Error:', err)
        setLgas([])
      } finally {
        setIsLoadingLgas(false)
      }
    }

    fetchLgas()
  }, [selectedState, lgaCache])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* State Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
          State {isLoadingStates && <Loader2 className="animate-spin text-emerald-500" size={10} />}
        </label>
        <div className="relative group">
          <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${selectedState ? 'text-emerald-500' : 'text-slate-400'}`} size={18} />
          <select
            required
            disabled={isLoadingStates}
            className={`w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-xl focus:shadow-emerald-500/5 font-bold text-slate-950 text-lg appearance-none cursor-pointer ${isLoadingStates ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={selectedState}
            onChange={(e) => {
              onStateChange(e.target.value)
              onLgaChange('') // Reset LGA when state changes
            }}
          >
            <option value="" disabled>-- Select State --</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* LGA Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
          Local Government Area {isLoadingLgas && <Loader2 className="animate-spin text-emerald-500" size={10} />}
        </label>
        <div className="relative group">
          <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${selectedLga ? 'text-emerald-500' : 'text-slate-400'}`} size={18} />
          <select
            required
            disabled={!selectedState || isLoadingLgas}
            className={`w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-xl focus:shadow-emerald-500/5 font-bold text-slate-950 text-lg appearance-none cursor-pointer ${(!selectedState || isLoadingLgas) ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={selectedLga}
            onChange={(e) => onLgaChange(e.target.value)}
          >
            <option value="" disabled>{!selectedState ? 'Select state first' : '-- Select LGA --'}</option>
            {lgas.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        </div>
      </div>

      {apiError && (
        <div className="col-span-full flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200 mt-2">
          <AlertCircle size={14} />
          {apiError}
        </div>
      )}
    </div>
  )
}

export default LocationSelector
