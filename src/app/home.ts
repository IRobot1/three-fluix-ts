import { MeshBasicMaterialParameters, SRGBColorSpace, Scene, TextureLoader } from "three";
import { ThreeJSApp } from "../app/threejs-app";

import { FontCache, UIOptions, UIMaterials, UITextButton } from 'three-fluix'

interface Tile {
  description: string
  route: string  // looks for asset with same name
}

const examples1: Array<Tile> = [
  { description: 'First', route: 'first' }
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
    const buttonsize = 0.1

    let x = -screenwidth / 2 + 0.1
    let y = -screenheight / 2 + 0.1
    examples1.forEach(example => {
      const button = new UITextButton({
        width: buttonsize, height: buttonsize,
        label: {}
      }, app.interactive, options)
      this.add(button)
      button.position.set(x, y, 0.001)
      button.pressed = () => {
        app.navigateto(example.route)
      }

      const texture = loader.load('/assets/examples/' + example.route + '.png')
      texture.repeat.set(10, 10)
      texture.colorSpace = SRGBColorSpace
      button.material = options.materials!.getMaterial('geometry', example.route, <MeshBasicMaterialParameters>{ map: texture })
    })

    this.dispose = () => {
    }
  }
}
