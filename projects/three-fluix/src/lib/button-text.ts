import { PointerInteraction } from "./pointer-interaction";

import { TextButtonParameters } from "./model";
import { UILabel } from "./label";
import { ButtonOptions, UIButton } from "./button";
import { PanelEventType } from "./panel";

export class UITextButton extends UIButton {

  readonly label: UILabel

  get text() { return this.label.text }
  set text(newvalue: string) {
    if (this.label.text != newvalue) {
      this.label.text = newvalue
    }
  }

  get isicon() { return this.label.isicon }
  set isicon(newvalue: boolean) {
    if (this.label.isicon != newvalue) {
      this.label.isicon = newvalue;
    }
  }

  constructor(parameters: TextButtonParameters, pointer: PointerInteraction, options: ButtonOptions) {
    if (!parameters.height) parameters.height = 0.1
    
    super(parameters, pointer, options)

    this.name = parameters.id != undefined ? parameters.id : 'text-button'

    const padding = parameters.label.padding != undefined ? parameters.label.padding : 0.02
    if (parameters.label.maxwidth == undefined) parameters.label.maxwidth = this.width - padding * 2

    const label = new UILabel(parameters.label, { fontCache: this.fontCache, materials: this.materials })
    this.add(label)

    if (label.alignX == 'left')
      label.position.x = -this.width / 2 +  label.padding
    else if (label.alignX == 'right')
      label.position.x = this.width /2 - label.padding

    label.position.z = 0.001
    this.label = label

    this.addEventListener(PanelEventType.WIDTH_CHANGED, () => { label.maxwidth = this.width })
  }

  override dispose() {
    super.dispose()
    this.label.dispose()
  }
}
