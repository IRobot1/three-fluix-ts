import { Component } from "@angular/core";

import { Mesh, MeshBasicMaterialParameters, Scene, ShapeGeometry } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { PointerInteraction, PanelParameters, UIOptions, UIPanel, UITextButton, UIButtonMenu, MenuButtonParameters, ButtonMenuParameters, UITextEntry, InputFieldEventType } from "three-fluix";
import { InteractiveEventType, RoundedRectangleBorderGeometry, TextEntryParameters } from "three-fluix";
import { SVGButtonMenu, SVGButtonParameters } from "./svg-button";
import { TextButtonParameters } from "../../dist/three-fluix";

@Component({
  template: '',
})
export class WidgetsScene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()

    const z = -0.5

    app.scene = this

    const home = app.showHome(this)
    home.position.set(-0.1, 1, z)

    //app.camera.position.y = 2
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

    let activemenu: UIMenuPanel | undefined
    const setactive = (menu: UIMenuPanel | undefined) => {
      if (activemenu) {
        activemenu.parent = null
      }
      activemenu = menu
    }

    pointer.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      setactive(undefined)
    })

    const items: Array<MenuButtonParameters> = [
      {
        button: <SVGButtonParameters>{
          id: 'home', buttontype: 'svg',
          svg: "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><title>Three.js</title><path d=\"M.38 0a.268.268 0 0 0-.256.332l2.894 11.716a.268.268 0 0 0 .01.04l2.89 11.708a.268.268 0 0 0 .447.128L23.802 7.15a.268.268 0 0 0-.112-.45l-5.784-1.667a.268.268 0 0 0-.123-.035L6.38 1.715a.268.268 0 0 0-.144-.04L.456.01A.268.268 0 0 0 .38 0zm.374.654L5.71 2.08 1.99 5.664zM6.61 2.34l4.864 1.4-3.65 3.515zm-.522.12l1.217 4.926-4.877-1.4zm6.28 1.538l4.878 1.404-3.662 3.53zm-.52.13l1.208 4.9-4.853-1.392zm6.3 1.534l4.947 1.424-3.715 3.574zm-.524.12l1.215 4.926-4.876-1.398zm-15.432.696l4.964 1.424-3.726 3.586zM8.047 8.15l4.877 1.4-3.66 3.527zm-.518.137l1.236 5.017-4.963-1.432zm6.274 1.535l4.965 1.425-3.73 3.586zm-.52.127l1.235 5.012-4.958-1.43zm-9.63 2.438l4.873 1.406-3.656 3.523zm5.854 1.687l4.863 1.403-3.648 3.51zm-.54.04l1.214 4.927-4.875-1.4zm-3.896 4.02l5.037 1.442-3.782 3.638z\"/></svg>",
        },
        selected: () => {
          window.open('https://threejs.org', '_blank')
        }

      },
      {
        button: <TextButtonParameters>{
          id: 'learn', label: { text: 'Learn' }, width: 0.4, disableScaleOnClick: true,
        },
        selected: (parameters: MenuButtonParameters) => {
          if (activemenu && activemenu.name == parameters.button.id) return

          const width = 0.7
          const items: Array<MenuButtonParameters> = [
            { button: <TextButtonParameters>{ label: { text: 'documentation' }, value: 'https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene' }, },
            { button: <TextButtonParameters>{ label: { text: 'examples' }, value: 'https://threejs.org/examples/' }, },
            { button: <TextButtonParameters>{ label: { text: 'editor' }, value: 'https://threejs.org/editor/' }, },
            { button: <TextButtonParameters>{ label: { text: 'gpt' }, value: 'https://chat.openai.com/g/g-jGjqAMvED-three-js-mentor' }, },
          ]
          items.forEach(item => {
            const button = item.button as TextButtonParameters
            button.width = width
            button.label.alignX = 'left'
            button.label.padding = 0.05
          })
          const params: ButtonMenuParameters = {
            items, orientation: 'vertical', spacing: 0.01
          }
          const learn = new UIMenuPanel({ id: parameters.button.id, menu: params, width, fill: { color: 'gray' } }, pointer, options)
          const learnbutton = mainmenu.buttons[1]
          learnbutton.add(learn)
          learn.position.set(0, -learn.height / 2 - 0.11, 0.002)
          learn.menu.selected = (button: UITextButton, parameters: MenuButtonParameters) => {
            // open link in new tab
            window.open(parameters.button.value, '_blank')
          }

          setactive(learn)
        }

      },
      {
        button: <TextButtonParameters>{
          id: 'community', label: { text: 'Community' }, width: 0.45, disableScaleOnClick: true,
        },
        selected: (parameters: MenuButtonParameters) => {
          if (activemenu && activemenu.name == parameters.button.id) return

          const width = 0.7
          const items: Array<MenuButtonParameters> = [
            {
              button: <TextButtonParameters>{
                label: { text: 'questions', },
                value: 'https://stackoverflow.com/questions/tagged/three.js'
              },
            },
            {
              button: <TextButtonParameters>{
                label: { text: 'discord', },
                value: 'https://discord.com/invite/56GBJwAnUS'
              },
            },
            {
              button: <TextButtonParameters>{
                label: { text: 'forum', },
                value: 'https://discourse.threejs.org/'
              },
            },
            {
              button: <TextButtonParameters>{
                label: { text: 'twitter', },
                value: 'https://twitter.com/threejs'
              },
            },
          ]
          items.forEach(item => {
            const button = item.button as TextButtonParameters
            button.width = width
            button.label.alignX = 'left'
            button.label.padding = 0.05
          })

          const params: ButtonMenuParameters = {
            items, orientation: 'vertical', spacing: 0.01
          }
          const community = new UIMenuPanel({ id: parameters.button.id, menu: params, width, fill: { color: 'gray' } }, pointer, options)
          const communitybutton = mainmenu.buttons[2]
          communitybutton.add(community)
          community.position.set(0, -community.height / 2 - 0.11, 0.002)

          community.menu.selected = (button: UITextButton, parameters: MenuButtonParameters) => {
            window.open(parameters.button.value, '_blank')
          }

          setactive(community)
        }

      },
      {
        button: <TextButtonParameters>{
          disabled: true, label: { text: 'Merch' }, width: 0.4
        }
      },
    ]

    const params: ButtonMenuParameters = {
      items, hintoptions: 'none'
    }

    const mainmenu = new SVGButtonMenu(params, pointer, options)
    this.add(mainmenu)
    mainmenu.position.x = -this.width / 2 + 0.05

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
      window.open(`https://discourse.threejs.org/search?q=${search.text}`)
    }

    const textentryparams: TextEntryParameters = {
      width: 0.35, radius: 0.05,
      label: { maxwidth: 0.3 }
    }
    const search = new UITextEntry(textentryparams, pointer, options)
    searchoutline.add(search)
    search.position.x = searchwidth / 2 - search.width / 1.5 - searchbutton.width / 2
    search.position.z = 0.001
    search.highlight = () => { }

    if (options.keyboard) {
      options.keyboard.add(search)
      options.keyboard.showSelected = false
      //options.keyboard.selected = search
      search.active = true
    }
  }
}

interface MenuPanelParameters extends PanelParameters {
  menu: ButtonMenuParameters
}
class UIMenuPanel extends UIPanel {
  menu: UIButtonMenu
  constructor(parameters: MenuPanelParameters, pointer: PointerInteraction, options: UIOptions) {
    parameters.selectable = false

    super(parameters, options)

    const menu = new UIButtonMenu(parameters.menu, pointer, options)
    this.add(menu)
    menu.position.z = 0.001

    this.height = menu.height

    menu.position.y = menu.height / 2
    this.menu = menu
  }


}
