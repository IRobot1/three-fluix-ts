import { ColorRepresentation, Material, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D } from "three";

import { LabelFontStyle, LabelFontWeight, LabelParameters, UIOptions } from "./model";

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

  private label: Text

  get text() { return this.label.text }
  set text(newvalue: string) { this.label.text = newvalue }

  private _isicon = false
  private lastfont: string | undefined
  get isicon() { return this._isicon }
  set isicon(newvalue: boolean) {
    if (this._isicon != newvalue) {
      this._isicon = newvalue

      if (this.isicon) {
        this.lastfont = this.label.font
        this.label.font = 'https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNa.woff'
        this.label.anchorX = 'center'
        this.label.anchorY = 'middle'
      }
      else {
        this.label.font = this.lastfont
      }
    }
  }
  get maxwidth() { return this.label.maxWidth }
  set maxwidth(newvalue: number) {
    this.label.maxWidth = newvalue
    this.cliptowidth()
  }
  get alignX() { return this.label.anchorX }
  set alignX(newvalue: string) { this.label.anchorX = newvalue }

  get alignY() { return this.label.anchorY }
  set alignY(newvalue: string) { this.label.anchorY = newvalue }

  public padding: number

  get overflow() { return 'clip' }
  set overflow(newvalue: string) { }

  get material() { return this.label.material }
  set material(newvalue: Material | Material[]) {
    this.label.material = newvalue
  }

  get font() { return this.label.font }
  set font(newvalue: string) { this.label.font = newvalue }

  get fontSize() { return this.label.fontSize }
  set fontSize(newvalue: number) { this.label.fontSize = newvalue }

  get fontStyle() { return this.label.fontStyle }
  set fontStyle(newvalue: LabelFontStyle) { this.label.fontStyle = newvalue }

  get fontWeight() { return this.label.fontWeight }
  set fontWeight(newvalue: LabelFontWeight) { this.label.fontWeight = newvalue }


  private _matparams!: MeshBasicMaterialParameters
  get color() { return this._matparams.color! }
  set color(newvalue: ColorRepresentation) {
    if (this._matparams.color != newvalue) {
      this._matparams.color = newvalue;
      (this.label.material as MeshBasicMaterial).color.set(newvalue)
    }
  }

  private width!: number
  private height!: number

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
    this.padding = parameters.padding != undefined ? parameters.padding : 0.02

    if (!options.materials) {
      console.warn('UILabel requires material cache be provided')
      return
    }

    const label = new Text();
    this.add(label)
    this.label = label


    this._matparams = parameters.material ? parameters.material : { color: 0x000000 }
    label.material = options.materials.getMaterial('geometry', this.name, this._matparams)!;

    label.text = parameters.text ? parameters.text : '';
    label.fontSize = parameters.size != undefined ? parameters.size : 0.07
    if (parameters.fontStyle) label.fontStyle = parameters.fontStyle
    if (parameters.fontWeight) label.fontWeight = parameters.fontWeight
    label.whiteSpace = 'nowrap'

    this.isicon = parameters.isicon ? parameters.isicon : false
    if (!this.isicon) {
      label.anchorX = parameters.alignX ? parameters.alignX : 'center'
      label.anchorY = parameters.alignY ? parameters.alignY : 'middle'
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

    this.visible = parameters.visible != undefined ? parameters.visible : true

    if (parameters.font) this.font = parameters.font

  }

  dispose() {
    this.label.dispose()
  }
}
