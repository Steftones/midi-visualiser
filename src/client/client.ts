import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import * as Tone from 'tone'

// base shapes to render
import { Sphere, Cube } from './base-shapes'

// speeds up rotation
export let nitro = 0

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export const scene = new THREE.Scene()

// initial setup
const camera = new THREE.PerspectiveCamera(
  75, // FOV
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 2
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// allows you to control the cube with the mouse
const orbitControls = new OrbitControls(camera, renderer.domElement)
// orbitControls.autoRotate = true
// orbitControls.autoRotateSpeed = 40

// adding a background colour
scene.background = new THREE.Color('orange')

// resize 3d view on the canvas
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

// ? ----- line objects -----
const material = new THREE.LineBasicMaterial({
  color: 'black',
  linewidth: 10,
  linecap: 'round',
  linejoin: 'bevel'
})

const points = []
points.push(new THREE.Vector3(-100, 0, 0))
points.push(new THREE.Vector3(0, 0, 0))
points.push(new THREE.Vector3(0, 0.1, 1))
points.push(new THREE.Vector3(100, 0, 1))
points.push(new THREE.Vector3(100, 0, 1))

const geometry = new THREE.BufferGeometry().setFromPoints( points )
const line = new THREE.Line( geometry, material )


const curve = new THREE.SplineCurve([
  new THREE.Vector2(-1, 0),
  new THREE.Vector2(-5, 5),
  new THREE.Vector2(0, 0),
  new THREE.Vector2(5, -5),
  new THREE.Vector2(1, 0)
])

const points2 = curve.getPoints(50)
const geometry2 = new THREE.BufferGeometry().setFromPoints(points2)
const materials = new THREE.LineBasicMaterial({ color: 'black', linewidth: 1, linecap: 'round' })
const splineObject = new THREE.Line(geometry2, materials)


// ? ----- shape declerations ----
const funkyCube = new Cube()
funkyCube.updateMaterial({ opacity: 1 }) // 0.4 before

const regularCube = new Cube()
regularCube.toggleRotateDirection()
regularCube.updateMaterial({ opacity: 0.4 })

const smallTriangle = new Sphere()
smallTriangle.updateGeometry(0.5, 0.5, 1)
smallTriangle.updateMaterial({ opacity: 0.8 })

scene.add(line)
scene.add(splineObject)

// ? ----- for animation -----
let spinMultiplier = 1
function animate() {
  requestAnimationFrame(animate)

  // rendering all objects
  smallTriangle.update()
  regularCube.update()
  funkyCube.update()

  orbitControls.update()

  line.rotation.x += 0.1 * spinMultiplier
  line.rotation.y += 0.1 * spinMultiplier
  line.rotation.z += 0.05 * spinMultiplier
  splineObject.rotation.x += 0.1 * spinMultiplier
  splineObject.rotation.y += 0.1 * spinMultiplier
  splineObject.rotation.z += 0.05 * spinMultiplier

  stats.update()
  render()
}

animate()

function render() {
  renderer.render(scene, camera)
}

function kickAnimations(){
  spinMultiplier = 1
  funkyCube.increaseScale()
  funkyCube.stopSpin()
}

let snareNitroToggle = false
function snareAnimations(){
  spinMultiplier = 2.5
  snareNitroToggle = !snareNitroToggle
  snareNitroToggle ? (Math.random() < 0.5 ? nitro = 0.3 : nitro = 0) : nitro = 0
  Math.round(Math.random()) ? smallTriangle.updateGeometry(0.5, 0.7, 1) : smallTriangle.updateGeometry(0.6, 0.7, 1)
  smallTriangle.setScale(randomRange(3,5), randomRange(0,3))
}

// ? ----- temporary measure for demonstration -----
document.addEventListener('keydown', (event) => {
  console.log(`pressed: ${event.key}`)
  if (event.key === 'd'){
    Tone.Transport.start()
    kick.triggerAttackRelease('c3', '8n')
  }
  if (event.key === 'y'){
    snareAnimations()
  }
  if (event.key === 'u'){
    kickAnimations()
  }
  if (event.key === 'i'){
    spinMultiplier = 2.5
  }
})



// ? ----- temporary/Demo with ToneJs -----
const currentSong = {
  kick: [
    true, false, false, false, false, false, false, false,
    false, false, true, false, false, false, false, false,
    true, false, false, true, false, false, true, false,
    false, false, false, false, false, false, true, false
  ],
  snare: [
    false, false, false, false, true, false, false, false,
    false, false, false, false, true, false, false, false,
    false, false, false, false, false, false, false, false,
    false, false, false, false, true, false, false, false
  ]
}

Tone.Transport.bpm.value = 250
Tone.Transport.scheduleRepeat((time) => { 
  repeat(time)
}, '8n')

// generating a note
const kick = new Tone.Synth().toDestination()
const verb = new Tone.Reverb(5).toDestination()
kick.connect(verb)
kick.volume.value = -5

let index = 0
const repeat = (time: any): void => {
  const position = index % currentSong.kick.length
  const synthNote1 = currentSong.kick[position]
  const synthNote2 = currentSong.snare[position]
  if (synthNote1){
    kickAnimations()
    kick.triggerAttackRelease('c3', '8n', time)
  }
  if (synthNote2){
    snareAnimations()
    kick.triggerAttackRelease('c5', '8n', time)
  }
  index++
}

// ? ----- accessing the web midi API -----
window.navigator.requestMIDIAccess()
  .then(access => {
    console.log(access)
    const device: any = access.inputs.values().next()
    console.log(
      'Device found! - Output port [type:\'' + device.value.type + '\'] id:\'' + device.value.id +
        '\' manufacturer:\'' + device.value.manufacturer + '\' name:\'' + device.value.name +
        '\' version:\'' + device.value.version + '\''
    )
    device.value.onmidimessage = onMidiMessage
  })
  .catch(() => console.log('No midi found!'))

// reads midi messages to be played
function onMidiMessage(message: any ): void {
  const [command, note, value] = message.data
  switch (command) {
    case 144: // Note on
      switch (value){
        case 60:
          kickAnimations()
          break
        case 62:
          snareAnimations()
          break
        case 64:
          funkyCube.spinShape()
          break
        case 65:
          funkyCube.spinShape(0.1)
          break
        case 67:
          // some functionality
          break
        case 69:
          // some functionality
          break
      }
      console.log(`Note: '${note}'. With value: ${value}`)
      break
    default: // Note off
      console.log(`Note OFF: '${note}'. With value: '${value}`)
      break
  }
}


