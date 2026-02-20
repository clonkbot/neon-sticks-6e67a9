import { useState } from 'react'

interface UIProps {
  onUndo: () => void
  onSave: () => void
  onNew: () => void
  onAddStick: () => void
  canUndo: boolean
  stickCount: number
  vortexCount: number
}

export function UI({ onUndo, onSave, onNew, onAddStick, canUndo, stickCount, vortexCount }: UIProps) {
  const [showStats, setShowStats] = useState(true)

  return (
    <>
      {/* Control Panel - Bottom Right */}
      <div className="absolute bottom-16 right-4 md:bottom-8 md:right-6 flex flex-col gap-2 md:gap-3">
        <button
          onClick={onAddStick}
          className="group relative w-12 h-12 md:w-14 md:h-14 rounded-xl backdrop-blur-xl bg-lime-500/10 border border-lime-400/30
                     hover:bg-lime-500/20 hover:border-lime-400/60 hover:scale-110
                     active:scale-95 transition-all duration-300 flex items-center justify-center
                     shadow-lg shadow-lime-500/20"
          title="Add Stick"
        >
          <svg className="w-6 h-6 md:w-7 md:h-7 text-lime-400 group-hover:text-lime-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="absolute -left-20 md:-left-24 top-1/2 -translate-y-1/2 text-xs md:text-sm text-lime-400/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Add Stick
          </span>
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="group relative w-12 h-12 md:w-14 md:h-14 rounded-xl backdrop-blur-xl bg-cyan-500/10 border border-cyan-400/30
                     hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:scale-110
                     active:scale-95 transition-all duration-300 flex items-center justify-center
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-cyan-500/10
                     shadow-lg shadow-cyan-500/20"
          title="Undo"
        >
          <svg className="w-6 h-6 md:w-7 md:h-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span className="absolute -left-16 md:-left-20 top-1/2 -translate-y-1/2 text-xs md:text-sm text-cyan-400/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Undo
          </span>
        </button>

        <button
          onClick={onSave}
          className="group relative w-12 h-12 md:w-14 md:h-14 rounded-xl backdrop-blur-xl bg-magenta-500/10 border border-pink-400/30
                     hover:bg-pink-500/20 hover:border-pink-400/60 hover:scale-110
                     active:scale-95 transition-all duration-300 flex items-center justify-center
                     shadow-lg shadow-pink-500/20"
          title="Save"
        >
          <svg className="w-6 h-6 md:w-7 md:h-7 text-pink-400 group-hover:text-pink-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span className="absolute -left-14 md:-left-16 top-1/2 -translate-y-1/2 text-xs md:text-sm text-pink-400/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Save
          </span>
        </button>

        <button
          onClick={onNew}
          className="group relative w-12 h-12 md:w-14 md:h-14 rounded-xl backdrop-blur-xl bg-orange-500/10 border border-orange-400/30
                     hover:bg-orange-500/20 hover:border-orange-400/60 hover:scale-110
                     active:scale-95 transition-all duration-300 flex items-center justify-center
                     shadow-lg shadow-orange-500/20"
          title="New Game"
        >
          <svg className="w-6 h-6 md:w-7 md:h-7 text-orange-400 group-hover:text-orange-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="absolute -left-20 md:-left-24 top-1/2 -translate-y-1/2 text-xs md:text-sm text-orange-400/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            New Game
          </span>
        </button>
      </div>

      {/* Stats Panel - Top Right */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <button
          onClick={() => setShowStats(!showStats)}
          className="backdrop-blur-xl bg-black/40 border border-cyan-500/20 rounded-xl p-3 md:p-4
                     hover:border-cyan-400/40 transition-all duration-300 cursor-pointer"
        >
          {showStats ? (
            <div className="text-right">
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <span className="text-cyan-500/50 text-xs" style={{ fontFamily: 'Rajdhani, sans-serif' }}>STICKS</span>
                <span className="text-cyan-300 text-lg md:text-2xl font-bold tabular-nums" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {stickCount.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-pink-500/50 text-xs" style={{ fontFamily: 'Rajdhani, sans-serif' }}>VORTEX</span>
                <span className="text-pink-300 text-lg md:text-2xl font-bold tabular-nums" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {vortexCount.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-cyan-400 text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              STATS
            </div>
          )}
        </button>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 md:top-6 pointer-events-none">
        <h1
          className="text-xl md:text-3xl lg:text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-orange-400"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          NEON STICKS
        </h1>
        <p
          className="text-center text-[10px] md:text-xs text-cyan-500/50 tracking-widest mt-1"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          CROSS · TRUNCATE · CREATE VORTEX
        </p>
      </div>
    </>
  )
}
