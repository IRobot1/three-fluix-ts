import { Scene } from "three";
import { ThreeJSApp } from "../app/threejs-app";

export class EmptyScene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()

    this.scale.setScalar(0.2)
  }

  dispose = () => {
  }
}
