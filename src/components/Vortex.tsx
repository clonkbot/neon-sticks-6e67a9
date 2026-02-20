import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface VortexProps {
  position: [number, number, number]
  color: string
  age: number
}

export function Vortex({ position, color, age }: VortexProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const particlesRef = useRef<THREE.Points>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)

  const particleCount = 60
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const colorObj = new THREE.Color(color)

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const radius = 0.3 + Math.random() * 0.5
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.sin(angle) * radius
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3

      colors[i * 3] = colorObj.r
      colors[i * 3 + 1] = colorObj.g
      colors[i * 3 + 2] = colorObj.b
    }

    return { positions, colors }
  }, [color])

  useFrame((state) => {
    if (!groupRef.current) return

    const opacity = Math.max(0, 1 - age)
    const scale = 0.5 + age * 2

    groupRef.current.scale.setScalar(scale)
    groupRef.current.rotation.z = state.clock.elapsedTime * 2

    if (particlesRef.current && particlesRef.current.material instanceof THREE.PointsMaterial) {
      particlesRef.current.material.opacity = opacity * 0.8
    }

    if (ringRef.current && ringRef.current.material instanceof THREE.MeshBasicMaterial) {
      ringRef.current.material.opacity = opacity * 0.5
    }

    // Animate particle positions - spiral inward
    const posArray = particlesRef.current?.geometry.attributes.position?.array as Float32Array
    if (posArray) {
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + state.clock.elapsedTime * 3
        const radius = (0.3 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2) * (1 - age * 0.5)
        posArray[i * 3] = Math.cos(angle) * radius
        posArray[i * 3 + 1] = Math.sin(angle) * radius
        posArray[i * 3 + 2] = Math.sin(state.clock.elapsedTime * 5 + i * 0.5) * 0.2
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  if (age >= 1) return null

  return (
    <group ref={groupRef} position={position}>
      {/* Central core */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={Math.max(0, 1 - age)} />
      </mesh>

      {/* Spinning ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.02, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Inner ring */}
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <torusGeometry args={[0.25, 0.015, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          transparent
          opacity={0.8}
          vertexColors
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Light source */}
      <pointLight color={color} intensity={2 * (1 - age)} distance={3} />
    </group>
  )
}
