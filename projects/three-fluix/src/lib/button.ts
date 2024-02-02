import { InteractiveEventType, ThreeInteractive } from "./three-interactive";

import { ButtonParameters } from "./model";
import { PanelEventType, PanelOptions } from "./panel";
import { UIEntry } from "./input-field";
import { UIKeyboardEvent } from "./keyboard";

export enum ButtonEventType {
  BUTTON_DOWN = 'button_down',
  BUTTON_UP = 'button_up',
  BUTTON_PRESSED = 'button_pressed',
}

export interface ButtonOptions extends PanelOptions {
}

export class UIButton extends UIEntry {
  override inputtype: string = 'button'
  public data: any

  constructor(parameters: ButtonParameters, interactive: ThreeInteractive, options: ButtonOptions) {
    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'button'

    const scaleOnClick = parameters.disableScaleOnClick != undefined ? false : true

    const buttonDown = () => {
      if (this.disabled || this.clicking || !this.visible) return
      if (scaleOnClick) this.scale.addScalar(-0.04);
      this.clicking = true;
      this.buttonDown()
    }

    const buttonUp = (generateEvent = false) => {
      if (!this.clicking || !this.visible) return
      if (scaleOnClick) this.scale.addScalar(0.04);
      this.clicking = false;
      this.buttonUp()
      if (generateEvent) this.pressed()
    }

    this.addEventListener(InteractiveEventType.POINTERDOWN, buttonDown)
    this.addEventListener(InteractiveEventType.POINTERUP, (e: any) => {
      buttonUp(true)
      e.stop = true
    })
    this.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      buttonUp()
      this.unhighlight()
    })

    this.addEventListener(InteractiveEventType.CLICK, () => {
      if (this.disabled || !this.visible) return;

      // button down event already generated in POINTERDOWN event

      const timer = setTimeout(() => {
        buttonUp()
        clearTimeout(timer);
      }, 100);
    })

    this.buttonDown = buttonDown
    this.buttonUp = buttonUp

    this.addEventListener(ButtonEventType.BUTTON_DOWN, buttonDown)
    this.addEventListener(ButtonEventType.BUTTON_UP, (e: any) => {
      buttonUp(e.generateEvent)
    })
  }

  override handleKeyDown(e: UIKeyboardEvent) {
    if (this.disabled) return

    if (e.code == 'Enter')
      this.buttonDown()
  }

  override handleKeyUp(e: UIKeyboardEvent) {
    if (this.disabled) return

    if (e.code == 'Enter')
      this.buttonUp(true)
  }

  buttonDown() { }
  buttonUp(generateEvent = false) { }

  pressed() { this.dispatchEvent<any>({ type: ButtonEventType.BUTTON_PRESSED }) }
}
