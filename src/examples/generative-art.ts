import { Component } from "@angular/core";

import { CircleGeometry, Color, Group, InstancedMesh, Intersection, Matrix4, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Quaternion, RingGeometry, SRGBColorSpace, Scene, Texture, TextureLoader, Vector3 } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { PointerEventType, PointerInteractionLayers } from "three-fluix";


@Component({
  template: '',
})
export class GenerativeArtScene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()

    const z = -0.5

    app.scene = this
    app.enableOrbit = true
    app.enableStats()

    const home = app.showHome(this)
    home.position.set(-0.1, 1.9, z)

    app.camera.position.y = 0.1
    app.camera.position.z = 2



    const loader = new TextureLoader()
    const flowers = loader.load('assets/flowers.png')
    flowers.colorSpace = SRGBColorSpace
    flowers.repeat.set(1 / 3, 1 / 3)

    const plane = new PlaneGeometry(30, 30)
    const mesh = new Mesh(plane, new MeshBasicMaterial({ color: 'black' }))
    this.add(mesh)
    mesh.position.set(0, 0, z - 0.01)
    mesh.layers.enable(PointerInteractionLayers.SELECTABLE)

    const size = 0.05
    const max = 10000
    const segments = 6


    const context: DrawContext = {
      circlemesh: new InstancedMesh(new CircleGeometry(size, segments), new MeshBasicMaterial({ color: 'yellow' }), max),
      ringmesh: new InstancedMesh(new RingGeometry(size * 0.9, size * 1.1, segments), new MeshBasicMaterial({ color: 'black' }), max),
      index: 0,
      group: new Group(),
      flowers
    }
    this.add(context.circlemesh)
    this.add(context.ringmesh)
    this.add(context.group)

    const matrix = new Matrix4()
    const position = new Vector3(Infinity, Infinity, Infinity)
    for (let i = 0; i < max; i++) {
      matrix.setPosition(position)
      context.circlemesh.setMatrixAt(i, matrix)
      context.ringmesh.setMatrixAt(i, matrix)

    }
    context.circlemesh.count = context.ringmesh.count = max

    mesh.addEventListener(PointerEventType.POINTERMOVE, (e: any) => {
      const local = (e.intersections[0] as Intersection).point
      const root = new Root(local.clone(), context);
      context.index += root.max
      if (context.index > max) {
        root.max -= context.index - max
        context.index = 0
        context.group.children.length = 0
      }
      root.update();
    })


    mesh.addEventListener(PointerEventType.POINTERDOWN, (e: any) => {
      const local = (e.intersections[0] as Intersection).point
      for (let i = 0; i < 10; i++) {
        const root = new Root(local.clone(), context);
        context.index += root.max
        if (context.index > max) {
          root.max -= context.index - max
          context.index = 0
          context.group.children.length = 0
        }
        root.update();
      }

    })
  }
}

interface DrawContext {
  circlemesh: InstancedMesh
  ringmesh: InstancedMesh
  index: number
  group: Object3D
  flowers: Texture
}

class Flower {
  maxFlowerScale: number
  mesh: Mesh
  scale = 1
  constructor(public position: Vector3, public texture: Texture, public context: DrawContext) {
    this.maxFlowerScale = 1 + Math.random() * 4

    const mesh = new Mesh(
      new PlaneGeometry(0.1, 0.1),
      new MeshBasicMaterial({
        color: 'white', map: texture, transparent: true, depthWrite: false,
      }))

    context.group.add(mesh)
    mesh.position.copy(position)
    this.mesh = mesh
  }

  grow() {
    if (this.scale < this.maxFlowerScale) {
      this.scale += 0.03
      this.mesh.scale.setScalar(this.scale)

      requestAnimationFrame(() => { this.grow() })

    }
  }
}
class Root {
  size = 0.6
  count = 0
  max = Math.trunc(Math.random() * 30) + 20
  vs = Math.random() * 0.03
  speedX = Math.random() * 0.03 - 0.02
  speedY = Math.random() * 0.03 - 0.02
  angle = Math.random() * 2 * Math.PI
  lightness = 0

  index: number
  matrix = new Matrix4()

  constructor(public position: Vector3, public context: DrawContext) {
    this.index = context.index
  }

  update() {
    const factor = 100
    this.position.x += this.speedX + Math.sin(this.angle) / factor;
    this.position.y += this.speedY + Math.sin(this.angle) / factor;
    this.size += this.vs
    this.angle += 0.1
    if (this.lightness < 100) this.lightness += 0.25


    if (this.count < this.max) {
      const position = new Vector3()
      const quaternion = new Quaternion()
      const scale = new Vector3()

      this.context.circlemesh.getMatrixAt(this.index, this.matrix)

      this.matrix.decompose(position, quaternion, scale)
      scale.set(this.size, this.size, this.size)
      this.matrix.compose(this.position, quaternion, scale)

      this.context.circlemesh.setMatrixAt(this.index, this.matrix)
      this.context.circlemesh.instanceMatrix.needsUpdate = true

      this.position.z += 0.001

      //this.context.ringmesh.getMatrixAt(this.index, this.matrix)
      this.matrix.setPosition(this.position)
      //this.matrix.makeScale(this.size, this.size, this.size)

      this.context.ringmesh.setMatrixAt(this.index, this.matrix)
      this.context.ringmesh.instanceMatrix.needsUpdate = true

      this.position.z += 0.001
      this.index++
      this.count++

      requestAnimationFrame(() => { this.update() })
    }
    else if (this.size > 1) {
      const texture = Root.randomFlower(this.context.flowers)
      const flower = new Flower(this.position, texture, this.context);
      flower.grow();
    }
  }

  static randomFlower(source: Texture): Texture {
    const texture: Texture = source.clone()
    const offsets = [
      { x: 0, y: 2 / 3 },
      { x: 1 / 3, y: 2 / 3 },
      { x: 2 / 3, y: 2 / 3 },
      { x: 0, y: 1 / 3 },
      { x: 1 / 3, y: 1 / 3 },
      { x: 2 / 3, y: 1 / 3 },
      { x: 0, y: 0 },
      { x: 1 / 3, y: 0 },
      { x: 2 / 3, y: 0 },
    ]
    const offset = offsets[Math.trunc(Math.random() * offsets.length)]
    texture.offset.set(offset.x, offset.y)
    return texture
  }
}
