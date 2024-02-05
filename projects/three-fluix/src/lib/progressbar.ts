import { Mesh, MeshBasicMaterialParameters } from "three";

import { PointerInteraction } from "./pointer-interaction";
import { SliderbarParameters } from "./model";
import { SliderbarEventType, SliderbarOptions, UISliderbar } from "./sliderbar";

export class UIProgressbar extends UISliderbar {
  override inputtype: string = 'progressbar'


  constructor(parameters: SliderbarParameters, pointer: PointerInteraction, options: SliderbarOptions) {

    super(parameters, pointer, options)

    this.name = parameters.id != undefined ? parameters.id : 'progressbar'

    const progressmesh = new Mesh()
    progressmesh.material = this.slidermesh.material
    progressmesh.geometry = this.createGeometry(this.panelShape())
    progressmesh.geometry.center()
    this.add(progressmesh)
    progressmesh.position.z = 0.001
    progressmesh.scale.x = 0

    this.addEventListener(SliderbarEventType.VALUE_CHANGED, () => {
      const percentage = this.value / this.max!
      progressmesh.position.x = -this.width / 2 + this.width * percentage / 2
      progressmesh.scale.x = percentage
    })
  }
}
