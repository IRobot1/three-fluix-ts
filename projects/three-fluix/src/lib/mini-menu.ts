import { MeshBasicMaterialParameters, Object3D, Vector3 } from "three"
import { InteractiveEventType, PointerInteraction } from "./pointer-interaction"
import { UILabel } from "./label"
import { LabelParameters, TextButtonParameters, UIOptions } from "./model"
import { ButtonEventType, UIButton } from "./button"
import { UITextButton } from "./button-text"

export interface MenuItemParameters {
  text: string        // text or material icon name
  hint: string        // hint to show when hovering over icon
  isicon?: boolean    // default is false
  disabled?: boolean  // default is false
  width?: number      // default is 0.1 for icon, otherwise, 1
  fontsize?: number   // default is 0.1
  fill?: MeshBasicMaterialParameters
  selected?: () => void
}

export enum MenuItemEventType {
  MENU_SELECTED = 'menu_selected',
  MENU_MISSED = 'menu_missed',

}


export interface MenuParameters {
  spacing?: number                      // default is 0.02
  fill?: MeshBasicMaterialParameters    // default is gray
  items: Array<MenuItemParameters>
  hintbelow?: boolean                    // default is true (below buttons)
  hintLabel?: LabelParameters            // hint label parmaters
}

export class UIMiniMenu extends Object3D {
  buttons: Array<UIButton> = []
  width: number

  private hint: UILabel;
  dispose() {
    this.hint.dispose()
  }
  constructor(parameters: MenuParameters, private pointer: PointerInteraction, private options: UIOptions) {
    super()

    const below = parameters.hintbelow != undefined ? parameters.hintbelow : true
    const labelparams = parameters.hintLabel != undefined ? parameters.hintLabel : <LabelParameters>{ alignX: 'left' }
    const hint = new UILabel(labelparams, options)
    hint.position.y = below ? -0.12 : 0.12
    this.add(hint)
    this.hint = hint

    const spacing = parameters.spacing != undefined ? parameters.spacing : 0.02

    const position = new Vector3()
    let width = 0
    parameters.items.forEach(item => {
      if (!item.fill) item.fill = parameters.fill

      const isicon = item.isicon != undefined ? item.isicon : false
      if (!item.width) item.width = isicon ? 0.1 : 1

      position.x += width + item.width / 2

      const button = this.createButton(item)
      button.position.copy(position)

      button.addEventListener(InteractiveEventType.POINTERENTER, () => {
        hint.text = item.hint
        hint.visible = true
      })
      pointer.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
        hint.visible = false
      })

      button.addEventListener(ButtonEventType.BUTTON_PRESSED, () => {
        if (item.selected) {
          // three methods to intercept - callback, override or event
          item.selected()
          this.pressed(item)
        }
      })

      this.buttons.push(button)

      position.x += spacing
      width = item.width / 2
    })

    pointer.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      this.missed()
    })

    this.width = width
  }

  // overridables

  createButton(parameters: MenuItemParameters): UIButton {
    const params: TextButtonParameters = {
      width: parameters.width, height: 0.1,
      fill: parameters.fill,
      label: {
        text: parameters.text, material: { color: 'black' }, isicon: parameters.isicon, size: parameters.fontsize,
      }, value: parameters
    }

    // default is a text button, but can be something else
    const button = new UITextButton(params, this.pointer, this.options)
    this.add(button)

    return button
  }

  pressed(item: MenuItemParameters) {
    this.dispatchEvent<any>({ type: MenuItemEventType.MENU_SELECTED, item })
  }

  missed() {
    this.dispatchEvent<any>({ type: MenuItemEventType.MENU_MISSED })
  }
}
