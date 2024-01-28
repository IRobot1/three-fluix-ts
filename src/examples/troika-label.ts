// @ts-ignore
import { Text } from "troika-three-text";
import { Mesh, Object3D } from "three";
import { LabelOptions, LabelParameters } from "three-fluix";

// https://protectwise.github.io/troika/troika-three-text/
// For list of icons, see https://fonts.google.com/icons

export class UILabel extends Object3D {
  isicon = false
  constructor(parameters: LabelParameters, protected options: LabelOptions = {}) {
    super()

    this.name = parameters.id != undefined ? parameters.id : 'label'
    this.isicon = parameters.isicon ? parameters.isicon : false

    const label = new Text();
    this.add(label)
    label.text = parameters.text ? parameters.text : '';
    if (this.isicon) {
      label.font = 'https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNa.woff'
      label.anchorX = 'center'
      label.anchorY = 'middle'
    }
    else {
      label.anchorX = parameters.alignX ? parameters.alignX : 'center'
      label.anchorY = parameters.alignY ? parameters.alignY : 'middle'
      label.maxWidth = parameters.maxwidth != undefined ? parameters.maxwidth : Infinity
      label.textAlign = label.anchorX
    }
    label.fontSize = parameters.size != undefined ? parameters.size : 0.07
    label.sync();

    //this._matparams = parameters.material ? parameters.material : { color: 'black' }
    //this._padding = parameters.padding != undefined ? parameters.padding : 0.02
    //this._overflow = parameters.overflow != undefined ? parameters.overflow : 'clip'

    this.visible = parameters.visible != undefined ? parameters.visible : true

    //this._fontName = parameters.font != undefined ? parameters.font : 'assets/helvetiker_regular.typeface.json'

  }

}
