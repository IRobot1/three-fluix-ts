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

    const home = app.showHome(this)
    home.position.set(-0.1, 1.3, z + 0.01)
    home.scale.setScalar(0.5)
  }
}
