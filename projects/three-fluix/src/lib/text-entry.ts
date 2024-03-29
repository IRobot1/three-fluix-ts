import { InputField, InputFieldEventType, UIEntry } from "./input-field"
import { PanelEventType, PanelOptions } from "./panel"
import { UIKeyboardEvent } from "./keyboard"
import { UILabel } from "./label"
import { TextEntryParameters } from "./model"
import { PointerInteraction } from "./pointer-interaction"

export interface TextOptions extends PanelOptions {
}


export class UITextEntry extends UIEntry implements InputField {
  inputtype: string = 'text'

  protected label: UILabel

  protected _text = ''
  get text() { return this._text }
  set text(newvalue: string) {
    if (this._text != newvalue) {
      this._text = newvalue
      this.label.text = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.TEXT_CHANGED, text: newvalue })
    }
  }

  private _password: boolean
  get password() { return this._password }
  set password(newvalue: boolean) {
    if (this._password != newvalue) {
      this._password = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.TEXT_CHANGED, text: this.text })
    }
  }

  private _prompt: string
  get prompt() { return this._prompt }
  set prompt(newvalue: string) {
    if (this._prompt != newvalue) {
      this._prompt = newvalue
      this.dispatchEvent<any>({ type: InputFieldEventType.TEXT_CHANGED, text: this.text })
    }
  }

  private _passwordChar: string
  get passwordChar() { return this._passwordChar }
  set passwordChar(newvalue: string) {
    if (this._passwordChar != newvalue) {
      if (newvalue.length > 0) {
        this._passwordChar = newvalue.slice(0, 1)
        this.dispatchEvent<any>({ type: InputFieldEventType.TEXT_CHANGED, text: this.text })
      }
    }
  }


  constructor(parameters: TextEntryParameters = {}, pointer: PointerInteraction, options: TextOptions = {}) {
    if (parameters.height == undefined) parameters.height = 0.1

    super(parameters, pointer, options)

    this.name = parameters.id != undefined ? parameters.id : 'text-entry'

    const padding = (this.height / 0.1) * 0.02

    if (!parameters.label) parameters.label = {}
    if (parameters.label.size == undefined) parameters.label.size = (this.height - padding) / 2
    parameters.label.padding = padding
    parameters.label.maxwidth = this.width - padding * 2

    this._passwordChar = parameters.passwordChar != undefined ? parameters.passwordChar : '*'

    this._password = parameters.password != undefined ? parameters.password : false
    if (parameters.label.text && this.password)
      parameters.label.text = this.passwordChar.repeat(parameters.label.text.length);

    parameters.label.alignX = 'left'
    parameters.label.alignY = 'bottom'

    const label = new UILabel(parameters.label, { fontCache: this.fontCache, materials: this.materials })
    label.position.x = -this.width / 2 + label.padding
    label.position.y = -parameters.label.size / 2
    label.position.z = 0.001
    this.label = label

    this.add(label)

    this._prompt = parameters.prompt != undefined ? parameters.prompt : '_'

    this.text = label.text

    const textChanged = () => {
      if (this.disabled) return

      if (this.password)
        label.text = this.passwordChar.repeat(this.text.length);
      else
        label.text = this.text;

      if (this.active) {
        label.overflow = 'slice'
        label.text += this.prompt
      }
      else
        label.overflow = 'clip'
    }

    this.addEventListener(InputFieldEventType.TEXT_CHANGED, textChanged)
    this.addEventListener(InputFieldEventType.ACTIVE_CHANGED, () => {
      label.scrollToEnd = this.active
      textChanged()
    })

    this.addEventListener(PanelEventType.WIDTH_CHANGED, () => {
      label.maxwidth = this.width - this.label.padding * 2
      label.position.x = -this.width / 2 + this.label.padding
    })

  }

  override dispose() {
    super.dispose()
    this.label.dispose()
  }
  override handleKeyDown(e: UIKeyboardEvent) {
    if (this.disabled) return

    if (e.code == 'Backspace')
      this.text = this.text.slice(0, -1)

    if (e.ctrlKey) {
      if (e.code == 'KeyV') {
        navigator.clipboard.readText().then(text => {
          this.text += text;
        });
      }
      else if (e.code == 'KeyC' || e.code == 'KeyX') {
        navigator.clipboard.writeText(this.text).then(() => {
          if (e.code == 'KeyX') {
            this.text = '';
          }
        });
      }
    }

    else if (e.key.length == 1)
      this.filter(e)
  }



  filter(e: UIKeyboardEvent) {
    this.text += e.key
  }
}

