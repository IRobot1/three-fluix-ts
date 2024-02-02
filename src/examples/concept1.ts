import { Component } from "@angular/core";

import { Color, Material, MeshBasicMaterial, Object3D, Scene, Vector3 } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { MenuButtonParameters, MenuParameters, TextButtonParameters, ThreeInteractive, UIButton, UIButtonMenu, UIOptions, UITextButton } from "three-fluix";

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

    const text: Array<string> = [
      'Images', 'Vector Graphics', '3D Models', 'Commerce Data', 'Visual Assets', 'Generative AI Assets', 'Text'
    ]

    const items = text.map(text => <MenuButtonParameters>{ id: text, label: { id:text, text }, hint: text, width: 0.77 })

    const menu = new CustomButtonMenu({ items, orientation: 'vertical', spacing: 0.05 }, app.interactive, app.uioptions)
    this.add(menu)
    menu.position.set(-0.5, 1.7, z)
    menu.scale.setScalar(0.5)
  }
}

class CustomButtonMenu extends UIButtonMenu {
  constructor(parameters: MenuParameters, interactive: ThreeInteractive, options: UIOptions) {
    super(parameters, interactive, options)
  }

  override createButton(parameters: TextButtonParameters): UIButton {
    const button = new UITextButton(parameters, this.interactive, this.options)

    const highlightScale = button.scale.clone().addScalar(0.2)
    button.highlight = () => {
      LerpUtils.scale(button, highlightScale)
    }

    const originalScale = button.scale.clone()
    button.unhighlight = () => {
      LerpUtils.scale(button, originalScale)
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

  static scale(object: Object3D, target: Vector3, rate = 0.1) {
    let alpha = 0
    const animateScale = () => {
      if (alpha < 1) {
        // If the animation is not yet complete, interpolate the scale
        object.scale.lerp(target, alpha);
        alpha += rate
        requestAnimationFrame(animateScale);
      }
      else
        object.scale.copy(target)
    }
    requestAnimationFrame(animateScale);
  }

  static color(color: Color, target: Color, rate = 0.1) {
    let alpha = 0
    const animateColor = () => {
      if (alpha < 1) {
        // If the animation is not yet complete, interpolate the scale
        color.lerp(target, alpha)
        alpha += rate
        requestAnimationFrame(animateColor);
      }
      else {
        color.copy(target)
      }
    }
    requestAnimationFrame(animateColor);
  }
}
