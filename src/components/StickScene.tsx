import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Stick } from '../App'

interface StickSceneProps {
  sticks: Stick[]
  selectedStickId: string | null
  onStickUpdate: (id: string, start: [number, number, number], end: [number, number, number]) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onIntersection: (stickAId: string, stickBId: string, point: [number, number, number]) => void
}

interface StickMeshProps {
  stick: Stick
  isSelected: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onStickUpdate: (id: string, start: [number, number, number], end: [number, number, number]) => void
}

function StickMesh({ stick, isSelected, onDragStart, onDragEnd, onStickUpdate }: StickMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<THREE.Vector3 | null>(null)
  const stickStartRef = useRef<{ start: [number, number, number], end: [number, number, number] } | null>(null)

  const { camera, gl, raycaster } = useThree()

  // Calculate stick geometry
  const { position, quaternion, length } = useMemo(() => {
    const startVec = new THREE.Vector3(...stick.start)
    const endVec = new THREE.Vector3(...stick.end)
    const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
    const direction = new THREE.Vector3().subVectors(endVec, startVec)
    const len = direction.length()

    // Create quaternion to rotate from Y-axis to direction
    const quat = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    quat.setFromUnitVectors(up, direction.normalize())

    return { position: midpoint, quaternion: quat, length: len }
  }, [stick.start, stick.end])

  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8
      const targetIntensity = hovered || isSelected ? 1.5 : pulse

      if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
        glowRef.current.material.opacity = THREE.MathUtils.lerp(
          glowRef.current.material.opacity,
          (hovered || isSelected ? 0.4 : 0.2) * pulse,
          0.1
        )
      }

      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetIntensity, 0.1))
    }
  })

  const getWorldPosition = useCallback((event: ThreeEvent<PointerEvent>): THREE.Vector3 => {
    const pointer = new THREE.Vector2(
      (event.nativeEvent.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(event.nativeEvent.clientY / gl.domElement.clientHeight) * 2 + 1
    )

    raycaster.setFromCamera(pointer, camera)

    // Project onto a plane facing the camera
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const intersectPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersectPoint)

    return intersectPoint
  }, [camera, gl, raycaster])

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    ;(event.target as HTMLElement)?.setPointerCapture?.(event.nativeEvent.pointerId)

    setIsDragging(true)
    onDragStart(stick.id)

    dragStartRef.current = getWorldPosition(event)
    stickStartRef.current = { start: [...stick.start] as [number, number, number], end: [...stick.end] as [number, number, number] }
  }, [stick.id, stick.start, stick.end, onDragStart, getWorldPosition])

  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !dragStartRef.current || !stickStartRef.current) return

    event.stopPropagation()

    const currentPos = getWorldPosition(event)
    const delta = currentPos.clone().sub(dragStartRef.current)

    const newStart: [number, number, number] = [
      stickStartRef.current.start[0] + delta.x,
      stickStartRef.current.start[1] + delta.y,
      stickStartRef.current.start[2]
    ]
    const newEnd: [number, number, number] = [
      stickStartRef.current.end[0] + delta.x,
      stickStartRef.current.end[1] + delta.y,
      stickStartRef.current.end[2]
    ]

    onStickUpdate(stick.id, newStart, newEnd)
  }, [isDragging, stick.id, onStickUpdate, getWorldPosition])

  const handlePointerUp = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    ;(event.target as HTMLElement)?.releasePointerCapture?.(event.nativeEvent.pointerId)

    setIsDragging(false)
    dragStartRef.current = null
    stickStartRef.current = null
    onDragEnd()
  }, [onDragEnd])

  return (
    <group position={position} quaternion={quaternion}>
      {/* Glow outer */}
      <mesh ref={glowRef} scale={[1.8, 1, 1.8]}>
        <cylinderGeometry args={[stick.thickness * 2, stick.thickness * 2, length, 8]} />
        <meshBasicMaterial color={stick.color} transparent opacity={0.2} />
      </mesh>

      {/* Main stick */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false) }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        castShadow
      >
        <cylinderGeometry args={[stick.thickness, stick.thickness, length, 16]} />
        <meshStandardMaterial
          color={stick.color}
          emissive={stick.color}
          emissiveIntensity={hovered || isSelected ? 0.8 : 0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* End caps */}
      <mesh position={[0, length / 2, 0]}>
        <sphereGeometry args={[stick.thickness, 16, 16]} />
        <meshStandardMaterial
          color={stick.color}
          emissive={stick.color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, -length / 2, 0]}>
        <sphereGeometry args={[stick.thickness, 16, 16]} />
        <meshStandardMaterial
          color={stick.color}
          emissive={stick.color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

// Line intersection check (simplified 2D check on XY plane with Z tolerance)
function checkLineIntersection(
  a1: [number, number, number],
  a2: [number, number, number],
  b1: [number, number, number],
  b2: [number, number, number]
): [number, number, number] | null {
  const x1 = a1[0], y1 = a1[1]
  const x2 = a2[0], y2 = a2[1]
  const x3 = b1[0], y3 = b1[1]
  const x4 = b2[0], y4 = b2[1]

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(denom) < 0.0001) return null // Parallel

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  if (t > 0.1 && t < 0.9 && u > 0.1 && u < 0.9) {
    const intersectX = x1 + t * (x2 - x1)
    const intersectY = y1 + t * (y2 - y1)

    // Check Z proximity
    const zA = a1[2] + t * (a2[2] - a1[2])
    const zB = b1[2] + u * (b2[2] - b1[2])

    if (Math.abs(zA - zB) < 0.8) {
      return [intersectX, intersectY, (zA + zB) / 2]
    }
  }

  return null
}

export function StickScene({
  sticks,
  selectedStickId,
  onStickUpdate,
  onDragStart,
  onDragEnd,
  onIntersection
}: StickSceneProps) {
  const lastIntersectionRef = useRef<{ ids: string[], time: number } | null>(null)

  // Check for intersections when selected stick moves
  useFrame(() => {
    if (!selectedStickId) return

    const selectedStick = sticks.find(s => s.id === selectedStickId)
    if (!selectedStick) return

    const now = Date.now()
    if (lastIntersectionRef.current && now - lastIntersectionRef.current.time < 500) {
      return
    }

    for (const otherStick of sticks) {
      if (otherStick.id === selectedStickId) continue

      const intersection = checkLineIntersection(
        selectedStick.start,
        selectedStick.end,
        otherStick.start,
        otherStick.end
      )

      if (intersection) {
        const ids = [selectedStick.id, otherStick.id].sort()
        if (
          lastIntersectionRef.current &&
          lastIntersectionRef.current.ids[0] === ids[0] &&
          lastIntersectionRef.current.ids[1] === ids[1]
        ) {
          continue
        }

        lastIntersectionRef.current = { ids, time: now }
        onIntersection(selectedStick.id, otherStick.id, intersection)
        break
      }
    }
  })

  return (
    <group>
      {sticks.map(stick => (
        <StickMesh
          key={stick.id}
          stick={stick}
          isSelected={stick.id === selectedStickId}
          onStickUpdate={onStickUpdate}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </group>
  )
}
