import { PointerInteraction, PointerEventType } from "./pointer-interaction";
import { UITextButton } from "./button-text";
import { ButtonOptions } from "./button";
import { ListEventType, UIList } from "./list";
import { CircleGeometry, MathUtils, Mesh, MeshBasicMaterialParameters } from "three";
import { SelectParameters } from "./model";

export enum SelectEventType {
  SELECTED_CHANGED = 'selected_changed',
  SELECTED_DATA_CHANGED = 'selected_data_changed',
}
export class UISelect extends UITextButton {

  private _selected: string | undefined
  get selected() { return this._selected }
  set selected(newvalue: string | undefined) {
    if (this._selected != newvalue) {
      this._selected = newvalue
      if (newvalue) {
        this.label.text = newvalue
        this.dispatchEvent<any>({ type: SelectEventType.SELECTED_CHANGED })
      }
    }
  }
  private indicator: Mesh
  private listz: number
  constructor(parameters: SelectParameters, pointer: PointerInteraction, options: ButtonOptions) {
    parameters.disableScaleOnClick = false
    parameters.label.alignX = 'left'
    parameters.list.selectable = false
    super(parameters, pointer, options)

    this.name = parameters.id != undefined ? parameters.id : 'select'

    const radius = this.height * 0.9 / 2
    this.label.maxwidth = this.width - radius * 2 - this.label.padding*2

    const indicatorMaterial = parameters.indicatorMaterial ? parameters.indicatorMaterial : { color: 'black' }
    const mesh = this.createIndicator(radius)
    mesh.material = this.materials.getMaterial('geometry', 'select-indicator', indicatorMaterial)
    mesh.position.set(this.width /2 - radius - this.label.padding / 2, 0, 0.001)
    mesh.rotation.z = this.indicatorRotation(false)
    this.add(mesh)
    this.indicator = mesh

    pointer.addEventListener(PointerEventType.POINTERMISSED, () => {
      this.closelist()
    })

    this._selected = parameters.initialselected ? parameters.initialselected : undefined
    this.listz = parameters.listz != undefined ? parameters.listz : 0.003
  }

  private list?: UIList

  private closelist() {
    if (!this.list) return
    this.remove(this.list)
    this.indicator.rotation.z = this.indicatorRotation(false)
    this.list.dispose()
    this.list = undefined
  }
  override pressed() {
    if (this.disabled) return

    if (this.list) {
      this.closelist()
    }
    else {
      this.indicator.rotation.z = this.indicatorRotation(true)
      const params = this.parameters as SelectParameters
      params.list.selected = this.selected

      const list = new UIList(params.list, this.pointer, this.options)
      this.add(list)
      list.position.set(0, -(this.height + list.height) / 2 - list.spacing, this.listz)

      list.selected = (data: any) => {

        let value = data
        if (params.list.field) value = data[params.list.field]
        this.selected = value

        this.dispatchEvent<any>({ type: SelectEventType.SELECTED_DATA_CHANGED, data })

        this.closelist()
      }

      this.list = list
    }

  }

  // overridables

  createIndicator(radius: number): Mesh {
    const geometry = new CircleGeometry(0.04, 3)
    return new Mesh(geometry)
  }


  indicatorRotation(opened: boolean): number {
    if (opened)
      return MathUtils.degToRad(-90)
    return MathUtils.degToRad(90)
  }

}
