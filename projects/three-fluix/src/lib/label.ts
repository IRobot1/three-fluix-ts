import { ColorRepresentation, Material, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, Vector3 } from "three";

import { LabelParameters, UIOptions } from "./model";

// @ts-ignore
import { Text } from "troika-three-text";

// https://protectwise.github.io/troika/troika-three-text/
// For list of icons, see https://fonts.google.com/icons

export interface LabelOptions extends UIOptions {
}

export enum LabelEventType {
  WIDTH_CHANGED = 'label_width_changed',
  HEIGHT_CHANGED = 'label_height_changed',
}

export class UILabel extends Object3D {
  isicon = false

  private label: Text

  get text() { return this.label.text }
  set text(newvalue: string) { this.label.text = newvalue }

  get maxwidth() { return this.label.maxWidth }
  set maxwidth(newvalue: number) {
    this.label.maxWidth = newvalue
    this.cliptowidth()
  }
  get alignX() { return this.label.anchorX }
  get aligny() { return this.label.anchorY }

  public padding: number

  get overflow() { return 'clip' }
  set overflow(newvalue: string) { }

  get material() { return this.label.material }
  set material(newvalue: Material | Material[]) {
    this.label.material = newvalue
  }

  private _matparams!: MeshBasicMaterialParameters
  get color() { return this._matparams.color! }
  set color(newvalue: ColorRepresentation) {
    if (this._matparams.color != newvalue) {
      this._matparams.color = newvalue;
      (this.label.material as MeshBasicMaterial).color.set(newvalue)
    }
  }

  width!: number
  height!: number

  cliptowidth(offset = 0) {
    switch (this.label.anchorX) {
      case 'center':
        this.label.clipRect = [-this.maxwidth / 2, -this.height, this.maxwidth / 2, this.height]
        break;
      case 'left':
        this.label.clipRect = [offset, -this.height, this.maxwidth + offset, this.height]
        break;
      case 'right':
        this.label.clipRect = [-this.maxwidth, -this.height, 0, this.height]
        break;
    }
  }

  private _scrollToEnd = false
  get scrollToEnd() { return this._scrollToEnd }
  set scrollToEnd(newvalue: boolean) {
    if (this._scrollToEnd != newvalue) {
      this._scrollToEnd = newvalue
      this.positionText()
    }
  }

  private scrollOffset = 0
  private positionText() {
    if (this.scrollToEnd) {
      if (this.scrollOffset > 0) {
        this.cliptowidth(this.scrollOffset)
        this.label.position.x = -this.width + this.maxwidth
      }
      else if (this.label.position.x) {
        this.label.position.x = 0
        this.cliptowidth()
      }
    }
    else {
      this.label.position.x = 0
      this.cliptowidth()
    }
  }

  constructor(parameters: LabelParameters, protected options: LabelOptions = {}) {
    super()

    this.name = parameters.id != undefined ? parameters.id : 'label'
    this.isicon = parameters.isicon ? parameters.isicon : false
    this.padding = parameters.padding != undefined ? parameters.padding : 0.02

    if (!options.materials) {
      console.warn('UILabel requires material cache be provided')
      return
    }

    const label = new Text();
    this.add(label)
    this.label = label

    this._matparams = parameters.material ? parameters.material : { color: 'black' }
    label.material = options.materials.getMaterial('geometry', this.name, this._matparams)!;

    label.text = parameters.text ? parameters.text : '';
    label.fontSize = parameters.size != undefined ? parameters.size : 0.07
    label.whiteSpace = 'nowrap'

    if (this.isicon) {
      label.font = 'https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNa.woff'
      label.anchorX = 'center'
      label.anchorY = 'middle'
    }
    else {
      label.anchorX = parameters.alignX ? parameters.alignX : 'center'
      label.anchorY = parameters.alignY ? parameters.alignY : 'middle'
      label.textAlign = label.anchorX

    }

    const maxwidth = parameters.maxwidth != undefined ? parameters.maxwidth : Infinity
    label.maxWidth = maxwidth

    label.addEventListener('synccomplete', () => {
      const bounds = label.textRenderInfo!.blockBounds!
      this.height = (bounds[3] - bounds[1])
      this.width = (bounds[2] - bounds[0])

      if (this.isicon) return

      this.scrollOffset = this.width - this.maxwidth
      this.positionText()
    })

    label.sync();
    //this._overflow = parameters.overflow != undefined ? parameters.overflow : 'clip'

    this.visible = parameters.visible != undefined ? parameters.visible : true

    //this._fontName = parameters.font != undefined ? parameters.font : 'assets/helvetiker_regular.typeface.json'

  }

  dispose() {
    this.label.dispose()
  }
}
