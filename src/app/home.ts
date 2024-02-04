import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { Box2, Box3, Group, Mesh, MeshBasicMaterial, Scene, ShapeGeometry, Vector3 } from "three";
import { SVGLoader, SVGResult, SVGResultPaths } from 'three/examples/jsm/loaders/SVGLoader';

import { ButtonOptions, ButtonParameters, PointerInteraction, UIButton, UITextButton, TextButtonParameters } from 'three-fluix'

import { ThreeJSApp } from "../app/threejs-app";
import { routes } from "./app-routing.module";

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

    const svgparams: SVGButtonParameters = {
      svg: "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><title>GitHub</title><path d=\"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12\"/></svg>"
    }
    const svgbutton = new UISVGButton(svgparams, app.pointer, app.uioptions)
    this.add(svgbutton)
    svgbutton.position.set(0, 1.6, -0.5)
    svgbutton.pressed = () => {
      window.open('https://github.com/IRobot1/three-fluix-ts', '_blank')
    }

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

export interface SVGButtonParameters extends ButtonParameters {
  svg: string  // inline <svg or URL
}

class UISVGButton extends UIButton {
  constructor(parameters: SVGButtonParameters, pointer: PointerInteraction, options: ButtonOptions) {
    if (!parameters.height) parameters.height = 0.1
    if (!parameters.width) parameters.width = 0.1

    super(parameters, pointer, options)

    this.name = parameters.id != undefined ? parameters.id : 'svg-button'

    const loader = new SVGLoader()
    if (parameters.svg.startsWith('<svg')) {
      const result = loader.parse(parameters.svg)
      this.showSVG(result.paths)
    }
    else {
      loader.load(parameters.svg, (result: SVGResult) => {
        this.showSVG(result.paths)
      })
    }
  }

  private showSVG(paths: SVGResultPaths[]) {
    const group = new Group();

    for (let i = 0; i < paths.length; i++) {

      const path = paths[i];

      const material = new MeshBasicMaterial({
        color: path.color,
      });

      const shapes = SVGLoader.createShapes(path);

      for (let j = 0; j < shapes.length; j++) {

        const shape = shapes[j];
        const geometry = new ShapeGeometry(shape);
        geometry.center()
        const mesh = new Mesh(geometry, material);
        group.add(mesh);

      }
    }

    // get the size of the group of meshes
    const box = new Box3().setFromObject(group)
    const size = new Vector3()
    box.getSize(size)
    size.y = -size.y // flip
    size.z = 1

    // scale to fit in the button
    const scale = new Vector3(this.width * 0.9, this.height * 0.9, 1).divide(size)
    group.scale.copy(scale)

    // add and position above the button
    this.add(group)
    group.position.z = 0.001
  }

}
