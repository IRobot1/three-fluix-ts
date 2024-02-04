import { Component } from "@angular/core";

import { BoxGeometry, Color, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Scene, Vector3 } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { MenuButtonParameters, ButtonMenuParameters, TextButtonParameters, PointerInteraction, UIButton, UIButtonMenu, UIOptions, UITextButton } from "three-fluix";

@Component({
  template: '',
})
export class Concept1Scene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()


    const z = -0.5

    app.scene = this

    const home = app.showHome(this)
    home.position.set(-0.1, 1.8, z + 0.01)
    home.scale.setScalar(0.5)

    app.camera.position.z = 0.1

    const text: Array<string> = [
      'Images', 'Vector Graphics', '3D Models', 'Commerce Data', 'Visual Assets', 'Generative AI Assets', 'Text'
    ]

    const items = text.map(text => <MenuButtonParameters>{
      id: text, button: {
        label: { id: text, text }, hint: text, width: 0.77
      }
    })

    const menu = new CustomButtonMenu({ items, orientation: 'vertical', spacing: 0.05 }, app.pointer, app.uioptions)
    this.add(menu)
    menu.position.set(-0.8, 1.7, z)
    menu.scale.setScalar(0.5)

    const center = new Vector3(0, 1.5, z)

    const modelbutton = menu.buttons[2]
    modelbutton.pressed = () => {
      const world = new Vector3()
      modelbutton.localToWorld(world)

      const cube = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), app.uioptions.materials?.getMaterial('geometry', 'cube', <MeshBasicMaterialParameters>{ color: 'green' }))
      cube.position.copy(world)
      this.add(cube)
      cube.scale.set(0, 0, 0)

      const scale = new Vector3(1, 1, 1)

      LerpUtils.vector3(cube.scale, scale, 0.01)
      LerpUtils.vector3(cube.position, center, 0.01, () => {

      })
    }
  }
}

class CustomButtonMenu extends UIButtonMenu {
  constructor(parameters: ButtonMenuParameters, pointer: PointerInteraction, options: UIOptions) {
    super(parameters, pointer, options)
  }

  override createButton(parameters: TextButtonParameters): UIButton {
    const button = new UITextButton(parameters, this.pointer, this.options)

    const highlightScale = button.scale.clone().addScalar(0.2)
    button.highlight = () => {
      LerpUtils.vector3(button.scale, highlightScale)
    }

    const originalScale = button.scale.clone()
    button.unhighlight = () => {
      LerpUtils.vector3(button.scale, originalScale)
    }

    const buttonmaterial = button.material as MeshBasicMaterial
    const buttonDownColor = new Color('#0157AD')
    const buttonOriginalColor = new Color(buttonmaterial.color.getStyle())

    const labelmaterial = button.label.material as MeshBasicMaterial
    const labelDownColor = new Color('white')
    const labelOriginalColor = new Color(labelmaterial.color.getStyle())

    button.buttonDown = () => {
      LerpUtils.color(buttonmaterial.color, buttonDownColor, 0.5)
      LerpUtils.color(labelmaterial.color, labelDownColor, 0.5)
    }

    button.buttonUp = () => {
      LerpUtils.color(buttonmaterial.color, buttonOriginalColor)
      LerpUtils.color(labelmaterial.color, labelOriginalColor)
    }
    return button
  }
}

class LerpUtils {

  static vector3(vector: Vector3, target: Vector3, rate = 0.1, complete: () => void = () => { }) {
    let alpha = 0
    const animateScale = () => {
      if (alpha < 1) {
        vector.lerp(target, alpha);
        alpha += rate
        requestAnimationFrame(animateScale);
      }
      else {
        vector.copy(target)
        complete()
      }
    }
    requestAnimationFrame(animateScale);
  }

  static color(color: Color, target: Color, rate = 0.1, complete: () => void = () => { },) {
    let alpha = 0
    const animateColor = () => {
      if (alpha < 1) {
        color.lerp(target, alpha)
        alpha += rate
        requestAnimationFrame(animateColor);
      }
      else {
        color.copy(target)
        complete()
      }
    }
    requestAnimationFrame(animateColor);
  }

}
