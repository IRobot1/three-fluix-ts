import { AmbientLight, AxesHelper, BoxGeometry, CircleGeometry, Color, ExtrudeGeometry, ExtrudeGeometryOptions, MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry, PointLight, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";

import { UILabel, UIMaterials, UITextButton } from 'three-fluix'
import { UIOptions } from "../../projects/three-fluix/src/lib/model";
import { FontCache } from "../../projects/three-fluix/src/lib/cache";

import { RoundedRectangleBorderShape } from 'three-fluix'

export class StartScene extends Scene {

  dispose = () => { }

  constructor(app: ThreeJSApp) {
    super()

    app.camera.position.y = 1.5
    app.camera.position.z = 0.2

    this.background = new Color(0x444444)

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
    this.add(floor)
    floor.rotation.x = MathUtils.degToRad(-90)

    const bordersize = 0.03
    {
      const geometry = new Frame(16 / 9, 1, 0.01, bordersize)
      const frame = new Mesh(geometry, new MeshBasicMaterial({ color: 'black' }))
      this.add(frame)
      frame.position.set(0, 1.5, -0.5)
    }


    const screenwidth = 16 / 9 - bordersize * 2
    const screenheight = 1 - bordersize * 2

    const screen = new Mesh(
      new PlaneGeometry(screenwidth, screenheight),
      new MeshBasicMaterial({ color: '#cceecc', transparent: true, opacity: 0.3 })
    )
    this.add(screen)
    screen.position.set(0, 1.5, -0.502)

    {
      const geometry = new BoxGeometry(16 / 9 - 0.4, 1, 0.1)
      const stand = new Mesh(geometry, new MeshBasicMaterial({ color: '#666' }))
      this.add(stand)
      stand.position.set(0, 0.5, -0.45)
    }


    const options: UIOptions = {
      fontCache: new FontCache(),
      materials: new UIMaterials(),
    }
    //const label = new UILabel({ text: 'Unlit UI', material: { color: 'white' }, size: 0.5 }, options)
    //this.add(label)
    //label.position.set(0, 1.5, -3)

    const buttonsize = 0.05
    const button = new UITextButton({
      width: buttonsize, height: buttonsize,
      label: { text: 'arrow_back', isicon: true, size: 0.03 }
    }, app.interactive, options)
    screen.add(button)
    button.position.set(-screenwidth / 2 + buttonsize / 2 + 0.01, screenheight / 2 - buttonsize / 2 - 0.01, 0.001)
    button.pressed = () => {
      app.navigateback()
    }

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
