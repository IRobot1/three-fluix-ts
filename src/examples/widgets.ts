import { Component } from "@angular/core";

import { Mesh, MeshBasicMaterialParameters, Scene, ShapeGeometry } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { PointerInteraction, PanelParameters, UIOptions, UIPanel, UITextButton, UIButtonMenu, MenuButtonParameters, ButtonMenuParameters, UITextEntry, InputFieldEventType } from "three-fluix";
import { RoundedRectangleBorderGeometry, TextEntryParameters } from "../../dist/three-fluix";

@Component({
  template: '',
})
export class WidgetsScene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()

    const z = -0.5

    app.scene = this

    const home = app.showHome(this)
    home.position.set(-0.1, 1.3, z)

    app.camera.position.y = 2
    app.camera.position.z = 1

    const toolbar = new UIToolbar({}, app.pointer, app.uioptions)
    this.add(toolbar)
    toolbar.position.set(0, 2, z)
  }
}

interface ToolbarParameters extends PanelParameters {

}
class UIToolbar extends UIPanel {
  constructor(parameters: ToolbarParameters, pointer: PointerInteraction, options: UIOptions) {
    parameters.width = 2.5
    parameters.height = 0.2
    parameters.radius = 0.1
    parameters.selectable = false
    super(parameters, options)

    const items: Array<MenuButtonParameters> = [
      { hint: 'Home', label: { text: 'home', isicon: true } },
      { hint: 'Products', label: { text: 'Products' }, width: 0.4 },
      { hint: 'Services', label: { text: 'Services' }, width: 0.4 },
      { hint: 'Support', label: { text: 'Support' }, width: 0.4 },
    ]

    const params: ButtonMenuParameters = {
      items
    }

    const menu = new UIButtonMenu(params, pointer, options)
    this.add(menu)
    menu.position.x = -this.width / 2 + (menu.width - menu.spacing * 2) / 2

    const searchwidth = 0.5
    const searchheight = 0.12
    const geometry = new RoundedRectangleBorderGeometry(searchwidth, searchheight, searchheight / 2, 0.01)
    geometry.center()
    const searchoutline = new Mesh(geometry, options.materials?.getMaterial('geometry', 'search-outline', <MeshBasicMaterialParameters>{ color: 'black' }))
    this.add(searchoutline)
    searchoutline.position.x = this.width / 2 - searchwidth / 1.7
    searchoutline.position.z = 0.001

    const searchbutton = new UITextButton({ label: { text: 'search', isicon: true }, height: 0.08, width: 0.1, radius: 0.04 }, pointer, options)
    searchoutline.add(searchbutton)
    searchbutton.position.x = searchwidth / 2 - searchbutton.width / 1.7
    searchbutton.position.z = 0.001
    searchbutton.pressed = () => {
      window.open(`https://www.google.com/search?q=${search.text}`)
    }

    const textentryparams: TextEntryParameters = {
      width: 0.35, radius: 0.05,
      label: { maxwidth: 0.3 }
    }
    const search = new UITextEntry(textentryparams, pointer, options)
    searchoutline.add(search)
    search.position.x = searchwidth / 2 - search.width / 1.5 - searchbutton.width / 2
    search.position.z = 0.001

    if (options.keyboard) {
      options.keyboard.add(search)
      options.keyboard.showSelected = false
      //options.keyboard.selected = search
      search.active = true
    }
  }
}
