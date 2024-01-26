import { AmbientLight, AxesHelper, BoxGeometry, CircleGeometry, Color, ExtrudeGeometry, ExtrudeGeometryOptions, MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";

import { UILabel, UIMaterials } from 'three-fluix'
import { UIOptions } from "../../projects/three-fluix/src/lib/model";
import { FontCache } from "../../projects/three-fluix/src/lib/cache";

import { RoundedRectangleBorderShape } from 'three-fluix'

export class HomeScene {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.y = 1.5
    app.camera.position.z = 0.2

    scene.background = new Color(0x444444)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    //    orbit.enableRotate = false;
    orbit.update();

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code == 'Space')
        orbit.enableRotate = !orbit.enableRotate
    })

    //const disableRotate = () => { orbit.enableRotate = false }
    //const enableRotate = () => { orbit.enableRotate = true }
    //app.interactive.addEventListener(InteractiveEventType.DRAGSTART, disableRotate)
    //app.interactive.addEventListener(InteractiveEventType.DRAGEND, enableRotate)

    //scene.add(new AxesHelper(3))

    const floor = new Mesh(new CircleGeometry(3, 6), new MeshBasicMaterial({ color: '#333' }))
    scene.add(floor)
    floor.rotation.x = MathUtils.degToRad(-90)

    {
      const geometry = new Frame(16 / 9, 1, 0.01, 0.03)
      const frame = new Mesh(geometry, new MeshBasicMaterial({ color: 'black' }))
      scene.add(frame)
      frame.position.set(0, 1.5, -0.5)
    }

    {
      const geometry = new PlaneGeometry(16 / 9, 1)
      const screen = new Mesh(geometry, new MeshBasicMaterial({ color: '#cceecc', transparent: true, opacity: 0.3 }))
      scene.add(screen)
      screen.position.set(0, 1.5, -0.502)
    }

    {
      const geometry = new BoxGeometry(16 / 9 - 0.4, 1, 0.1)
      const stand = new Mesh(geometry, new MeshBasicMaterial({ color: '#666' }))
      scene.add(stand)
      stand.position.set(0, 0.5, -0.45)
    }


    const options: UIOptions = {
      fontCache: new FontCache(),
      materials: new UIMaterials(),
    }
    const label = new UILabel({ text: 'Unlit UI', material: { color: 'white' }, size: 0.5 }, options)
    scene.add(label)
    label.position.set(0, 1.5, -3)

    app.enableVR()


    this.dispose = () => {
      app.disableVR()
      orbit.dispose()
    }
  }
}

class Frame extends ExtrudeGeometry {
  constructor(width = 1, height = 1, radius = 0.1, border = 0.1, curveSegments = 12) {
    const shape = new RoundedRectangleBorderShape(width, height, radius, border, curveSegments)

    const options: ExtrudeGeometryOptions = {
      depth: 0.03,
      bevelEnabled: false,
      bevelThickness: 0.01,
      bevelSize: 0.03,
      bevelOffset: 0,
    }
    super(shape, options)
    this.center()
  }
}
