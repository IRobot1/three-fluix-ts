import { Mesh } from "three"
import { UIKeyboardEvent } from "./keyboard";
import { PanelEventType, PanelOptions, UIPanel } from "./panel";
import { PointerInteraction } from "./pointer-interaction";
import { InputParameters, PanelParameters } from "./model";

export enum InputFieldEventType {
  ACTIVE_CHANGED = 'active_changed',
  DISABLE_CHANGED = 'disable_changed',
  TEXT_CHANGED = 'text_changed',
  KEYDOWN = 'keydown',
  KEYUP = "keyup"
}

export interface InputField extends Mesh {
  inputtype: string
  active: boolean
  disabled: boolean
  width: number
  height: number
  depth: number
  dispose: () => void
}


export abstract class UIEntry extends UIPanel implements InputField {
  abstract inputtype: string

  private _active = false
  get active(): boolean { return this._active }
  set active(newvalue: boolean) {
    if (this._active != newvalue) {
      this._active = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.ACTIVE_CHANGED, active: newvalue })
    }
  }

  private _disabled: boolean

  get disabled(): boolean { return this._disabled }
  set disabled(newvalue: boolean) {
    if (this._disabled != newvalue) {
      this._disabled = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.DISABLE_CHANGED, active: newvalue })
    }
  }

  constructor(parameters: InputParameters, protected pointer: PointerInteraction, options: PanelOptions) {
    super(parameters, options)

    this._disabled = parameters.disabled != undefined ? parameters.disabled : false
    if (this.disabled) this.selectable = false

    this.addEventListener(InputFieldEventType.KEYDOWN, (event: any) => {
      const e = event.keyboard as UIKeyboardEvent
      if (!this.active) return

      this.handleKeyDown(e)
    })

    this.addEventListener(InputFieldEventType.KEYUP, (event: any) => {
      const e = event.keyboard as UIKeyboardEvent
      if (!this.active) return

      this.handleKeyUp(e)
    })

  }

  dispose() {  }

  handleKeyDown(keyboard: UIKeyboardEvent) { }
  handleKeyUp(keyboard: UIKeyboardEvent) { }
}

