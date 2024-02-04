import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { Scene } from "three";

import { UITextButton, TextButtonParameters } from 'three-fluix'

import { ThreeJSApp } from "../app/threejs-app";
import { routes } from "./app-routing.module";
import { ThreeFluixGithub } from "../examples/svg-button";

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

    const svgbutton = new ThreeFluixGithub(app.pointer, app.uioptions)
    this.add(svgbutton)
    svgbutton.position.set(0, 1.6, -0.5)

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

      const button = new UITextButton(params, app.pointer, app.uioptions)

      this.add(button)
      button.position.set(x, y, -0.5)

      button.pressed = () => {
        router.navigate([example.path])
      }

      y -= 0.07
    })
  }
}

