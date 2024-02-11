import { Component } from "@angular/core";

import { Scene } from "three";

import { ThreeJSApp } from "../app/threejs-app";

@Component({
  template: '',
})
export class EmptyScene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()

    const z = -0.5

    app.scene = this
    app.enableOrbit = false

    const home = app.showHome(this)
    home.position.set(-0.1, 1.9, z)

    app.camera.position.z = 0.2
  }
}
