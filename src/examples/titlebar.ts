import { Component } from "@angular/core";

import { Scene } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { ButtonMenuParameters, LabelParameters, MenuButtonParameters, TextButtonParameters, TitlebarParameters, UIButton, UITextButton, UITitlebar } from "three-fluix";

@Component({
  template: '',
})
export class TitlebarScene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()

    const z = -0.5

    app.scene = this
    app.enableOrbit = false

    const home = app.showHome(this)
    home.position.set(-0.1, 1.9, z)

    app.camera.position.z = 0.2

    const pin: MenuButtonParameters = {
      button: <TextButtonParameters>{
        radius: 0.05,
        label: { text: 'drag_indicator', isicon: true },
        fill: { color: 0x666666 }
      },
      hint: 'Pin',
      selected: (parameters: MenuButtonParameters, button: UIButton) => {
        const textbutton = button as UITextButton
        textbutton.label.text = titlebar1.draggable ? 'push_pin' : 'drag_indicator'
        parameters.hint = titlebar1.draggable ? 'Unpin' : 'Pin'
        titlebar1.draggable = !titlebar1.draggable
      }
    }

    const close: MenuButtonParameters = {
      button: <TextButtonParameters>{
        radius: 0.05,
        label: { text: 'close', isicon: true },
        fill: { color: 0x666666 }
      },
      hint: 'Close',
      selected: (parameters: MenuButtonParameters, button: UIButton) => {
        this.remove(titlebar1)
      }
    }

    const hintLabel: LabelParameters = { material: { color: 'white' } }

    const params1: TitlebarParameters = {
      width: 1.2,
      fill: { color: 0x7777777, transparent: true, opacity: 0.5 },
      title: { text: 'Pin and Close' },
      leftbuttons: { items: [pin], hintLabel },
      rightbuttons: { items: [close], hintLabel },
    }
    const titlebar1 = new UITitlebar(params1, app.pointer, app.uioptions)
    this.add(titlebar1)
    titlebar1.position.set(0.4, 1.7, z)
    titlebar1.scale.setScalar(0.5)


    const hide: MenuButtonParameters = {
      button: <TextButtonParameters>{
        radius: 0.05,
        label: { text: 'visibility_off', isicon: true },
        fill: { color: 0x888888 }
      },
      hint: 'Hide',
      selected: (parameters: MenuButtonParameters, button: UIButton) => {
        const textbutton = button as UITextButton
        textbutton.label.text = titlebar2.panel.visible ? 'visibility' : 'visibility_off' 
        parameters.hint = titlebar2.panel.visible ? 'Show' : 'Hide'
        titlebar2.panel.visible = !titlebar2.panel.visible
      }
    }

    const params2: TitlebarParameters = {
      width: 1.2,
      fill: { color: 'cornflowerblue', transparent: true, opacity: 0.5 },
      title: { text: 'Show/Hide Panel', material : { color: 'white' } },
      leftbuttons: { items: [hide], hintLabel },
    }
    

    const titlebar2 = new UITitlebar(params2, app.pointer, app.uioptions)
    this.add(titlebar2)
    titlebar2.position.set(-0.4, 1.7, z + 0.01)
    titlebar2.scale.setScalar(0.5)
  }

}
