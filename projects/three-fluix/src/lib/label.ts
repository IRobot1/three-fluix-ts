import { ColorRepresentation, Material, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Object3D, Vector3 } from "three";
import { TextGeometry, TextGeometryParameters } from "three/examples/jsm/geometries/TextGeometry";
import { Font } from "three/examples/jsm/loaders/FontLoader";

import { LabelAlignX, LabelAlignY, LabelParameters, UIOptions, LabelOverflow } from "./model";
import { materialIconsMap } from "./icon-data";

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

  cliptowidth() {
    switch (this.label.anchorX) {
      case 'center':
        this.label.clipRect = [-this.maxwidth / 2, -this.height, this.maxwidth / 2, this.height]
        break;
      case 'left':
        this.label.clipRect = [0, -this.height, this.maxwidth, this.height]
        break;
      case 'right':
        this.label.clipRect = [-this.maxwidth, -this.height, 0, this.height]
        break;
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
    this.cliptowidth()

    label.addEventListener('synccomplete', () => {
      const bounds = label.textRenderInfo!.blockBounds!
      this.height = (bounds[3] - bounds[1])
      this.width = (bounds[2] - bounds[0])
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


//// Needed to calculate length of a fragment of text for this font
//interface FontData {
//  ascender: number
//  boundingBox: {
//    yMin: number,
//    xMin: number,
//    yMax: number,
//    xMax: number,
//  },
//  cssFontStyle: string    // normal
//  cssFontWeight: string  // normal
//  descender: number
//  familyName: string
//  glyphs: {
//    [key: string]: {
//      x_min: number
//      x_max: number
//      ha: number
//      o: string // SVG path
//    };
//  },
//  lineHeight: number
//  original_font_information: any
//  resolution: number, // default is 1000
//  underlinePosition: number
//  underlineThickness: number
//}


//// single line of text

//export class XUILabel extends Object3D {
//  private mesh: Mesh

//  private _text: string
//  get text() { return this._text }
//  set text(newvalue: string) {
//    if (this._text != newvalue) {
//      this._text = newvalue;
//      this.updateLabel()
//    }
//  }

//  private _size = 0.1
//  get size() { return this._size }
//  set size(newvalue: number) {
//    if (this._size != newvalue) {
//      this._size = newvalue;
//      this.updateLabel()
//    }
//  }

//  private _matparams!: MeshBasicMaterialParameters
//  get color() { return this._matparams.color! }
//  set color(newvalue: ColorRepresentation) {
//    if (this._matparams.color != newvalue) {
//      this._matparams.color = newvalue;
//      if (this)
//        (this.mesh.material as MeshBasicMaterial).color.set(newvalue)
//    }
//  }

//  private _padding = 0.02
//  get padding() { return this._padding }
//  set padding(newvalue: number) {
//    if (this._padding != newvalue) {
//      this._padding = newvalue;
//      this.updateLabel()
//    }
//  }

//  protected _width = 0
//  get width() { return this._width }

//  protected set width(newvalue: number) {
//    if (this._width != newvalue) {
//      this._width = newvalue
//      this.dispatchEvent<any>({ type: LabelEventType.WIDTH_CHANGED, width: newvalue })
//    }
//  }

//  protected _height = 0
//  get height() { return this._height }
//  protected set height(newvalue: number) {
//    if (this._height != newvalue) {
//      this._height = newvalue
//      this.dispatchEvent<any>({ type: LabelEventType.HEIGHT_CHANGED, height: newvalue })
//    }
//  }

//  get hidden() { return !this.visible }
//  set hidden(newvalue: boolean) { this.visible = !newvalue }

//  private translateXAlign = 0
//  private translateYAlign = 0

//  private _alignX: LabelAlignX
//  get alignX() { return this._alignX }
//  set alignX(newvalue: LabelAlignX) {
//    if (this._alignX != newvalue) {
//      this._alignX = newvalue
//      let x = 0
//      switch (newvalue) {
//        case 'center':
//          x = -this.textcenter.x
//          break
//        case 'right':
//          x = -this.textsize.x
//          break
//        case 'left':
//          x = 0
//          break
//      }
//      this.mesh.position.set(-this.translateXAlign + x, 0, 0)
//      this.translateXAlign = x
//    }
//  }

//  private _alignY: LabelAlignY
//  get alignY() { return this._alignY }
//  set alignY(newvalue: LabelAlignY) {
//    if (this._alignY != newvalue) {
//      this._alignY = newvalue
//      let y = 0
//      switch (newvalue) {
//        case 'middle':
//          y = -this.textcenter.y
//          break
//        case 'top':
//          y = -this.textsize.y
//          break
//        case 'bottom':
//          y = 0
//          break
//      }
//      this.mesh.position.set(0, -this.translateYAlign + y, 0)
//      this.translateYAlign = y
//    }
//  }

//  isicon: boolean

//  private _maxwidth: number
//  get maxwidth() { return this._maxwidth }
//  set maxwidth(newvalue: number) {
//    if (this._maxwidth != newvalue) {
//      this._maxwidth = newvalue
//      this.updateLabel()
//    }
//  }


//  private _overflow: LabelOverflow
//  get overflow() { return this._overflow }
//  set overflow(newvalue: LabelOverflow) {
//    if (this._overflow != newvalue) {
//      this._overflow = newvalue
//      this.updateLabel()
//    }
//  }

//  private _fontName: string
//  get fontName() { return this._fontName }
//  set fontName(newvalue: string) {
//    if (this._fontName != newvalue) {
//      this._fontName = newvalue;
//      if (!this.options.fontCache) return

//      this.options.fontCache.getFont(this.fontName, (font: Font) => {
//        this.font = font
//        if (!this.isicon) this.updateLabel()
//      })
//    }
//  }
//  private font?: Font;
//  private materialFont?: Font;

//  private textsize = new Vector3()
//  private textcenter = new Vector3()

//  get material() { return this.mesh.material }
//  set material(newvalue: Material | Material[]) {
//    this.mesh.material = newvalue
//  }

//  constructor(parameters: LabelParameters, protected options: LabelOptions = {}) {
//    super()

//    this.name = parameters.id != undefined ? parameters.id : 'label'

//    this._text = parameters.text ? parameters.text : ''
//    this._size = parameters.size != undefined ? parameters.size : 0.07
//    this._matparams = parameters.material ? parameters.material : { color: 'black' }
//    this._padding = parameters.padding != undefined ? parameters.padding : 0.02
//    this._alignX = parameters.alignX ? parameters.alignX : 'center'
//    this._alignY = parameters.alignY ? parameters.alignY : 'middle'
//    this.isicon = parameters.isicon ? parameters.isicon : false

//    this._maxwidth = parameters.maxwidth != undefined ? parameters.maxwidth : Infinity
//    this._overflow = parameters.overflow != undefined ? parameters.overflow : 'clip'

//    this.visible = parameters.visible != undefined ? parameters.visible : true

//    this._fontName = parameters.font != undefined ? parameters.font : 'assets/helvetiker_regular.typeface.json'

//    this.mesh = new Mesh()
//    this.add(this.mesh)

//    if (!options.materials) {
//      console.warn('UILabel requires material cache be provided')
//      return
//    }

//    this.mesh.material = options.materials.getMaterial('geometry', this.name, this._matparams)!;


//    if (!options.fontCache) {
//      console.warn('UILabel requires font cache be provided')
//      return
//    }

//    options.fontCache.getFont(this.fontName, (font: Font) => {
//      //console.warn(font)
//      this.font = font
//      if (!this.isicon) this.updateLabel()
//    })

//    options.fontCache.getFont('assets/Material Icons_Regular.json', (font: Font) => {
//      //console.warn(font)
//      this.materialFont = font
//      if (this.isicon) this.updateLabel()

//    })
//  }

//  // adapted from https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/FontLoader.js

//  private truncateText(): string {
//    if (!this.font) return ''

//    // @ts-ignore
//    const data = this.font.data as FontData
//    const scale = this.size / data.resolution;

//    let offsetX = 0

//    const chars = Array.from(this.text);
//    if (this.overflow == 'slice') chars.reverse()

//    let index = 0
//    for (; index < chars.length; index++) {

//      const char = chars[index];

//      if (char === '\n') break

//      const glyph = data.glyphs[char] || data.glyphs['?'];

//      if (!glyph) break

//      offsetX += (glyph.ha * scale);
//      if (offsetX > this.maxwidth) break
//    }
//    if (this.overflow == 'clip')
//      return this.text.slice(0, index)
//    return this.text.slice(chars.length - index)
//  }

//  public updateLabel() {
//    if (this.text == undefined) return

//    if (!this.font) {
//      // uncomment this if label isn't appearing as expected
//      //console.warn(`Changing UILabel ${this.name} property before font has finished loading`)
//      return
//    }

//    const options: TextGeometryParameters = {
//      font: this.isicon ? this.materialFont! : this.font, height: 0, size: this.size
//    }

//    let text = this.text
//    // only add text if font is loaded
//    if (this.isicon) {
//      const icontext = materialIconsMap.get(this.text)
//      if (icontext) text = icontext
//    }
//    else if (this.maxwidth < Infinity) {
//      text = this.truncateText()
//    }
//    this.mesh.geometry = new TextGeometry(text, options)
//    this.mesh.geometry.computeBoundingBox()

//    const box = this.mesh.geometry.boundingBox!
//    const size = box.getSize(this.textsize)
//    const center = box.getCenter(this.textcenter)

//    let x = 0, y = 0
//    switch (this.alignX) {
//      case 'center':
//        x = -center.x
//        break
//      case 'right':
//        x = -size.x
//        break
//      case 'left':
//      default:
//        break
//    }
//    switch (this.alignY) {
//      case 'middle':
//        y = -center.y
//        break
//      case 'top':
//        y = -size.y
//        break
//      case 'bottom':
//      default:
//        break
//    }
//    this.mesh.position.set(x, y, 0)
//    this.translateXAlign = x
//    this.translateYAlign = y

//    this.width = size.x + this.padding * 2
//    this.height = size.y + this.padding * 2
//  }

//}

