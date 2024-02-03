import { Mesh } from "three"
import { UIKeyboardEvent } from "./keyboard";
import { PanelOptions, UIPanel } from "./panel";
import { ThreeInteractive } from "./three-interactive";
import { InputParameters, PanelParameters } from "./model";

export enum InputFieldEventType {
  ACTIVE_CHANGED = 'active_changed',
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

  constructor(parameters: InputParameters, protected interactive: ThreeInteractive, options: PanelOptions) {
    super(parameters, options)


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

