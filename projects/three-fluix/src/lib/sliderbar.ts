import { BufferGeometry, ColorRepresentation, MathUtils, Mesh, MeshBasicMaterial, Vector3 } from "three";

import { InteractiveEventType, InteractiveLayers, PointerInteraction } from "./pointer-interaction";
import { PanelOptions } from "./panel";
import { UIOrientationType, SliderbarParameters } from "./model";
import { UIEntry } from "./input-field";
import { UIKeyboardEvent } from "./keyboard";
import { RoundedRectangleGeometry } from "./shapes/rounded-rectangle-geometry";

export enum SliderbarEventType {
  VALUE_CHANGED = 'value_changed',
  SLIDER_MOVED = 'slider_moved',
}
export interface SliderbarOptions extends PanelOptions { }

export class UISliderbar extends UIEntry {
  inputtype: string = 'sliderbar'

  // clamp value between min and max if defined
  private clampValue(newvalue: number): number {
    if (this.min != undefined && this.max != undefined) {
      if (this.min > this.max) {
        console.warn(`min ${this.min} is greater than max ${this.max}`);
        let temp = this.min;
        this.min = this.max;
        this.max = temp;
      }
      newvalue = MathUtils.clamp(newvalue, this.min, this.max);
    }
    return newvalue
  }

  private _value = -Infinity;
  get value(): number { return this._value }
  set value(newvalue: number) {
    if (newvalue == undefined) return

    newvalue = this.clampValue(newvalue)
    if (this._value != newvalue) {
      this._value = newvalue
      this.dispatchEvent<any>({ type: SliderbarEventType.VALUE_CHANGED, value: newvalue })
    }
  }

  private _min: number | undefined
  get min(): number | undefined { return this._min }
  set min(newvalue: number | undefined) {
    if (this._min != newvalue) {
      this._min = newvalue;
      if (newvalue != undefined)
        this.value = this.clampValue(this.value)
    }
  }

  private _max: number | undefined
  get max(): number | undefined { return this._max }
  set max(newvalue: number | undefined) {
    if (this._max != newvalue) {
      this._max = newvalue;
      if (newvalue != undefined)
        this.value = this.clampValue(this.value)
    }
  }

  private _step: number | undefined
  get step(): number | undefined { return this._step }
  set step(newvalue: number | undefined) {
    if (this._step != newvalue) {
      this._step = newvalue
      //  if (newvalue == undefined) {
      //    if (this.min != undefined && this.max != undefined) {
      //      this._step = (this.max - this.min) / 1000;
      //    }
      //  }
    }
  }


  private _slidersize = 0
  get slidersize() { return this._slidersize }
  set slidersize(newvalue: number) {
    if (newvalue == undefined) return

    if (this._slidersize != newvalue) {
      this._slidersize = newvalue
      if (this.orientation == 'horizontal')
        this.slidermesh.geometry = this.createSlider(this.orientation, newvalue, this.height * 0.9, this.sliderradius)
      else
        this.slidermesh.geometry = this.createSlider(this.orientation, this.width * 0.9, newvalue, this.sliderradius)
      this.updateSliderPosition(this.value)
    }
  }

  get sliderColor() {
    // @ts-ignore
    return this.slidermesh.material.color
  }

  set sliderColor(color: ColorRepresentation) {
    // @ts-ignore
    this.slidermesh.material.color.set(color)
  }

  readonly orientation: UIOrientationType
  protected slidermesh: Mesh
  private sliderradius: number


  constructor(parameters: SliderbarParameters, pointer: PointerInteraction, options: SliderbarOptions = {}) {
    const orientation = parameters.orientation != undefined ? parameters.orientation : 'horizontal'
    if (orientation == 'horizontal' && parameters.height == undefined) parameters.height = 0.1
    if (orientation == 'vertical' && parameters.width == undefined) parameters.width = 0.1

    super(parameters, pointer, options)

    this.name = parameters.id != undefined ? parameters.id : 'sliderbar'


    if (!parameters.slidermaterial) parameters.slidermaterial = { color: 'black' }
    const slidermaterial = this.materials.getMaterial('geometry', 'sliderbar', parameters.slidermaterial)

    this.sliderradius = parameters.sliderradius != undefined ? parameters.sliderradius : 0.02
    this.orientation = orientation

    const slidermesh = new Mesh()
    slidermesh.name = 'slider'
    slidermesh.material = slidermaterial
    this.add(slidermesh)
    slidermesh.position.z = 0.003

    // store the mesh and set its initial geometry by setting slider size
    this.slidermesh = slidermesh
    requestAnimationFrame(() => {
      this.slidersize = parameters.slidersize != undefined ? parameters.slidersize : 0.1
    })

    slidermesh.layers.enable(InteractiveLayers.SELECTABLE)
    slidermesh.layers.enable(InteractiveLayers.DRAGGABLE)

    this._min = parameters.min != undefined ? parameters.min : 0
    this._max = parameters.max != undefined ? parameters.max : 100
    this._step = parameters.step != undefined ? parameters.step : 1

    slidermesh.addEventListener(InteractiveEventType.POINTERENTER, (e: any) => {
      if (this.disabled || !this.visible) return
      e.stop = true
      document.body.style.cursor = 'grab'
    })

    slidermesh.addEventListener(InteractiveEventType.POINTERLEAVE, () => {
      if (this.disabled) return
      if (document.body.style.cursor == 'grab')
        document.body.style.cursor = 'default'
    })


    const moveto = (v: Vector3) => {
      if (this.min != undefined && this.max != undefined) {
        let value: number
        if (this.orientation == 'horizontal') {
          const halfwidth = (this.width - this.slidersize) / 2;
          value = MathUtils.mapLinear(v.x, -halfwidth, halfwidth, this.min, this.max);
        }
        else {
          const halfheight = (this.height - this.slidersize) / 2;
          value = MathUtils.mapLinear(-v.y, -halfheight, halfheight, this.min, this.max);
        }

        if (this.step) {
          // avoid problems when step is fractional
          value = Math.round(value / this.step) * this.step
        }

        this.value = value
        this.dispatchEvent<any>({ type: SliderbarEventType.SLIDER_MOVED, value })
      }
    }

    let dragging = false

    let offset: Vector3
    slidermesh.addEventListener(InteractiveEventType.DRAGSTART, (e: any) => {
      if (this.disabled || !this.visible) return
      // remember where in the mesh the mouse was clicked to avoid jump on first drag
      offset = e.position.sub(slidermesh.position).clone()
      document.body.style.cursor = 'grabbing'

      dragging = true
    });
    slidermesh.addEventListener(InteractiveEventType.DRAGEND, () => {
      if (this.disabled) return
      document.body.style.cursor = 'default'
      dragging = false
    });


    slidermesh.addEventListener(InteractiveEventType.DRAG, (e: any) => {
      if (!dragging || this.disabled || !this.visible) return

      moveto(e.position.sub(offset))
    });



    this.addEventListener<any>(SliderbarEventType.VALUE_CHANGED, (e) => {
      if (this.disabled) return
      this.updateSliderPosition(e.value)
    })

    // force initial position
    this.value = parameters.initialvalue ? parameters.initialvalue : 0
  }

  private updateSliderPosition(value: number) {
    if (this.min != undefined && this.max != undefined) {
      if (this.orientation == 'horizontal') {
        const halfwidth = (this.width - this.slidersize) / 2;
        const x = MathUtils.mapLinear(value, this.min, this.max, -halfwidth, halfwidth);
        this.slidermesh.position.x = x
      }
      else {
        const halfheight = (this.height - this.slidersize) / 2;
        const y = MathUtils.mapLinear(value, this.min, this.max, -halfheight / 2, halfheight / 2);
        this.slidermesh.position.y = -y
      }
    }
  }

  override handleKeyDown(e: UIKeyboardEvent) {
    if (!this.active || this.disabled) return

    switch (e.key) {
      case 'Home':
        if (this.min != undefined) this.value = this.min
        break;
      case 'End':
        if (this.max != undefined) this.value = this.max
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        if (this.step != undefined) this.value -= this.step
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        if (this.step != undefined) this.value += this.step
        break;
      case 'PageUp':
        if (this.step != undefined) this.value += this.step * 10
        break;
      case 'PageDown':
        if (this.step != undefined) this.value -= this.step * 10
        break;
    }
  }

  // overridables
  createSlider(orientation: UIOrientationType, width: number, height: number, radius: number): BufferGeometry {
    return new RoundedRectangleGeometry(width, height, radius)
  }
}
