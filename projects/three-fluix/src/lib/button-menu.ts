import { Object3D, Vector3 } from "three"
import { PointerEventType, PointerInteraction } from "./pointer-interaction"
import { UILabel } from "./label"
import { ButtonParameters, LabelParameters, TextButtonParameters, UIOptions } from "./model"
import { ButtonEventType, UIButton } from "./button"
import { UITextButton } from "./button-text"

export interface MenuButtonParameters {
  button: ButtonParameters
  hint?: string             // hint to show when hovering over button
  selected?: (parameters: MenuButtonParameters) => void    // action to take on pressing button
}

export enum MenuItemEventType {
  MENU_SELECTED = 'menu_selected',
  MENU_MISSED = 'menu_missed',

}

export type MenuOrientation = 'horizontal' | 'vertical'
export type HintOptions = 'none' | 'above' | 'below'

export interface ButtonMenuParameters {
  orientation?: MenuOrientation         // default is horizontal
  spacing?: number                      // default is 0.02
  items: Array<MenuButtonParameters>
  hintoptions?: HintOptions             // default is 'below'
  hintLabel?: LabelParameters           // hint label parmaters
}

export class UIButtonMenu extends Object3D {
  buttons: Array<UIButton> = []
  width: number
  height: number
  spacing: number

  private hint?: UILabel;

  dispose() {
    if (this.hint) this.hint.dispose()
  }
  constructor(parameters: ButtonMenuParameters, protected pointer: PointerInteraction, protected options: UIOptions) {
    super()

    const orientation = parameters.orientation != undefined ? parameters.orientation : 'horizontal'

    let hintoptions = parameters.hintoptions != undefined ? parameters.hintoptions : 'below'
    if (orientation == 'vertical') hintoptions = 'none'

    if (hintoptions != 'none') {
      const labelparams = parameters.hintLabel != undefined ? parameters.hintLabel : <LabelParameters>{ alignX: 'left' }
      const hint = new UILabel(labelparams, options)
      hint.position.y = hintoptions ? -0.12 : 0.12
      this.add(hint)
      this.hint = hint
    }

    const spacing = parameters.spacing != undefined ? parameters.spacing : 0.02
    this.spacing = spacing

    const position = new Vector3()
    let offset = 0
    parameters.items.forEach(item => {
      const button = this.createButton(item.button)
      this.add(button)

      if (orientation == 'horizontal')
        position.x += offset + item.button.width! / 2
      else
        position.y -= offset + item.button.height! / 2

      button.position.copy(position)

      if (hintoptions != 'none') {
        button.addEventListener(PointerEventType.POINTERENTER, () => {
          if (!this.hint || !item.hint) return
          this.hint.text = item.hint
          this.hint.visible = true
        })
        button.addEventListener(PointerEventType.POINTERLEAVE, () => {
          if (!this.hint) return
          this.hint.visible = false
        })
      }

      // note, all buttons will fire this event, but likely only first will close the menu
      button.addEventListener(PointerEventType.POINTERMISSED, () => {
        this.missed()
      })

      button.addEventListener(ButtonEventType.BUTTON_PRESSED, () => {
        // three methods to intercept - callback, override or event
        if (item.selected) item.selected(item)
        this.selected(button, item)
      })

      this.buttons.push(button)

      if (orientation == 'horizontal') {
        position.x += spacing
        offset = item.button.width! / 2
      }
      else {
        position.y -= spacing
        offset = item.button.height! / 2
      }
    })

    if (orientation == 'horizontal') {
      this.width = position.x
      this.height = 0.1
    }
    else {
      this.width = 1
      this.height = -position.y
    }


  }

  // overridables

  createButton(parameters: ButtonParameters): UIButton {
    const textparams = parameters as TextButtonParameters
    const isicon = textparams.label.isicon != undefined ? textparams.label.isicon : false
    if (textparams.width == undefined) textparams.width = isicon ? 0.1 : 1
    if (textparams.height == undefined) textparams.height = 0.1

    // default is a text button, but can be something else
    return new UITextButton(textparams, this.pointer, this.options)
  }

  selected(button: UIButton, item: MenuButtonParameters) {
    this.dispatchEvent<any>({ type: MenuItemEventType.MENU_SELECTED, button, item })
  }

  missed() {
    this.dispatchEvent<any>({ type: MenuItemEventType.MENU_MISSED })
  }
}
