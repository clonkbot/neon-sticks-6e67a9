import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stars } from '@react-three/drei'
import { Suspense, useState, useCallback, useRef, useEffect } from 'react'
import { StickScene } from './components/StickScene'
import { Vortex } from './components/Vortex'
import { UI } from './components/UI'

export interface Stick {
  id: string
  start: [number, number, number]
  end: [number, number, number]
  color: string
  thickness: number
}

export interface VortexPoint {
  id: string
  position: [number, number, number]
  color: string
  createdAt: number
}

const COLORS = ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00', '#ff4488', '#88ff44', '#4488ff', '#ff8844']

function generateRandomStick(): Stick {
  const length = 1.5 + Math.random() * 3
  const angle = Math.random() * Math.PI * 2
  const tilt = (Math.random() - 0.5) * Math.PI * 0.5
  const centerX = (Math.random() - 0.5) * 6
  const centerY = (Math.random() - 0.5) * 4
  const centerZ = (Math.random() - 0.5) * 2

  const dx = Math.cos(angle) * Math.cos(tilt) * length / 2
  const dy = Math.sin(angle) * Math.cos(tilt) * length / 2
  const dz = Math.sin(tilt) * length / 2

  return {
    id: crypto.randomUUID(),
    start: [centerX - dx, centerY - dy, centerZ - dz],
    end: [centerX + dx, centerY + dy, centerZ + dz],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    thickness: 0.05 + Math.random() * 0.08
  }
}

function generateInitialSticks(count: number): Stick[] {
  return Array.from({ length: count }, generateRandomStick)
}

export default function App() {
  const [sticks, setSticks] = useState<Stick[]>(() => generateInitialSticks(12))
  const [vortexes, setVortexes] = useState<VortexPoint[]>([])
  const [history, setHistory] = useState<Stick[][]>([])
  const [selectedStickId, setSelectedStickId] = useState<string | null>(null)

  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev, sticks])
  }, [sticks])

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const previousState = history[history.length - 1]
      setSticks(previousState)
      setHistory(prev => prev.slice(0, -1))
    }
  }, [history])

  const handleSave = useCallback(() => {
    const data = JSON.stringify({ sticks, vortexes }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pickup-sticks-save.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [sticks, vortexes])

  const handleNew = useCallback(() => {
    saveToHistory()
    setSticks(generateInitialSticks(12))
    setVortexes([])
  }, [saveToHistory])

  const handleAddStick = useCallback(() => {
    saveToHistory()
    setSticks(prev => [...prev, generateRandomStick()])
  }, [saveToHistory])

  const handleStickUpdate = useCallback((id: string, newStart: [number, number, number], newEnd: [number, number, number]) => {
    setSticks(prev => prev.map(s => s.id === id ? { ...s, start: newStart, end: newEnd } : s))
  }, [])

  const handleDragStart = useCallback((id: string) => {
    saveToHistory()
    setSelectedStickId(id)
  }, [saveToHistory])

  const handleDragEnd = useCallback(() => {
    setSelectedStickId(null)
  }, [])

  const createVortex = useCallback((position: [number, number, number], color: string) => {
    const newVortex: VortexPoint = {
      id: crypto.randomUUID(),
      position,
      color,
      createdAt: Date.now()
    }
    setVortexes(prev => [...prev, newVortex])
  }, [])

  const handleIntersection = useCallback((
    stickAId: string,
    stickBId: string,
    intersectionPoint: [number, number, number]
  ) => {
    saveToHistory()

    setSticks(prev => {
      const stickA = prev.find(s => s.id === stickAId)
      const stickB = prev.find(s => s.id === stickBId)

      if (!stickA || !stickB) return prev

      // Truncate both sticks at the intersection
      const truncatedA: Stick = {
        ...stickA,
        end: intersectionPoint
      }

      const truncatedB: Stick = {
        ...stickB,
        end: intersectionPoint
      }

      createVortex(intersectionPoint, stickA.color)

      return prev.map(s => {
        if (s.id === stickAId) return truncatedA
        if (s.id === stickBId) return truncatedB
        return s
      })
    })
  }, [saveToHistory, createVortex])

  // Clean up old vortexes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setVortexes(prev => prev.filter(v => now - v.createdAt < 10000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        shadows
        style={{ touchAction: 'none' }}
      >
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 15, 30]} />

        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
        <pointLight position={[-10, -10, 5]} intensity={0.8} color="#ff00ff" />
        <pointLight position={[0, 10, -10]} intensity={0.6} color="#00ff88" />

        <Suspense fallback={null}>
          <Stars radius={50} depth={50} count={2000} factor={3} saturation={0.5} fade speed={0.5} />

          <StickScene
            sticks={sticks}
            selectedStickId={selectedStickId}
            onStickUpdate={handleStickUpdate}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onIntersection={handleIntersection}
          />

          {vortexes.map(vortex => (
            <Vortex
              key={vortex.id}
              position={vortex.position}
              color={vortex.color}
              age={(Date.now() - vortex.createdAt) / 10000}
            />
          ))}
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          enablePan={true}
          enableZoom={true}
          minDistance={3}
          maxDistance={25}
          touches={{ ONE: 0, TWO: 2 }}
        />
      </Canvas>

      <UI
        onUndo={handleUndo}
        onSave={handleSave}
        onNew={handleNew}
        onAddStick={handleAddStick}
        canUndo={history.length > 0}
        stickCount={sticks.length}
        vortexCount={vortexes.length}
      />

      {/* Instructions */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 pointer-events-none">
        <div className="backdrop-blur-xl bg-black/40 border border-cyan-500/20 rounded-xl p-3 md:p-4 max-w-[200px] md:max-w-xs">
          <h2 className="text-cyan-400 font-bold text-sm md:text-base mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            HOW TO PLAY
          </h2>
          <ul className="text-cyan-100/70 text-xs md:text-sm space-y-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <li>• Drag sticks to move them</li>
            <li>• Cross two sticks to truncate</li>
            <li>• Vortexes form at intersections</li>
            <li>• Orbit: drag background</li>
            <li>• Zoom: scroll/pinch</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
        <p className="text-[10px] md:text-xs text-cyan-500/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Requested by @simplify3 · Built by @clonkbot
        </p>
      </footer>
    </div>
  )
}
