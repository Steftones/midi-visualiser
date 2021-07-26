import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import * as Tone from 'tone'

// base shapes to render
import { Sphere, Cone, Cube } from './base-shapes'

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
new OrbitControls(camera, renderer.domElement)

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

// ? ----- shape declerations ----

const newMiddle = new Sphere()
newMiddle.updateGeometry(0.5, 0.5, 1)

const newMiddles = new Cube()
newMiddles.toggleRotateDirection()

const newCube = new Cube()
newCube.updateMaterial({ opacity: 0.4 })

// ? ----- for animation -----

function animate() {
  requestAnimationFrame(animate)

  // rendering all objects
  newMiddle.update()
  newMiddles.update()
  newCube.update()

  stats.update()
  render()
}

animate()

function render() {
  renderer.render(scene, camera)
}

function kickAnimations(){
  console.log('kicked')
  newCube.increaseScale()
  newCube.stopSpin()
}

let snareNitroToggle = false
function snareAnimations(){
  console.log('snared')
  snareNitroToggle = !snareNitroToggle
  snareNitroToggle ? (Math.random() < 0.5 ? nitro = 0.3 : nitro = 0) : nitro = 0
  Math.round(Math.random()) ? newMiddle.updateGeometry(0.5, 0.7, 1) : newMiddle.updateGeometry(0.6, 0.7, 1)
  newMiddle.setScale(randomRange(3,5), randomRange(0,3))
}

let transportOn = true

// ? ----- temporary measure for demonstration -----
document.addEventListener('keydown', (event) => {
  console.log(`pressed: ${event.key}`)
  if (event.key === 's'){
    kickAnimations()
    kick.triggerAttackRelease('c3', '8n')
  }
  if (event.key === 'd'){
    transportOn = !transportOn
    transportOn ? Tone.Transport.stop() : Tone.Transport.start()
  }
  if (event.key === 'y'){
    snareAnimations()
  }
  if (event.key === 'u'){
    kickAnimations()
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

Tone.Transport.bpm.value = 240
Tone.Transport.scheduleRepeat((time) => { 
  repeat(time)
}, '8n')

// generating a note
const kick = new Tone.Synth().toDestination()
const verb = new Tone.Reverb().toDestination()
kick.connect(verb)
kick.volume.value = -5

let index = 0
const repeat = (time: any): void => {
  const position = index % currentSong.kick.length
  const synthNote1 = currentSong.kick[position]
  const synthNote2 = currentSong.snare[position]
  if (synthNote1){
    kick.triggerAttackRelease('c3', '8n', time)
    kickAnimations()
  }
  if (synthNote2){
    kick.triggerAttackRelease('c5', '8n', time)
    snareAnimations()
  }
  index++
}

// accessing the web midi API
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
          newCube.spinShape()
          break
        case 65:
          newCube.spinShape(0.1)
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


