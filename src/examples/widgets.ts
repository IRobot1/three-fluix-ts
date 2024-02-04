import { Component } from "@angular/core";

import { Scene } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { PointerInteraction, PanelParameters, UIOptions, UIPanel, UITextButton } from "three-fluix";

@Component({
  template: '',
})
export class WidgetsScene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()

    const z = -0.5

    app.scene = this

    const home = app.showHome(this)
    home.position.set(-0.1, 1.3, z)

    app.camera.position.y = 2
    app.camera.position.z = 1

    const toolbar = new UIToolbar({}, app.pointer, app.uioptions)
    this.add(toolbar)
    toolbar.position.set(0, 2, z)
  }
}

interface ToolbarParameters extends PanelParameters {

}
class UIToolbar extends UIPanel {
  constructor(parameters: ToolbarParameters, pointer: PointerInteraction, options: UIOptions) {
    parameters.height = 0.2
    parameters.radius = 0.1
    super(parameters, options)

    const search = new UITextButton({ label: { text: 'home', isicon: true }, width:0.1 }, pointer, options)
    this.add(search)
    search.position.x = -this.width/2 + search.width
  }
}
