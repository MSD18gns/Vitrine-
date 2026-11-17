// Rendu 3D de Mahmoud (React Three Fiber 8 + Drei 9). Chargé à la demande par <Mahmoud />.
// Couches indépendantes :
//   corps   : boucle de fond (Idle / Talk / Listen / Think) + gestes ponctuels en fondu
//   visage  : expression (lissée) + visèmes de parole + clignements + micro-mouvements des yeux
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { EXPRESSIONS } from './behavior'
import { outfit } from './outfits'

const FACE_KEYS = ['Smile', 'Sad', 'BrowUp', 'BrowFrown', 'BrowSad', 'MouthOpen', 'MouthWide', 'MouthRound', 'MouthClosed', 'Blink']
const LOOPS = ['Idle', 'Talk', 'Listen', 'Think']

function Env() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl)
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = tex; scene.environmentIntensity = 0.55
    return () => { scene.environment = null; tex.dispose(); pm.dispose() }
  }, [gl, scene])
  return null
}

function Character({ url, behavior, live, reducedMotion, onReady }) {
  const { scene, animations } = useGLTF(url, false, true)
  const root = useMemo(() => cloneSkinned(scene), [scene])
  const state = useRef({ expr: {}, cur: {}, blinkT: 2, blink: 0, gazeT: 1, gaze: [0, 0], gazeCur: [0, 0] })

  const rig = useMemo(() => {
    const mixer = new THREE.AnimationMixer(root)
    const actions = Object.fromEntries(animations.map((c) => [c.name, mixer.clipAction(c)]))
    const morphs = []
    root.traverse((o) => {
      if (o.isMesh) { o.frustumCulled = false; if (o.morphTargetDictionary) morphs.push(o) }
    })
    const eyes = ['eye.L', 'eye.R', 'eyeL', 'eyeR'].map((n) => root.getObjectByName(n)).filter(Boolean)
    return { mixer, actions, morphs, eyes, eyeRest: eyes.map((e) => e.quaternion.clone()) }
  }, [root, animations])

  // corps : boucle de fond + gestes
  useEffect(() => {
    const { mixer, actions } = rig
    let base = actions.Idle; base?.play()
    let gesture = null
    const setLoop = (name) => {
      const next = actions[reducedMotion && name !== 'Idle' ? 'Idle' : name] || actions.Idle
      if (!next || next === base) return
      if (!gesture) { next.reset().fadeIn(0.5).play(); base?.fadeOut(0.5) } else next.reset().play().setEffectiveWeight(0)
      base = next
    }
    const play = (name) => {
      const a = actions[name]
      if (!a || reducedMotion || LOOPS.includes(name)) return name && LOOPS.includes(name) && setLoop(name)
      if (gesture && gesture !== a) gesture.fadeOut(0.25)
      a.reset(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true
      a.fadeIn(0.3).play(); base?.fadeOut(0.3)
      gesture = a
    }
    const onFinished = (e) => {
      if (e.action !== gesture) return
      gesture.fadeOut(0.45); base.enabled = true; base.reset().fadeIn(0.45).play(); gesture = null
    }
    mixer.addEventListener('finished', onFinished)
    const unsub = behavior.subscribe((r) => {
      if (r.expr) state.current.expr = EXPRESSIONS[r.expr] || {}
      if (r.loop) setLoop(r.loop)
      if (r.gesture) play(r.gesture)
    })
    onReady?.()
    return () => { unsub(); mixer.removeEventListener('finished', onFinished); mixer.stopAllAction() }
  }, [rig, behavior, reducedMotion, onReady])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1)
    const s = state.current
    rig.mixer.update(dt)

    // clignements naturels (intervalle variable, parfois double)
    s.blinkT -= dt
    if (s.blinkT <= 0) { s.blink = 0.001; s.blinkT = 2.4 + Math.random() * 3.6; if (Math.random() < 0.15) s.double = true }
    let blinkW = 0
    if (s.blink > 0) {
      s.blink += dt
      const t = s.blink / 0.17
      blinkW = t < 0.5 ? t * 2 : Math.max(0, 2 - t * 2)
      if (t >= 1) { s.blink = 0; if (s.double) { s.double = false; s.blinkT = 0.12 } }
    }

    // visage : expression + visèmes (live.visemes est mis à jour par la voix hors rendu React)
    const target = { ...s.expr }
    const vis = live.current.visemes || {}
    for (const k in vis) target[k] = (target[k] || 0) + vis[k]
    if (vis.MouthOpen || vis.MouthRound) target.Smile = (target.Smile || 0) * 0.5
    target.Blink = blinkW
    for (const k of FACE_KEYS) {
      const goal = Math.min(1, target[k] || 0)
      const speed = k === 'Blink' ? 1 : k.startsWith('Mouth') ? 0.55 : 0.12
      s.cur[k] = k === 'Blink' ? goal : (s.cur[k] || 0) + (goal - (s.cur[k] || 0)) * Math.min(1, speed * dt * 60)
    }
    for (const m of rig.morphs) {
      const d = m.morphTargetDictionary
      for (const k in d) if (k in s.cur) m.morphTargetInfluences[d[k]] = s.cur[k]
    }

    // regard : petits déplacements des yeux, calmes (après le mixer pour ne pas être écrasés)
    s.gazeT -= dt
    if (s.gazeT <= 0) { s.gazeT = 1.2 + Math.random() * 2.8; s.gaze = Math.random() < 0.55 ? [0, 0] : [(Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.12] }
    s.gazeCur[0] += (s.gaze[0] - s.gazeCur[0]) * Math.min(1, dt * 12)
    s.gazeCur[1] += (s.gaze[1] - s.gazeCur[1]) * Math.min(1, dt * 12)
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(s.gazeCur[1], 0, s.gazeCur[0]))
    rig.eyes.forEach((e, i) => e.quaternion.copy(rig.eyeRest[i]).multiply(q))
  })

  return <primitive object={root} />
}

const FRAMING = {
  buste: { target: [0, 1.42, 0], pos: [0, 1.47, 1.55], fov: 26 },
  visage: { target: [0, 1.53, 0], pos: [0, 1.55, 0.8], fov: 28 },
  pied: { target: [0, 0.9, 0], pos: [0, 1.05, 4.3], fov: 28 },
}

function Camera({ framing }) {
  const { camera } = useThree()
  useEffect(() => {
    const f = FRAMING[framing] || FRAMING.buste
    camera.position.set(...f.pos); camera.fov = f.fov; camera.lookAt(...f.target); camera.updateProjectionMatrix()
  }, [camera, framing])
  return null
}

export default function Mahmoud3D({ outfitId, behavior, live, active = true, framing = 'buste', reducedMotion = false, onReady }) {
  const url = outfit(outfitId).glb
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: FRAMING.buste.pos, fov: 26, near: 0.05, far: 30 }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}
      style={{ touchAction: 'pan-y' }}
      aria-hidden="true"
    >
      <Camera framing={framing} />
      <Env />
      <directionalLight position={[-1.5, 2.5, 3]} intensity={2.2} color="#fff4e6" />
      <directionalLight position={[2, 2, -2]} intensity={1.2} color="#bfffe0" />
      <hemisphereLight args={['#ffffff', '#2a4a3a', 0.6]} />
      <Suspense fallback={null}>
        <Character url={url} behavior={behavior} live={live} reducedMotion={reducedMotion} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}

export const preloadMahmoud = (outfitId) => useGLTF.preload(outfit(outfitId).glb, false, true)
