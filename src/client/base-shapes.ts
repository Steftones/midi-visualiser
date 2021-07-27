import * as THREE from 'three'
import { MeshNormalMaterialParameters } from 'three'
import randomRange from './lib/random-range'
import { scene, nitro } from './client'

class Shape {
  shape: THREE.Mesh; geometry: any; material: THREE.MeshNormalMaterial;
  spin: boolean; spinAmount: number; randomSpin: boolean; decreaseScale: boolean; isRotating: boolean;
  rotateDirectionLeft: boolean; randomValues: number;

  constructor() {
    this.geometry = new THREE.BoxGeometry()
    this.material = new THREE.MeshNormalMaterial({
      transparent: true,
      wireframe: false,
      opacity: 0.5
    })
    this.shape = new THREE.Mesh(this.geometry, this.material)
    this.spin = false
    this.spinAmount = 0.01
    this.randomSpin = false
    this.decreaseScale = true
    this.isRotating = true
    this.rotateDirectionLeft = true
    this.randomValues = randomRange(0,0.1)
  }

  stopSpin(){
    this.spin = false
  }

  spinShape(amount: number = 0.03){
    this.spin = true
    this.spinAmount = amount
  }

  toggleRotateDirection(){
    this.rotateDirectionLeft = !this.rotateDirectionLeft
  }

  toggleRandomSpin(){
    this.randomSpin = !this.randomSpin
  }

  setScale(x: number = 1, y: number = 1, z: number = 1){
    this.shape.scale.x = x
    this.shape.scale.y = y
    this.shape.scale.z = z
  }

  // scale increase / decrease
  increaseScale(amount: number = randomRange(3, 1.75), axis: string = 'x', decreaseScale: boolean = true){
    if (axis === 'x' || axis === 'xy') this.shape.scale.x = amount
    if (axis === 'y' || axis === 'xy') this.shape.scale.y = amount
    this.decreaseScale = decreaseScale
  }

  updateMaterial(input: MeshNormalMaterialParameters){
    this.material.setValues(input)
  }

  update(){
    if (this.spin) this.shape.rotation.x += this.spinAmount
    if (this.decreaseScale){
      if (this.shape.scale.x > 1) this.shape.scale.x -= 0.05
      if (this.shape.scale.y > 1) this.shape.scale.y -= 0.05
    }
    if (this.isRotating){
      this.shape.rotation.x += this.rotateDirectionLeft ? 0.01 : -0.01
      this.shape.rotation.y += this.rotateDirectionLeft ? 0.01 : -0.01
    }
    if (this.randomSpin){
      this.shape.rotation.z += (this.rotateDirectionLeft ? this.randomValues : -Math.abs(this.randomValues)) + nitro
      this.shape.rotation.x += 0
      this.shape.rotation.y += 0
    }
  }
}

export class Cube extends Shape {
  constructor() {
    super()
    scene.add(this.shape)
  }
  updateGeometry(width: number = 1, height: number = 1, depth: number = 1){
    const newGeometry = new THREE.BoxGeometry(width, height, depth)
    this.shape.geometry.dispose()
    this.shape.geometry = newGeometry
  }
}

export class Cone extends Shape {
  constructor() {
    super()
    this.geometry = new THREE.ConeBufferGeometry()
    this.shape = new THREE.Mesh(this.geometry, this.material)
    scene.add(this.shape)
  }
  updateGeometry(width: number = 1, height: number = 1, depth: number = 1){
    const newGeometry = new THREE.ConeBufferGeometry(width, height, depth)
    this.shape.geometry.dispose()
    this.shape.geometry = newGeometry
  }
}

export class Sphere extends Shape {
  constructor() {
    super()
    this.geometry = new THREE.SphereGeometry()
    this.shape = new THREE.Mesh(this.geometry, this.material)
    scene.add(this.shape)
  }
  updateGeometry(width: number = 1, height: number = 1, depth: number = 1){
    const newGeometry = new THREE.SphereGeometry(width, height, depth)
    this.shape.geometry.dispose()
    this.shape.geometry = newGeometry
  }
}