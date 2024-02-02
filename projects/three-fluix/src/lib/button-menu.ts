import { Object3D, Vector3 } from "three"
import { InteractiveEventType, ThreeInteractive } from "./three-interactive"
import { UILabel } from "./label"
import { LabelParameters, TextButtonParameters, UIOptions } from "./model"
import { ButtonEventType, UIButton } from "./button"
import { UITextButton } from "./button-text"

export interface MenuButtonParameters extends TextButtonParameters {
  hint: string             // hint to show when hovering over button
  selected?: () => void    // action to take on pressing button
}

export enum MenuItemEventType {
  MENU_SELECTED = 'menu_selected',
  MENU_MISSED = 'menu_missed',

}

export type MenuOrientation = 'horizontal' | 'vertical'
export type HintOptions = 'none' | 'above' | 'below'

export interface MenuParameters {
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

  private hint?: UILabel;

  dispose() {
    if (this.hint) this.hint.dispose()
  }
  constructor(parameters: MenuParameters, protected interactive: ThreeInteractive, protected options: UIOptions) {
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

    const position = new Vector3()
    let offset = 0
    parameters.items.forEach(item => {
      const isicon = item.label.isicon != undefined ? item.label.isicon : false
      if (item.width == undefined) item.width = isicon ? 0.1 : 1
      if (item.height == undefined) item.height = 0.1

      if (orientation == 'horizontal')
        position.x += offset + item.width / 2
      else
        position.y -= offset + item.height / 2

      const button = this.createButton(item)
      this.add(button)
      button.position.copy(position)

      if (hintoptions != 'none') {
        button.addEventListener(InteractiveEventType.POINTERENTER, () => {
          if (!this.hint) return
          this.hint.text = item.hint
          this.hint.visible = true
        })
        button.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
          if (!this.hint) return
          this.hint.visible = false
        })
      }

      // note, all buttons will fire this event, but likely only first will close the menu
      button.addEventListener(InteractiveEventType.POINTERMISSED, () => {
        this.missed()
      })

      button.addEventListener(ButtonEventType.BUTTON_PRESSED, () => {
        if (item.selected) {
          // three methods to intercept - callback, override or event
          item.selected()
          this.pressed(item)
        }
      })

      this.buttons.push(button)

      if (orientation == 'horizontal') {
        position.x += spacing
        offset = item.width / 2
      }
      else {
        position.y -= spacing
        offset = item.height / 2
      }
    })

    if (orientation == 'horizontal') {
      this.width = offset
      this.height = 0.1
    }
    else {
      this.width = 1
      this.height = offset
    }


  }

  // overridables

  createButton(parameters: TextButtonParameters): UIButton {
    // default is a text button, but can be something else
    return new UITextButton(parameters, this.interactive, this.options)
  }

  pressed(item: MenuButtonParameters) {
    this.dispatchEvent<any>({ type: MenuItemEventType.MENU_SELECTED, item })
  }

  missed() {
    this.dispatchEvent<any>({ type: MenuItemEventType.MENU_MISSED })
  }
}
