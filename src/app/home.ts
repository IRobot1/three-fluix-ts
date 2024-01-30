import { AmbientLight, Color, Scene } from "three";
import { ThreeJSApp } from "../app/threejs-app";

import { FontCache, UIOptions, UIMaterials, UITextButton, TextButtonParameters, UILabel } from 'three-fluix'
import { PropertiesScene } from "../examples/properties";
import { CustomPropertiesScene } from "../examples/custom-properties";
import { LabelPerformanceScene } from "../examples/label-performance";
import { Component } from "@angular/core";
import { routes } from "./app-routing.module";
import { Router } from "@angular/router";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface Tile {
  route: string  // looks for asset with same name
  description: string
  scene: () => Scene
}


@Component({
  template: '',
})
export class HomeScene extends Scene {

  constructor(
    app: ThreeJSApp,
    router: Router,
  ) {
    super()

    app.scene = this

    //this.background = new Color(0x444444)

    //const ambient = new AmbientLight()
    //this.add(ambient)

    //const light = new PointLight(0xffffff, 2, 100)
    //light.position.set(0, 0, 2)
    //scene.add(light)


    const bordersize = 0.03
    const buttonwidth = 0.3
    let x = 0
    let y = 1.5

    routes.forEach(example => {
      if (!example.path) return

      const params: TextButtonParameters = {
        width: buttonwidth, height: 0.05, radius: 0.01,
        label: { text: example.title as string, size: 0.02 }
      }

      const button = new UITextButton(params, app.interactive, app.uioptions)

      this.add(button)
      button.position.set(x, y, -0.5)

      button.pressed = () => {
        router.navigate([example.path])
      }

      y -= 0.07
    })
  }
}
