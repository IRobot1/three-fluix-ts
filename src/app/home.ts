import { MeshBasicMaterialParameters, SRGBColorSpace, Scene, TextureLoader } from "three";
import { ThreeJSApp } from "../app/threejs-app";

import { FontCache, UIOptions, UIMaterials, UITextButton, TextButtonParameters } from 'three-fluix'

interface Tile {
  description: string
  route: string  // looks for asset with same name
}

const examples1: Array<Tile> = [
  { description: 'First', route: 'first' },
  { description: 'Second', route: 'second' },
]

export class HomeScene extends Scene {

  dispose = () => { }

  constructor(app: ThreeJSApp) {
    super()

    this.position.set(0, 1.5, -0.5)

    const options: UIOptions = {
      fontCache: new FontCache(),
      materials: new UIMaterials(),
    }

    const loader = new TextureLoader()

    const bordersize = 0.03
    const screenwidth = 16 / 9 - bordersize * 2
    const screenheight = 1 - bordersize * 2

    const buttonwidth = 0.3
    let x = -screenwidth / 2 + buttonwidth / 2 + bordersize
    let y = screenheight / 2 - bordersize * 2

    examples1.forEach(example => {
      const params: TextButtonParameters = {
        width: buttonwidth, height: 0.05, radius:0.01,
        label: { text: example.description, size: 0.02 }
      }

      const button = new UITextButton(params, app.interactive, options)

      this.add(button)
      button.position.set(x, y, 0.001)

      button.pressed = () => {
        app.navigateto(example.route)
      }

      y -= 0.07
    })

    this.dispose = () => {
    }
  }
}
