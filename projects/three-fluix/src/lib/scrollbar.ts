import { PointerInteraction } from "./pointer-interaction";
import { LabelParameters, SliderbarParameters, TextButtonParameters } from "./model";
import { SliderbarEventType, SliderbarOptions, UISliderbar } from "./sliderbar";
import { UITextButton } from "./button-text";
import { Pagination } from "./pagination";

export interface ScrollbarParameters extends SliderbarParameters {
  nextbutton?: TextButtonParameters
  prevbutton?: TextButtonParameters
}

export class UIScrollbar extends UISliderbar {
  paginate?: Pagination

  constructor(parameters: ScrollbarParameters, pointer: PointerInteraction, options: SliderbarOptions = {}) {
    const orientation = parameters.orientation != undefined ? parameters.orientation : 'horizontal'
    let height = parameters.height
    let width = parameters.width
    if (orientation == 'horizontal') {
      if (height == undefined) height = 0.1
      if (width == undefined) width = 1
      parameters.width = width - height * 2
      parameters.height = height
    }
    else if (orientation == 'vertical') {
      if (width == undefined) width = 0.1
      if (height == undefined) height = 1
      parameters.width = width
      parameters.height = height - width * 2
    }
    super(parameters, pointer, options)

    this.name = parameters.id != undefined ? parameters.id : 'scrollabar'

    const size = orientation == 'horizontal' ? this.height : this.width

    // prev button    
    if (!parameters.prevbutton) parameters.prevbutton = { label: {} }
    if (!parameters.prevbutton.label.text) parameters.prevbutton.label.text = orientation == 'horizontal' ? 'chevron_left' : 'expand_less'
    parameters.prevbutton.label.isicon = true
    parameters.prevbutton.width = parameters.prevbutton.height = size

    const prevbutton = new UITextButton(parameters.prevbutton, this.pointer, this.options);
    this.add(prevbutton)
    if (orientation == 'horizontal')
      prevbutton.position.x = -(this.width + size) / 2
    else
      prevbutton.position.y = (this.height + size) / 2
    prevbutton.pressed = () => {
      if (this.paginate) {
        this.paginate.movePrevious()
        this.value = this.paginate.value
      }
    }

    // next button
    if (!parameters.nextbutton) parameters.nextbutton = { label: {} }
    if (!parameters.nextbutton.label.text) parameters.nextbutton.label.text = orientation == 'horizontal' ? 'chevron_right' : 'expand_more'
    parameters.nextbutton.label.isicon = true
    parameters.nextbutton.width = parameters.nextbutton.height = size

    const nextbutton = new UITextButton(parameters.nextbutton, this.pointer, this.options);
    this.add(nextbutton)
    if (orientation == 'horizontal')
      nextbutton.position.x = (this.width + size) / 2
    else
      nextbutton.position.y = -(this.height + size) / 2
    nextbutton.pressed = () => {
      if (this.paginate) {
        this.paginate.moveNext()
        this.value = this.paginate.value
      }
    }

    this.addEventListener(SliderbarEventType.VALUE_CHANGED, () => {
      if (this.paginate) this.paginate.moveTo(this.value)
    })

    this._dispose = () => {
      nextbutton.dispose()
      prevbutton.dispose()
    }
  }

  private _dispose: () => void
  override dispose() {
    super.dispose()
    this._dispose()
  }
}
