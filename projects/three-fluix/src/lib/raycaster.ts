import { Intersection, Layers, Object3D, Raycaster } from "three";

export interface IntersectResult {
  intersects: Array<Intersection>
  checked: Array<Object3D>
}

export class UIRaycaster extends Raycaster {

  result: IntersectResult = { intersects: [], checked: [] }

  constructor() {
    super()
  }

  intersectLayer(layers: Layers, object: Object3D): IntersectResult {
    this.layers = layers

    this.result.intersects.length = 0
    this.result.checked.length = 0

    this.raycast(object);

    this.result.intersects.sort((a, b) => a.distance - b.distance);

    return this.result;

  }


  private raycast(object: Object3D) {
    if (!object.visible) return

    if (object.layers.test(this.layers)) {
      object.raycast(this, this.result.intersects);
      this.result.checked.push(object)
    }

    const children = object.children

    for (let i = 0, l = children.length; i < l; i++) {

      this.raycast(children[i])

    }


  }

}



