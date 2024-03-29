import { Group, MeshBasicMaterialParameters } from "three";

import { PointerEventType, PointerInteraction } from "./pointer-interaction";
import { PanelEventType, PanelOptions, UIPanel } from "./panel";
import { Controller, GUI } from "./gui-model";
import { CheckboxParameters, ColorEntryParameters, LabelParameters, ListParameters, NumberEntryParameters, PanelParameters, SelectParameters, SliderbarParameters, TextButtonParameters, TextEntryParameters } from "./model";
import { ButtonEventType, UIButton } from "./button";
import { UITextButton } from "./button-text";
import { ExpansionPanelParameters, UIExpansionPanel } from "./expansion-panel";
import { UILabel } from "./label";
import { SliderbarEventType, UISliderbar } from "./sliderbar";
import { NumberEntryEventType, UINumberEntry } from "./number-entry";
import { UITextEntry } from "./text-entry";
import { InputField, InputFieldEventType } from "./input-field";
import { CheckboxEventType, UICheckbox } from "./checkbox";
import { SelectEventType, UISelect } from "./select";
import { UIColorEntry } from "./color-entry";
import { UIColorPicker } from "./color-picker";

export interface PropertiesParameters extends PanelParameters {
  spacing?: number             // defaults to 0.02
  propertyHeight?: number      // defaults to 0.1
  font?: string                // default is Roboto
  fontSize?: number            // defaults to 0.04
  disabledMaterial?: MeshBasicMaterialParameters  // default is gray
  inputMaterial?: MeshBasicMaterialParameters     // default is dark gray
  labelwidth?: number          // default is 1/2 of width
  pickwidth?: number           // default is 1/4 of width
  inputwidth?: number          // default is 1/4 of width
}

interface HeightData {
  extraheight: number
  group: Group
  index: number
}

enum PropertiesEventType {
  UPDATE_POSITIONS = 'update_positions'
}

export class UIProperties extends UIPanel {
  private spacing: number
  private propertyHeight: number
  private fontSize: number
  private font?: string
  private disabledMaterial: MeshBasicMaterialParameters
  private inputMaterial: MeshBasicMaterialParameters
  private labelx: number
  private labelwidth: number
  private pickx: number
  private pickwidth: number
  private inputx: number
  private inputwidth: number

  private inputs: Array<InputField> = []
  private labels: Array<UILabel> = []

  constructor(parameters: PropertiesParameters, protected pointer: PointerInteraction, options: PanelOptions, gui: GUI) {
    super(parameters, options)

    this.name = parameters.id != undefined ? parameters.id : 'properties'

    this.spacing = parameters.spacing != undefined ? parameters.spacing : 0.02
    this.propertyHeight = parameters.propertyHeight != undefined ? parameters.propertyHeight : 0.1
    this.fontSize = parameters.fontSize != undefined ? parameters.fontSize : 0.06
    if (parameters.font) this.font = parameters.font

    let x = -this.width / 2
    this.labelwidth = parameters.labelwidth != undefined ? parameters.labelwidth : this.width / 2
    x += this.labelwidth
    this.labelx = x

    this.pickwidth = parameters.pickwidth != undefined ? parameters.pickwidth : this.width / 4
    x += this.pickwidth
    this.pickx = x

    this.inputwidth = parameters.inputwidth != undefined ? parameters.inputwidth : this.width / 4
    x += this.inputwidth
    this.inputx = x

    let disabledMaterial = parameters.disabledMaterial
    if (!disabledMaterial) disabledMaterial = { color: 'gray' }
    this.disabledMaterial = disabledMaterial

    let inputMaterial = parameters.inputMaterial
    if (!inputMaterial) inputMaterial = { color: 'darkgray' }
    this.inputMaterial = inputMaterial

    requestAnimationFrame(() => {
      this.height = this.addFolder(this, gui)
      this.addEventListener(PanelEventType.HEIGHT_CHANGED, (e: any) => {
        this.resizeGeometry()
      })

      if (options.keyboard && this.inputs.length > 0) options.keyboard.add(...this.inputs)
    })
  }

  addFolder(parent: UIPanel, gui: GUI): number {
    const data: Array<HeightData> = []

    gui.list.forEach((controller, index) => {
      const item: HeightData = { extraheight: 0, group: new Group(), index }
      // child updates height and adds objects to group
      this.addChild(parent, controller, item)

      // add this group to the parent
      parent.add(item.group)
      data.push(item)
    })

    parent.addEventListener(PropertiesEventType.UPDATE_POSITIONS, () => {
      // reposition and set parent height
      parent.height = this.updatePositions(data)
    })

    return this.updatePositions(data)
  }

  private updatePositions(data: Array<HeightData>): number {
    const height = data.reduce((total, next) => total + this.propertyHeight + next.extraheight + this.spacing, this.spacing)

    let y = 0
    data.forEach((item, index) => {
      if (index == 0) y = height / 2 - this.spacing - this.propertyHeight / 2
      item.group.position.y = y
      y -= this.spacing + this.propertyHeight + item.extraheight
    })

    return height
  }

  addChild(parent: UIPanel, controller: Controller, data: HeightData) {
    const font = this.font
    const size = this.fontSize
    const height = this.propertyHeight
    const disabled = !controller.enabled
    const fill = disabled ? this.disabledMaterial : this.inputMaterial

    if (controller.classname == 'function') {
      const params: TextButtonParameters = {
        label: {
          text: controller.title,
          size,
          font,
        },
        width: this.width - this.spacing * 2,
        height,
        disabled,
        fill,
      }
      const textbutton = this.createTextButton(params, controller.title)
      textbutton.addEventListener(ButtonEventType.BUTTON_PRESSED, () => {
        controller.execute()
      })
      data.group.add(textbutton)
      textbutton.position.set(0, 0, 0.001)
      this.inputs.push(textbutton)
      return
    }
    else if (controller.classname == 'folder') {
      const gui = controller.object as GUI
      const params: ExpansionPanelParameters = {
        expanded: gui.expanded,
        spacing: 0,
        width: this.width,
        height,
        label: {
          text: controller.title,
          size, 
          font,
        },
        fill,
        panel: {
          width: this.width,
          selectable: false,
        }
      }

      const expansionPanel = this.createExpansionPanel(params, controller.title)
      expansionPanel.panelExpanded = (expanded: boolean) => {
        data.extraheight = expanded ? expansionPanel.panel.height : 0

        // notify all parent panels to reposition
        expansionPanel.traverseAncestors(next => {
          next.dispatchEvent<any>({ type: PropertiesEventType.UPDATE_POSITIONS })
        })
      }

      expansionPanel.panel.addEventListener(PanelEventType.HEIGHT_CHANGED, () => {
        if (expansionPanel.expanded)
          data.extraheight = expansionPanel.panel.height
      })

      expansionPanel.panel.height = this.addFolder(expansionPanel.panel, controller.object as GUI)
      if (expansionPanel.expanded) data.extraheight = expansionPanel.panel.height
      data.group.add(expansionPanel)
      expansionPanel.position.set(0, 0, 0.001)
      this.inputs.push(expansionPanel)
      return
    }

    const color = disabled ? 'gray' : 'black'

    const labelparams: LabelParameters = {
      alignX: 'right',
      maxwidth: this.labelwidth - this.spacing * 2,
      text: controller.title,
      size,
      font,
      material: { color }
    }
    const label = this.createLabel(labelparams, controller.title)
    label.position.set(this.labelx - this.spacing, 0, 0.001)
    data.group.add(label)
    this.labels.push(label)

    switch (controller.classname) {

      case 'number': {
        const hasrange = (controller._min || controller._max)

        let sliderbar: UISliderbar
        if (hasrange) {
          const sliderparams: SliderbarParameters = {
            width: this.pickwidth - this.spacing * 2,
            height,
            slidersize: 0.03,
            min: controller._min as number,
            max: controller._max as number,
            step: controller._step as number,
            disabled: !controller.enabled,
            initialvalue: controller.getValue(),
            fill,
          }

          sliderbar = this.createSliderbar(sliderparams, controller.title)
          this.add(sliderbar)
          sliderbar.position.set(this.pickx - this.pickwidth / 2, 0, 0.001)
          data.group.add(sliderbar)

          sliderbar.addEventListener<any>(SliderbarEventType.VALUE_CHANGED, (e: any) => {
            numberentry.value = e.value
          })
          this.inputs.push(sliderbar)
        }

        let width = this.inputwidth - this.spacing * 2
        if (!hasrange) width += this.pickwidth

        const numberparams: NumberEntryParameters = {
          initialvalue: controller.getValue(),
          width,
          height,
          label: {
            size,
            font,
          },
          decimals: controller._decimals,
          disabled: !controller.enabled,
          min: controller._min as number,
          max: controller._max as number,
          step: controller._step as number,
          fill,
        }
        const numberentry = this.createNumberEntry(numberparams, controller.title)
        if (hasrange)
          numberentry.position.set(this.inputx - this.inputwidth / 2, 0, 0.001)
        else
          numberentry.position.set(this.pickx, 0, 0.001)
        data.group.add(numberentry)

        controller.updateDisplay = () => {
          if (controller.getValue() != numberentry.value) {
            numberentry.value = controller.getValue()
          }
        }

        numberentry.addEventListener(NumberEntryEventType.VALUE_CHANGED, (e: any) => {
          if (sliderbar) sliderbar.value = e.value
          controller.setValue(e.value)
        })
        this.inputs.push(numberentry)
        break
      }

      case 'string': {
        const maxwidth = this.pickwidth + this.inputwidth - this.spacing * 2
        const params: TextEntryParameters = {
          width: maxwidth,
          height,
          label: {
            text: controller.getValue(),
            size,
            font,
          },
          disabled: !controller.enabled,
          fill,
        }

        controller.updateDisplay = () => {
          if (controller.getValue() != textentry.text) {
            textentry.text = controller.getValue()
          }
        }

        const textentry = this.createTextEntry(params, controller.title)
        textentry.position.set(this.pickx, 0, 0.001)
        data.group.add(textentry)
        textentry.addEventListener(InputFieldEventType.TEXT_CHANGED, (e: any) => {
          controller.setValue(e.text)
        })

        this.inputs.push(textentry)
        break
      }

      case 'boolean': {
        const checkboxwidth = 0.1
        const params: CheckboxParameters = {
          width: checkboxwidth,
          height,
          checked: controller.getValue(),
          disabled: !controller.enabled,
          fill,
        }
        const checkbox = this.createCheckBox(params, controller.title)
        checkbox.position.set(this.pickx - this.pickwidth / 2, 0, 0.001)
        data.group.add(checkbox)

        controller.updateDisplay = () => {
          if (controller.getValue() != checkbox.checked) {
            checkbox.checked = controller.getValue()
          }
        }

        checkbox.addEventListener(CheckboxEventType.CHECKED_CHANGED, () => {
          controller.setValue(checkbox.checked);
        })
        this.inputs.push(checkbox)
        break
      }

      case 'options': {
        const options: Array<{ label: string, value: number }> = []
        if (Array.isArray(controller._min)) {
          const values = controller._min as Array<any>
          values.forEach((value, index) => {
            options.push({ label: value.toString(), value })
          })
        }
        else { // assume its an object
          for (let key in controller._min) {
            options.push({ label: key, value: controller._min[key] })
          }
        }
        let initialvalue = controller.object[controller.property]
        let match = options.find(x => x.value == initialvalue)
        if (match)
          initialvalue = match.label
        else if (initialvalue)
          initialvalue = initialvalue.toString()

        const maxwidth = this.pickwidth + this.inputwidth - this.spacing * 3
        const listparams: ListParameters = {
          width: maxwidth,
          data: options,
          field: 'label',
          itemheight: height,
          itemcount: 5,
          disabled: !controller.enabled,
          fontSize: size,
          maxwidth,
        }

        const selectparams: SelectParameters = {
          width: maxwidth,
          height,
          label: {
            text: initialvalue,
            size,
            font,
          },
          list: listparams,
          disabled: !controller.enabled,
          initialselected: initialvalue,
          fill,
        }

        controller.updateDisplay = () => {
          if (controller.getValue() != select.selected) {
            select.selected = controller.getValue()
          }
        }

        const select = this.createSelect(selectparams, controller.title)
        data.group.add(select)
        select.position.set(this.labelx + (this.pickwidth + this.inputwidth) / 2, 0, 0.001)

        select.addEventListener(SelectEventType.SELECTED_CHANGED, (e: any) => {
          controller.setValue(select.selected)
        })

        this.inputs.push(select)
        break
      }

      case 'color': {
        let width = this.width / 2 - this.spacing * 2
        width -= width / 2 //+ this.spacing

        let color = this.normalizeColorString(controller.getValue(), controller.rgbscale)

        const colorparams: ColorEntryParameters = {
          id: '',
          width: this.pickwidth - this.spacing * 2,
          height,
          disabled: !controller.enabled,
          fill: { color }
        }

        controller.updateDisplay = () => {
          if (controller.getValue() != colorentry.color) {
            colorentry.color = controller.getValue()
          }
        }

        const colorentry = this.createColorEntry(colorparams, controller.title)
        colorentry.position.set(this.pickx - this.pickwidth / 2, 0, 0.001)
        data.group.add(colorentry)

        colorentry.addEventListener(PanelEventType.COLOR_CHANGED, () => {
          textentry.text = colorentry.color.toString()
        })

        colorentry.addEventListener(PointerEventType.CLICK, () => {
          if (colorentry.disabled) return

          const colorpicker = this.getColorPicker()
          if (!colorpicker) {
            console.warn('Color Picker not provided')
            return
          }
          colorpicker.setColorEntry(colorentry)
        })

        const maxwidth = this.inputwidth - this.spacing * 2
        const params: TextEntryParameters = {
          width: maxwidth,
          height,
          label: {
            text: color,
            size,
            font,
          },
          disabled: !controller.enabled,
          fill,
        }

        const textentry = this.createTextEntry(params, controller.title)
        textentry.position.set(this.inputx - this.inputwidth / 2, 0, 0.001)
        data.group.add(textentry)

        textentry.addEventListener(InputFieldEventType.TEXT_CHANGED, () => {
          colorentry.color = textentry.text
          controller.setValue(textentry.text)
        })

        this.inputs.push(colorentry, textentry)
        break
      }

      default:
        //console.warn('unhandled class', controller.classname)
        break
    }
  }

  //
  // adapted from https://github.com/georgealways/lil-gui/blob/master/src/utils/normalizeColorString.js
  //
  private normalizeColorString(original: any, rgbscale: number): string {

    let match, result;
    if (typeof original == 'number') {
      result = original.toString(16).padStart(6, '0')
    }
    else if (typeof original == 'string') {
      if (original.startsWith('rgb')) {
        const rgb = original.replace('rgb(', '').replace(')', '').split(',')
        result = parseInt(rgb[0]).toString(16).padStart(2, '0')
          + parseInt(rgb[1]).toString(16).padStart(2, '0')
          + parseInt(rgb[2]).toString(16).padStart(2, '0')
      }
      else {
        if (original.startsWith('#')) original = original.substring(1)
        result = parseInt(original, 16).toString(16)
      }
    }
    else {
      let r, g, b
      if (Array.isArray(original)) {
        r = original[0] as number
        g = original[1] as number
        b = original[2] as number
      }
      else { //if (typeof original == 'object')
        r = original['r'] as number
        g = original['g'] as number
        b = original['b'] as number
      }
      if (rgbscale < 255) {
        r *= 255
        g *= 255
        b *= 255
      }
      result = r.toString(16).padStart(2, '0')
        + g.toString(16).padStart(2, '0')
        + b.toString(16).padStart(2, '0')

    }
    return '#' + result
  }

  dispose() {
    if (this.options.keyboard)
      this.options.keyboard.remove(...this.inputs)

    this.inputs.forEach(input => { input.dispose() })
    this.labels.forEach(label => { label.dispose() })
  }

  // overridables

  createLabel(parameters: LabelParameters, title: string): UILabel {
    return new UILabel(parameters, this.options)
  }

  createTextButton(parameters: TextButtonParameters, title: string): UIButton {
    return new UITextButton(parameters, this.pointer, this.options)
  }

  createExpansionPanel(parameters: ExpansionPanelParameters, title: string): UIExpansionPanel {
    return new UIExpansionPanel(parameters, this.pointer, this.options)
  }

  createSliderbar(parameters: SliderbarParameters, title: string): UISliderbar {
    return new UISliderbar(parameters, this.pointer, this.options)
  }

  createNumberEntry(parameters: NumberEntryParameters, title: string): UINumberEntry {
    return new UINumberEntry(parameters, this.pointer, this.options)
  }

  createTextEntry(parameters: TextEntryParameters, title: string): UITextEntry {
    return new UITextEntry(parameters, this.pointer, this.options)
  }

  createCheckBox(parameters: CheckboxParameters, title: string): UICheckbox {
    return new UICheckbox(parameters, this.pointer, this.options)
  }

  createSelect(parameters: SelectParameters, title: string): UISelect {
    return new UISelect(parameters, this.pointer, this.options)
  }

  createColorEntry(parameters: ColorEntryParameters, title: string): UIColorEntry {
    return new UIColorEntry(parameters, this.pointer, this.options)
  }

  getColorPicker(): UIColorPicker | undefined { return undefined }
}
