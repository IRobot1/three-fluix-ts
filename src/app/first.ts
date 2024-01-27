import { Scene } from "three";
import { ThreeJSApp } from "../app/threejs-app";

import { UILabel, UIMaterials } from 'three-fluix'
import { UIOptions } from "../../projects/three-fluix/src/lib/model";
import { FontCache } from "../../projects/three-fluix/src/lib/cache";


export class FirstScene extends Scene {

  dispose = () => { }

  constructor(app: ThreeJSApp) {
    super()

    this.position.set(0, 1.5, -0.5)

    const options: UIOptions = {
      fontCache: new FontCache(),
      materials: new UIMaterials(),
    }

    const rand = Math.random() * 10

    const label = new UILabel({ text: rand.toFixed(2), material: { color: 'white' }, size: 0.5 }, options)
    this.add(label)

    this.dispose = () => {
    }
  }
}
