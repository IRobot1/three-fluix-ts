import { ColorRepresentation, Material, Mesh, MeshBasicMaterial } from "three";

import { PointerEventType, PointerInteraction } from "./pointer-interaction";
import { PanelEventType, PanelOptions } from "./panel";
import { CheckboxParameters } from "./model";
import { UIEntry } from "./input-field";
import { UIKeyboardEvent } from "./keyboard";
import { RoundedRectangleGeometry } from "./shapes/rounded-rectangle-geometry";



export enum CheckboxEventType {
  CHECKED_CHANGED = 'checked_changed',
  CHECKED_COLOR_CHANGED = 'checked_color_changed',
  INDETERMINATE_CHANGED = 'indeterminate_changed',
}
export interface CheckboxOptions extends PanelOptions { }

export class UICheckbox extends UIEntry {
  inputtype: string = 'checkbox'

  private _checked = false
  get checked(): boolean { return this._checked }
  set checked(newvalue: boolean) {
    if (this._checked != newvalue) {
      this._checked = newvalue
      this.dispatchEvent<any>({ type: CheckboxEventType.CHECKED_CHANGED, checked: newvalue })
    }
  }

  // show/hide indeterminate visual
  private _indeterminate = false
  get indeterminate(): boolean { return this._indeterminate }
  set indeterminate(newvalue: boolean) {
    if (this._indeterminate != newvalue) {
      this._indeterminate = newvalue
      this.dispatchEvent<any>({ type: CheckboxEventType.INDETERMINATE_CHANGED })
    }
  }

  private checkmaterial: Material
  private _checkcolor: ColorRepresentation
  get checkcolor() { return this._checkcolor }
  set checkcolor(newvalue: ColorRepresentation) {
    if (this._checkcolor != newvalue) {
      this._checkcolor = newvalue;
      (this.checkmaterial as MeshBasicMaterial).color.set(newvalue)
      this.dispatchEvent<any>({ type: CheckboxEventType.CHECKED_COLOR_CHANGED })
    }
  }

  constructor(parameters: CheckboxParameters, pointer: PointerInteraction, options: CheckboxOptions = {}) {
    if (parameters.width == undefined) parameters.width = 0.1
    if (parameters.height == undefined) parameters.height = 0.1

    super(parameters, pointer, options)

    this.name = parameters.id != undefined ? parameters.id : 'checkbox'

    this.checked = parameters.checked != undefined ? parameters.checked : false

    if (!parameters.checkmaterial) parameters.checkmaterial = { color: '#000' }
    this._checkcolor = parameters.checkmaterial.color!
    this.checkmaterial = this.materials.getMaterial('geometry', 'checkbox', parameters.checkmaterial)

    const checksize = 0.8
    const checkmesh = new Mesh()
    checkmesh.material = this.checkmaterial
    this.add(checkmesh)
    checkmesh.position.z = 0.001
    checkmesh.visible = this.checked

    const indeterminatemesh = new Mesh()
    indeterminatemesh.material = this.checkmaterial
    this.add(indeterminatemesh)
    indeterminatemesh.position.z = 0.001
    indeterminatemesh.visible = this.indeterminate

    const updateGeometry = () => {
      checkmesh.geometry = new RoundedRectangleGeometry(this.width * checksize, this.height * checksize, this.radius * checksize)
      indeterminatemesh.geometry = new RoundedRectangleGeometry(this.width * checksize, this.height * 0.2, this.radius * checksize)
    }
    updateGeometry()

    this.addEventListener(PanelEventType.WIDTH_CHANGED, updateGeometry)
    this.addEventListener(PanelEventType.RADIUS_CHANGED, updateGeometry)


    this.addEventListener(PointerEventType.CLICK, () => {
      if (this.disabled) return
      this.checked = !this.checked
      // a user clicking will remove the indeterminate state
      this.indeterminate = false
      //e.stop = true  // prevent bubbling event
    })

    this.addEventListener(CheckboxEventType.CHECKED_CHANGED, () => {
      // While the indeterminate is true, it will remain indeterminate regardless of the checked value
      if (this.indeterminate) return

      checkmesh.visible = this.checked
    })

    this.addEventListener(CheckboxEventType.INDETERMINATE_CHANGED, () => {
      indeterminatemesh.visible = this.indeterminate
      if (!this.indeterminate)
        checkmesh.visible = this.checked
    })
  }

  override handleKeyDown(e: UIKeyboardEvent) {
    if (this.disabled) return

    if (e.code == 'Enter' || e.code == 'Space')
      this.checked = !this.checked
  }
}
