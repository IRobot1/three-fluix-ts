import { Component } from "@angular/core";

import { CircleGeometry, InstancedMesh, Intersection, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry, Scene, Vector3 } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { PointerEventType, PointerInteractionLayers } from "three-fluix";

interface DrawContext {
  circlemesh: InstancedMesh
  ringmesh: InstancedMesh
  index: number
}

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

    const plane = new PlaneGeometry(30, 30)
    const mesh = new Mesh(plane, new MeshBasicMaterial({ color: 'black' }))
    this.add(mesh)
    mesh.position.set(0, 0, z - 0.01)
    mesh.layers.enable(PointerInteractionLayers.SELECTABLE)

    const size = 0.05
    const max = 100000
    const segments = 6

    const context: DrawContext = {
      circlemesh: new InstancedMesh(new CircleGeometry(size, segments), new MeshBasicMaterial({ color: 'lime' }), max),
      ringmesh: new InstancedMesh(new RingGeometry(size * 0.9, size * 1.1, segments), new MeshBasicMaterial({ color: 'darkgreen' }), max),
      index: 0,
    }

    this.add(context.circlemesh)
    this.add(context.ringmesh)

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
      }
      root.update(this);
    })


    mesh.addEventListener(PointerEventType.POINTERDOWN, (e: any) => {
      //const local = (e.intersections[0] as Intersection).point
      //for (let i = 0; i < 10; i++) {
      //  const root = new Root(local.clone(), context);
      //  context.index += root.max
      //  if (context.index > max) {
      //    root.max -= context.index - max
      //    context.index = 0
      //  }
      //  root.update(this);
      //}
      console.warn(context.ringmesh.count, context.index)
    })

  }
}

class Root {
  size = 1
  count = 0
  max = Math.trunc(Math.random() * 30) + 20
  vs = 0.0003 + Math.random() * 0.0004
  speedX = Math.random() * 0.03 - 0.02
  speedY = Math.random() * 0.03 - 0.02
  index: number
  matrix = new Matrix4()

  constructor(public position: Vector3, public context: DrawContext) {
    this.index = context.index
  }

  update(scene: Scene) {
    this.position.x += this.speedX //+ Math.sin(this.angleX)/20;
    this.position.y += this.speedY //+ Math.sin(this.angleY)/20;
    this.size += this.vs
    //this.angleX += this.vax;
    //this.angleY += this.vay;
    //if (this.lightness < 80) this.lightness += 0.25;
    //console.warn(this.size, this.maxSize)
    if (this.count < this.max) {

      //const matrix = new Matrix4();
      //matrix.setPosition(item.position);
      //inst.setMatrixAt(index, matrix);
      //inst.setColorAt(index, item.color);
      this.context.circlemesh.getMatrixAt(this.index, this.matrix)
      this.matrix.setPosition(this.position)
      //this.matrix.makeScale(this.size, this.size, this.size)
      this.context.circlemesh.setMatrixAt(this.index, this.matrix)
      this.context.circlemesh.instanceMatrix.needsUpdate = true

      this.position.z += 0.001

      this.context.ringmesh.getMatrixAt(this.index, this.matrix)
      this.matrix.setPosition(this.position)
      //this.matrix.makeScale(this.size, this.size, this.size)
      this.context.ringmesh.setMatrixAt(this.index, this.matrix)
      this.context.ringmesh.instanceMatrix.needsUpdate = true

      this.position.z += 0.001
      this.index++
      this.count++

      requestAnimationFrame(() => { this.update(scene) })
    }
    //  else {
    //    const flower = new Flower(this.x, this.y, this.size);
    //    flower.grow();
    //  }
  }
}
