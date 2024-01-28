import { Scene, Shape } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { ExpansionPanelParameters, FontCache, GUI, KeyboardInteraction, LabelParameters, NumberEntryParameters, NumberOptions, PanelOptions, PropertiesParameters, SelectParameters, SliderbarParameters, TextButtonParameters, TextEntryParameters, ThreeInteractive, UIButton, UIColorPicker, UIExpansionPanel, UILabel, UIMaterials, UINumberEntry, UIOptions, UIProperties, UISelect, UISliderbar, UITextButton, UITextEntry } from "three-fluix";

export class CustomPropertiesScene extends Scene {

  colorpicker: UIColorPicker
  properties : UIProperties

  constructor(private app: ThreeJSApp) {
    super()

    this.scale.setScalar(0.3)

    const options: UIOptions = {
      materials: new UIMaterials(),
      fontCache: new FontCache(),
      keyboard: new KeyboardInteraction(app)
    }

    const colorpicker = new UIColorPicker({}, app.interactive, options)
    this.add(colorpicker)
    colorpicker.visible = false

    //requestAnimationFrame(() => {
      const gui = this.makeCustomGUI()
      const params: PropertiesParameters = {
        width: 1.3,
        fill: { color: 'black' },
        inputMaterial: { color: '#424242' },
        labelwidth: 0.45,
        pickwidth: 0.6,
        inputwidth:0.25
      }
      const properties1 = new CustomProperties(params, app.interactive, options, gui)
      this.add(properties1)
      properties1.position.set(-1, 0, 0)
    properties1.getColorPicker = () => { return colorpicker }
      this.properties = properties1
    //})
    this.colorpicker = colorpicker
  }

  dispose() {
    this.properties.dispose()
    this.colorpicker.dispose()
    //console.warn(this.app.interactive.selectable)
  }

  makeCustomGUI() {
    const gui = new GUI({})

    const types = { Tetrahedon: 0, Octahedron: 1, Cube: 2, Dodecahedron: 3, Icosahedron: 4 }

    const one = gui.addFolder('PLATON ONLINE GENERATOR')
    one.add({ type: 0 }, 'type', types)
    one.add({ level: 3 }, 'level', 0, 6, 1)
    one.addColor({ color: 0x09135d }, 'color')
    one.add({ gloss: 0 }, 'gloss', -1, 1, 0.01)

    const two = gui.addFolder('SECOND PLATON')
    two.add({ type: 1 }, 'type', types)
    two.add({ level: 2 }, 'level', 0, 6, 1)
    two.add({ scale: 47 }, 'scale', 0, 100, 1)
    two.addColor({ color: 0xffffff }, 'color')
    two.add({ gloss: 0 }, 'gloss', -1, 1, 0.01)

    const three = gui.addFolder('THIRD PLATON')
    three.add({ type: 1 }, 'type', types)
    three.add({ level: 3 }, 'level', 0, 6, 1)
    three.add({ scale: 36 }, 'scale', 0, 100, 1)
    three.addColor({ color: 0xff003F }, 'color')
    three.add({ gloss: 0 }, 'gloss', -1, 1, 0.01)

    const four = gui.addFolder('EXPORT')
    four.add({ format: 0 }, 'format', { Image: 0, '3D Model': 1, 'Web Page': 2, 'JS Module': 3, 'URL Link': 4 })
    gui.add({ func() { console.log('export'); } }, 'func').name('Export as *.png image file')

    return gui
  }

  makeSampleGUI() {
    const folder = new GUI({ title: 'Disable', width: 300 })

    const gui = folder.addFolder('Folder');

    gui.add({ Number: 0 }, 'Number').disable().enable();
    gui.add({ Number: 0 }, 'Number').disable();

    gui.add({ Slider: 0 }, 'Slider', 0, 1).disable().enable();
    gui.add({ Slider: 0 }, 'Slider', 0, 1).disable();

    gui.add({ String: 'foo' }, 'String').disable().enable();
    gui.add({ String: 'foo' }, 'String').disable();

    gui.add({ Boolean: true }, 'Boolean').disable().enable();
    gui.add({ Boolean: true }, 'Boolean').disable();

    gui.add({ Options: 'a' }, 'Options', ['a', 'b', 'c']).disable().enable();
    gui.add({ Options: 'a' }, 'Options', ['a', 'b', 'c']).disable();

    gui.add({ func() { console.log('hi'); } }, 'func').name('Function').disable().enable();
    gui.add({ func() { console.log('hi'); } }, 'func').name('Function').disable();

    gui.addColor({ Color: 0xaa00ff }, 'Color').disable().enable();
    gui.addColor({ Color: 0xaa00ff }, 'Color').disable();

    return folder
  }

}

class CustomProperties extends UIProperties {

  constructor(private customparams: PropertiesParameters, interactive: ThreeInteractive, options: PanelOptions, gui: GUI) {
    super(customparams, interactive, options, gui)
  }

  override createLabel(parameters: LabelParameters): UILabel {
    parameters.material!.color = 'gray'
    //console.warn(parameters)
    return new UILabel(parameters, this.options)
  }


  override createTextButton(parameters: TextButtonParameters): UIButton {
    parameters.label!.material = { color: 'white' }
    return new UITextButton(parameters, this.interactive, this.options)
  }

  override createExpansionPanel(parameters: ExpansionPanelParameters): UIExpansionPanel {
    parameters.fill = this.customparams.fill
    parameters.label!.material = { color: 'white' }
    parameters.panel!.fill = this.customparams.fill
    parameters.indicatorMaterial = { color: 'white' }
    return new UIExpansionPanel(parameters, this.interactive, this.options)
  }

  override createSliderbar(parameters: SliderbarParameters): UISliderbar {
    parameters.slidermaterial = { color: 'orange' }
    return new UISliderbar(parameters, this.interactive, this.options)
  }

  override createNumberEntry(parameters: NumberEntryParameters, title: string): UINumberEntry {
    parameters.label!.material= { color: 'orange' } 
    if (title == 'level') {
      return new CustomNumberEntry(parameters, this.interactive, this.options, this.radius * 3, this.radius)
    }
    else if (title == 'gloss') {
      return new CustomNumberEntry(parameters, this.interactive, this.options, this.radius, this.radius * 3)
    }
    else
      return new UINumberEntry(parameters, this.interactive, this.options)
  }

  override createTextEntry(parameters: TextEntryParameters): UITextEntry {
    if (!parameters.label) parameters.label = {}
    parameters.label.material = { color: 'orange' }
    return new UITextEntry(parameters, this.interactive, this.options)
  }

  override createSelect(parameters: SelectParameters): UISelect {
    parameters.label!.material = { color: 'white' }
    parameters.indicatorMaterial = { color: 'white' }
    return new UISelect(parameters, this.interactive, this.options)
  }
}

export class CustomRectangleShape extends Shape {
  constructor(width: number, height: number, radius: number, radiustr: number, radiusbr: number, x = 0, y = 0) {
    super()

    this
      .moveTo(x, y + radius)
      .lineTo(x, height - radius)
      .quadraticCurveTo(x, height, x + radius, height)
      .lineTo(width - radiustr, height)
      .quadraticCurveTo(width, height, width, height - radiustr)
      .lineTo(width, y + radiusbr)
      .quadraticCurveTo(width, y, width - radiusbr, y)
      .lineTo(x + radius, y)
      .quadraticCurveTo(x, y, x, y + radius);
  }
}

export class CustomRectangleBorderShape extends CustomRectangleShape {
  constructor(width = 1, height = 1, radius = 0.1, radiustr: number, radiusbr: number, border = 0.1, curveSegments = 12) {
    super(width, height, radius, radiustr, radiusbr)

    const halfborder = border / 2
    const ratio = (width + halfborder) / (width - halfborder)

    const innershape = new CustomRectangleShape(width - halfborder, height - halfborder, radius * 1 / ratio, radiustr * 1 / ratio, radiusbr * 1 / ratio, halfborder, halfborder)
    this.holes.push(new Shape(innershape.getPoints().reverse()));
  }
}


class CustomNumberEntry extends UINumberEntry {
  constructor(parameters: NumberEntryParameters = {}, interactive: ThreeInteractive, options: NumberOptions, private radiustr: number, private radiusbr: number) {
    super(parameters, interactive, options)
  }

  override panelShape(): Shape {
    return new CustomRectangleShape(this.width, this.height, this.radius, this.radiustr, this.radiusbr)
  }

  override panelBorderShape(borderWidth: number): Shape {
    return new CustomRectangleBorderShape(this.width, this.height, this.radius, this.radiustr, this.radiusbr, borderWidth)
  }
}
