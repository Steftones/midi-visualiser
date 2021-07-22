// install @types/three to get ts types from three
import * as THREE from 'three'
// importing extra modules
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
// a lot of modules in THREE won't have ts types. You have to always tell your ts config where the location of your new type definition should be when it finds that path in your code
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import * as Tone from 'tone'

// speeds up rotation
let nitro = 0

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75, // FOV
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 2

// fastest and default renderer you'll see on most THREE projects
// you need to set the size of the renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
// renderer draws its output, dynamically adding it to the document body. We need this to draw the canvas. You can hardcode your canvas by creating <canvas> and passing it into THREE.WebGLRenderer()
document.body.appendChild(renderer.domElement)

// allows you to control the cube with the mouse
new OrbitControls(camera, renderer.domElement)
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({
  color: 'black',
  wireframe: true
})

// adding a background colour
scene.background = new THREE.Color('orange')

// adding a cube
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// adding some sort of shape
const shapeGeometrySettings = {
  width: 1,
  height: 1,
  depth: 100
}
const shapeGeometry = new THREE.SphereGeometry(
  shapeGeometrySettings.width,
  shapeGeometrySettings.height,
  shapeGeometrySettings.depth
)
const shapeMaterial = new THREE.MeshNormalMaterial()
shapeMaterial.wireframe = false
shapeMaterial.flatShading = true
const shape = new THREE.Mesh(shapeGeometry, shapeMaterial)
shapeGeometry.scale(0.5,0.5,0.5)
scene.add(shape)

// resizes 3d view on the canvas
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

// need to update in the animate function so you can see it updating all the time
const stats = Stats()
document.body.appendChild(stats.dom)

// ? ----------- adding GUI -----------
const gui = new GUI()

// adding folders to organise within the GUI
const cubeFolder = gui.addFolder('Cube')
// cubeFolder.open()

function generateShapeGeometry(
  width = shapeGeometrySettings.width,
  height = shapeGeometrySettings.height,
  depth = shapeGeometrySettings.depth){
  const newGeometry = new THREE.SphereGeometry(
    width,
    height,
    depth
  )
  shape.geometry.dispose()
  shape.geometry = newGeometry
}

const shapeGeometryFolder = gui.addFolder('Shape geometry')
shapeGeometryFolder.add(shapeGeometrySettings, 'width', 0, 0.5, 0.1).onChange(generateShapeGeometry)
shapeGeometryFolder.add(shapeGeometrySettings, 'height', 0, 0.5, 0.1).onChange(generateShapeGeometry)
shapeGeometryFolder.add(shapeGeometrySettings, 'depth', 0, 100, 1).onChange(generateShapeGeometry)
// shapeGeometryFolder.open()

const cubeRotationFolder = cubeFolder.addFolder('Rotation')
cubeRotationFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
cubeRotationFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
cubeRotationFolder.add(cube.rotation, 'z', 0, Math.PI * 2)
// cubeRotationFolder.open()

const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 10)

const cubePositionFolder = gui.addFolder('Cube Position')
cubePositionFolder.add(cube.position, 'x', -10, 10, 0.1)
cubePositionFolder.add(cube.position, 'y', -10, 10, 0.1)
cubePositionFolder.add(cube.position, 'z', -10, 10, 0.1)

const cubeScaleFolder = gui.addFolder('Cube Scale')
cubeScaleFolder.add(cube.scale, 'x', -10, 10, 0.1)
cubeScaleFolder.add(cube.scale, 'y', -10, 10, 0.1)
cubeScaleFolder.add(cube.scale, 'z', -10, 10, 0.1)

const options = {
  side: {
    'FrontSide': THREE.FrontSide,
    'BackSide': THREE.BackSide,
    'DoubleSide': THREE.DoubleSide
  }
}

const materialFolder = gui.addFolder('Internal shape material')
materialFolder.add(shapeMaterial, 'transparent')
materialFolder.add(shapeMaterial, 'opacity', 0, 1, 0.01)
materialFolder.add(shapeMaterial, 'depthTest')
materialFolder.add(shapeMaterial, 'depthWrite')
materialFolder.add(shapeMaterial, 'alphaTest', 0, 1, 0.01).onChange(() => updateMaterial())
materialFolder.add(shapeMaterial, 'side', options.side).onChange(() => updateMaterial())
materialFolder.open()

// ? ---------------------------------

function updateMaterial(){
  shapeMaterial.side = Number(shapeMaterial.side)
  // next time rendered
  shapeMaterial.needsUpdate = true
}

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function animate() {
  // window.requestAnimationFrame is a method that tells the browser that you want to perform an animation. Requests that the browser calls a function to update an animation before the next repeat. Takes a callback as an argument to be invoked before the next repaint.
  // will run faster on different browsers
  // animate needs to be called
  requestAnimationFrame(animate)

  cube.rotation.x += 0.01
  cube.rotation.y += 0.01

  // decrease cube scale
  if (cube.scale.x > 1) cube.scale.x -= 0.05

  shape.rotation.z += randomRange(0,0.1) + nitro
  shape.rotation.x += randomRange(0,0.1)
  shape.rotation.y += 0.1

  shapeGeometry.scale(1, 1, 1)

  stats.update()
  // can call once if you only need to render it once, e.g. out of animate
  render()
}

function render() {
  renderer.render(scene, camera)
}

function kickAnimations(){
  console.log('kicked')
  cube.scale.x = (Math.random() * (3 - 1.5) + 1.5)
}

let snareNitroToggle = false
function snareAnimations(){
  snareNitroToggle = !snareNitroToggle
  snareNitroToggle ? (Math.random() < 0.5 ? nitro = 20 : nitro = 0) : nitro = 0
  Math.round(Math.random()) ? generateShapeGeometry(0.5) : generateShapeGeometry(0.7)
}

let transportOn = true
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
})

animate()

// ? ----- Tone experiment -----

const currentSong = {
  kick: [
    true, false, false, true, false, false, false, false,
    true, false, false, true, false, false, false, false,
    true, false, false, true, false, false, false, false,
    true, false, false, true, false, false, false, true
  ],
  snare: [
    false, false, true, false, false, false, true, false,
    false, false, true, false, false, false, true, false,
    false, false, true, false, false, false, true, false,
    false, false, true, false, false, false, true, false
  ]
}

Tone.Transport.bpm.value = 170
// Tone.Transport.start()
Tone.Transport.scheduleRepeat((time) => { 
  repeat(time)
}, '8n')

// Kick
const kick = new Tone.Synth().toDestination()
kick.volume.value = -5

let index = 0
const repeat = (time: any) => {
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

// ? midi experiment
// npm install @types/webmidi
window.navigator.requestMIDIAccess()
  .then(access => {
    console.log(access)
    // getting device
    const device: any = access.inputs.values().next()
    console.log(
      'Device found! - Output port [type:\'' + device.value.type + '\'] id:\'' + device.value.id +
      '\' manufacturer:\'' + device.value.manufacturer + '\' name:\'' + device.value.name +
      '\' version:\'' + device.value.version + '\''
    )
    // problem - it will only work on one midi device that's plugged in...
    device.value.onmidimessage = onMidiMessage
  })
  .catch(() => midiAccessFail())

let midiNoteOn = false
function onMidiMessage(message: any){
  midiNoteOn = !midiNoteOn
  if (midiNoteOn){
    Math.random() < 0.3 ? nitro = 2 : nitro = 0
    cube.scale.x = (Math.random() * (3 - 1.5) + 1.5)
    console.log(message)
  }
}

function midiAccessFail(){
  console.log('no midi!')
}