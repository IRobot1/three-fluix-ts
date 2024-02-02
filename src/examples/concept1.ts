import { Component } from "@angular/core";

import { Scene } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { MenuButtonParameters, UIButtonMenu } from "three-fluix";

@Component({
  template: '',
})
export class Concept1Scene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()

    const z = -0.5

    app.scene = this

    const home = app.showHome(this)
    home.position.set(-0.1, 1.8, z + 0.01)
    home.scale.setScalar(0.5)

    const text: Array<string> = [
      'Images', 'Vector Graphics', '3D Models', 'Commerce Data', 'Visual Assets', 'Generative AI Assets', 'Text'
    ]

    const items = text.map(text => <MenuButtonParameters>{ label: { text }, hint: text, width:0.77 })
   
    const menu = new UIButtonMenu({ items, orientation:'vertical' }, app.interactive, app.uioptions)
    this.add(menu)
    menu.position.set(-0.5, 1.7, z)
    menu.scale.setScalar(0.5)
  }
}
