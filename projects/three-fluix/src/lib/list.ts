import { MathUtils, Mesh, PlaneGeometry, Vector3 } from "three";
import { UIEntry } from "./input-field";
import { LabelParameters, UIOrientationType, ListParameters } from "./model";
import { PointerEventType, PointerInteractionLayers, PointerInteraction } from "./pointer-interaction";
import { PanelOptions } from "./panel";
import { ButtonEventType, UIButton } from "./button";
import { UITextButton } from "./button-text";
import { UILabel } from "./label";
import { UIKeyboardEvent } from "./keyboard";
import { Pagination } from "./pagination";
import { UIScrollbar } from "./scrollbar";

export interface ListOptions extends PanelOptions {
}

export enum ListEventType {
  LIST_SELECTED_CHANGED = 'list_selected_changed'
}

export class UIList extends UIEntry implements Pagination {
  inputtype: string = 'list'

  private _field: string | undefined
  get field() { return this._field }
  set field(newvalue: string | undefined) {
    if (this._field != newvalue) {
      this._field = newvalue
      if (newvalue)
        this.refresh()
    }
  }

  private _data: Array<any>
  get data() { return this._data }
  set data(newvalue: Array<any>) {
    if (this._data != newvalue) {
      this._data = newvalue
      this.refresh()
    }
  }

  private selectedindex = -1  // index in list of selected item
  private _selectedtext = ''; // text of selected index
  get selectedtext(): string { return this._selectedtext }
  set selectedtext(newvalue: string) {
    if (this._selectedtext != newvalue) {
      this._selectedtext = newvalue

      const index = this.data.findIndex(item => {
        let value = item
        if (this.field) value = item[this.field]
        return value == newvalue
      });
      this.selectedindex = index
    }
  }

  private _spacing
  get spacing(): number { return this._spacing }
  set spacing(newvalue: number) {
    if (this._spacing != newvalue) {
      this._spacing = newvalue
      // TODO: change layout
    }
  }

  private _orientation: UIOrientationType
  get orientation(): UIOrientationType { return this._orientation }
  set orientation(newvalue: UIOrientationType) {
    if (this._orientation != newvalue) {
      this._orientation = newvalue
      // TODO: change layout
    }
  }

  private empty: UILabel
  private selectedMesh: Mesh
  private visuals: Array<UIButton> = []
  private itemcount: number
  private scrollbar?: UIScrollbar

  constructor(parameters: ListParameters, pointer: PointerInteraction, options: ListOptions = {}) {
    const itemCount = parameters.itemcount != undefined ? parameters.itemcount : 6
    const itemHeight = parameters.itemheight != undefined ? parameters.itemheight : 0.1
    const spacing = parameters.spacing != undefined ? parameters.spacing : 0.02
    const totalHeight = itemCount * (itemHeight + spacing) + spacing

    const panelwidth = parameters.width != undefined ? parameters.width : 1
    let itemWidth = panelwidth - spacing * 4
    const totalWidth = itemCount * (itemWidth + spacing) + spacing

    const orientation = parameters.orientation != undefined ? parameters.orientation : 'vertical'
    if (orientation == 'vertical')
      parameters.height = totalHeight
    else {
      parameters.width = totalWidth
      parameters.height = itemHeight + spacing * 2
    }
    parameters.highlightable = false
    parameters.selectable = true

    super(parameters, pointer, options)

    this.name = parameters.id != undefined ? parameters.id : 'list'

    this._data = parameters.data != undefined ? parameters.data : []
    if (parameters.field) this._field = parameters.field
    if (parameters.selected) {
      this.selectedtext = parameters.selected
    }
    this._spacing = spacing
    this._orientation = orientation
    this.itemcount = itemCount

    this.empty = this.createEmpty(parameters.emptyText ? parameters.emptyText : 'List is empty')
    this.add(this.empty)
    //this.empty.visible = true

    this.selectedMesh = this.createSelected()
    this.add(this.selectedMesh)
    const matparams = parameters.selectedMaterial ? parameters.selectedMaterial : { color: 'black' }
    this.selectedMesh.material = this.materials.getMaterial('geometry', this.name, matparams)!;

    // layout
    const position = new Vector3(0, 0, 0.001)

    if (this.orientation == 'vertical')
      position.y = totalHeight / 2 - itemHeight / 2 - spacing
    else
      position.x = -totalWidth / 2 + itemWidth / 2 + spacing

    this.empty.position.copy(position)

    let scrollbar: UIScrollbar | undefined

    if (this.data.length > this.itemcount) {

      let slidersize: number
      if (orientation == 'vertical')
        slidersize = MathUtils.mapLinear(this.itemcount, 0, this.data.length, 0, this.height)
      else
        slidersize = MathUtils.mapLinear(this.itemcount, 0, this.data.length, 0, this.width)
      const max = this.data.length - this.itemcount

      scrollbar = new UIScrollbar({ selectable: false, orientation, slidersize, max, height: this.height }, pointer, options)
      this.add(scrollbar)
      if (orientation == 'vertical') {
        scrollbar.position.x = (this.width - scrollbar.width) / 2
        scrollbar.position.z = 0.003
      }
      else
        scrollbar.position.y = this.height / 2 - 0.1
      scrollbar.paginate = this
      this.scrollbar = scrollbar
    }

    const fontSize = parameters.fontSize != undefined ? parameters.fontSize : 0.07

    if (scrollbar) itemWidth -= scrollbar.width / 2
    for (let i = 0; i < itemCount; i++) {

      const button = this.createItem(itemWidth, itemHeight, fontSize, parameters.font)
      button.position.copy(position)

      button.addEventListener(ButtonEventType.BUTTON_PRESSED, () => {
        if (this.disabled || !this.visible) return

        let text = button.data
        if (this.field) text = button.data[this.field]

        this.selectedtext = text

        this.refresh()
        this.selected(button.data)
      })

      button.addEventListener(ButtonEventType.BUTTON_DOWN, (e: any) => { button.buttonDown() })
      button.addEventListener(ButtonEventType.BUTTON_UP, (e: any) => { button.buttonUp() })

      if (this.orientation == 'vertical') {
        if (scrollbar) button.position.x -= scrollbar.width / 2
        position.y -= itemHeight + spacing
      }
      else
        position.x += (itemWidth + spacing)

      this.add(button)
      this.visuals.push(button)
    }
    this.moveTo(this.firstdrawindex)
    if (scrollbar) scrollbar.value = this.selectedindex

    // block pointer from passing through panel
    this.layers.enable(PointerInteractionLayers.SELECTABLE)
    this.disablePointerInteraction()
  }


  override handleKeyDown(e: UIKeyboardEvent) {
    if (!this.data.length) return
    //console.warn(e)
    switch (e.code) {
      case 'Home':
        this.moveFirst()
        break;
      case 'End':
        this.moveLast()
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        this.moveNext()
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        this.movePrevious()
        break;
      case 'PageUp':
        this.movePreviousPage()
        break;
      case 'PageDown':
        this.moveNextPage()
        break;
      case 'Enter':
      case 'Space':
        let index = this.visuals.findIndex(button => button.isHighlighted())
        if (index != -1)
          this.visuals[index].dispatchEvent<any>({ type: ButtonEventType.BUTTON_PRESSED })
        break;
    }
  }

  public firstdrawindex = 0  // index in list of first item to render

  public refresh() {
    const display = (this.data.length == 0)
    this.empty.visible = display

    let drawindex = this.firstdrawindex;

    // if the whole list is shorter than what can be displayed, start from the first item in the list
    if (this.data.length <= this.itemcount) {
      this.firstdrawindex = drawindex = 0;
    }

    this.selectedMesh.visible = false

    this.visuals.forEach((visual, index) => {
      visual.visible = (drawindex < this.data.length)
      if (visual.visible) {
        let dataitem = this.data[drawindex]
        visual.data = dataitem
        this.showItem(visual, dataitem)
      }

      if (this.selectedindex == drawindex) {
        this.selectedMesh.visible = true
        if (this.orientation == 'vertical')
          this.selectedMesh.position.set(-this.width / 2 + 0.02, visual.position.y, 0.005)
        //else
        // TODO: horizontal
      }

      //if (this.highlightindex == index) visual.highlight()

      drawindex++
    })
  }

  override dispose() {
    super.dispose()

    this.visuals.forEach(visual => visual.dispose())
    if (this.scrollbar) this.scrollbar.dispose()
   // this.interactive.selectable.remove(this)
    this.empty.dispose()
  }

  moveFirst() {
    if (this.selectedindex == 0) return
    this.selectedindex = 0
    this.refresh()
  }

  moveLast() {
    const index = Math.max(this.data.length - this.itemcount, 0);
    if (index != this.firstdrawindex) {
      this.firstdrawindex = index;
      this.refresh()
    }
  }

  movePrevious() {
    if (this.firstdrawindex) {
      this.firstdrawindex--
      this.refresh()
    }
  }

  movePreviousPage() {
    if (this.firstdrawindex) {
      if (this.firstdrawindex - this.itemcount < 0)
        this.firstdrawindex = 0;
      else
        this.firstdrawindex -= this.itemcount;
      this.refresh()
    }

  }

  moveNext() {
    if (this.firstdrawindex < this.data.length - this.itemcount) {
      this.firstdrawindex++
      this.refresh()
    }
  }

  moveNextPage() {
    if (this.firstdrawindex + this.itemcount < this.data.length) {
      this.firstdrawindex += this.itemcount;
      this.refresh()
    }
  }

  moveTo(index: number) {
    if (index >= -1 && index < this.data.length) {
      this.firstdrawindex = index
      this.refresh()
    }
  }

  get value() { return this.firstdrawindex }

  // overridables

  public showItem(button: UIButton, data: any) {
    let text = data
    if (this.field) text = data[this.field]
    const textbutton = button as UITextButton
    textbutton.text = text
  }

  public createItem(width: number, height: number, fontSize: number, font?:string): UIButton {
    const label: LabelParameters = {
      alignX: 'left',
      maxwidth: width - this.spacing * 2,
      size: fontSize,
      font
    }

    return new UITextButton({ width, height, label }, this.pointer, this.options);
  }

  public createEmpty(emptyText: string): UILabel {
    const label = new UILabel({ text: emptyText }, this.options)
    label.position.z = 0.001
    return label
  }

  public createSelected(): Mesh {
    const geometry = new PlaneGeometry(0.02, 0.1)
    const mesh = new Mesh(geometry)
    return mesh
  }

  selected(data: any) {
    this.dispatchEvent<any>({ type: ListEventType.LIST_SELECTED_CHANGED, data })
  }
}

