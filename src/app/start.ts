import { AxesHelper, BoxGeometry, CircleGeometry, Color, ExtrudeGeometry, ExtrudeGeometryOptions, MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "../app/threejs-app";

import { RoundedRectangleBorderShape,UIOptions,FontCache, MenuItemParameters, MenuParameters, UIMaterials, UIMiniMenu } from 'three-fluix'

export class StartScene extends Scene {

  dispose = () => { }

  constructor(app: ThreeJSApp) {
    super()

    app.camera.position.y = 1.5
    app.camera.position.z = 0.2

    this.background = new Color(0x444444)

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    orbit.enableRotate = false;
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
      const frame = new Mesh(geometry, new MeshBasicMaterial({ color: '#444' }))
      this.add(frame)
      frame.position.set(0, 1.5, -0.5)
    }


    const screenwidth = 16 / 9 - bordersize
    const screenheight = 1 - bordersize
    const screencolor = '#cceecc'

    const screen = new Mesh(
      new PlaneGeometry(screenwidth, screenheight),
      new MeshBasicMaterial({ color: screencolor, transparent: true, opacity: 0.3 })
    )
    this.add(screen)
    screen.position.set(0, 1.5, -0.502)

    {
      const geometry = new BoxGeometry(16 / 9 - 0.4, 1, 0.1)
      const stand = new Mesh(geometry, new MeshBasicMaterial({ color: '#666' }))
      this.add(stand)
      stand.position.set(0, 0.48, -0.45)
    }


    let power = true
    const togglepower = () => {
      if (power) {
        app.homescene!.position.y = -10
        if (app.examplescene)
          app.examplescene.position.y = -10
        screen.material.color.set('black')
        screen.material.opacity = 1
      }
      else {
        app.homescene!.position.y = 1.5
        if (app.examplescene)
          app.examplescene.position.y = 1.5
        screen.material.color.set(screencolor)
        screen.material.opacity = 0.3
      }
      power = !power
    }

    const options: UIOptions = {
      fontCache: new FontCache(),
      materials: new UIMaterials(),
    }

    const items: Array<MenuItemParameters> = [
      {
        text: 'arrow_back', isicon: true, hint: 'Back', selected: () => { app.navigateback() }
      },
      {
        text: 'power_settings_new', isicon: true, hint: 'Power', selected: togglepower
      },
      {
        text: 'flip_camera_android', isicon: true, hint: 'Orbit On/Off', selected: () => { orbit.enableRotate = !orbit.enableRotate }
      },
    ]

    const menuparams: MenuParameters = {
      items,
      hintbelow: false,
      hintLabel: { alignX: 'left', size: 0.05 }
    }
    const menu = new UIMiniMenu(menuparams, app.pointer, options)
    screen.add(menu)
    menu.position.set(-menu.width / 2, -screenheight / 2, 0.03)
    menu.scale.setScalar(0.4)

    app.enableStats()
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
