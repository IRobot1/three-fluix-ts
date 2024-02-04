import { Box3, Group, Mesh, MeshBasicMaterial, ShapeGeometry, Vector3 } from "three";
import { ButtonMenuParameters, ButtonOptions, ButtonParameters, PointerInteraction, TextButtonParameters, UIButton, UIButtonMenu, UIOptions, UITextButton } from "three-fluix";
import { SVGLoader, SVGResult, SVGResultPaths } from "three/examples/jsm/loaders/SVGLoader";

export interface SVGButtonParameters extends ButtonParameters {
  svg: string  // inline <svg or URL
}

export class UISVGButton extends UIButton {
  constructor(parameters: SVGButtonParameters, pointer: PointerInteraction, options: ButtonOptions) {
    parameters.buttontype = 'svg'

    if (!parameters.height) parameters.height = 0.1
    if (!parameters.width) parameters.width = 0.1

    super(parameters, pointer, options)

    this.name = parameters.id != undefined ? parameters.id : 'svg-button'

    const loader = new SVGLoader()
    if (parameters.svg.startsWith('<svg')) {
      const result = loader.parse(parameters.svg)
      this.showSVG(result.paths)
    }
    else {
      loader.load(parameters.svg, (result: SVGResult) => {
        this.showSVG(result.paths)
      })
    }
  }

  private showSVG(paths: SVGResultPaths[]) {
    const group = new Group();

    for (let i = 0; i < paths.length; i++) {

      const path = paths[i];

      const material = new MeshBasicMaterial({
        color: path.color,
      });

      const shapes = SVGLoader.createShapes(path);

      for (let j = 0; j < shapes.length; j++) {

        const shape = shapes[j];
        const geometry = new ShapeGeometry(shape);
        geometry.center()
        const mesh = new Mesh(geometry, material);
        group.add(mesh);
      }
    }

    // get the size of the group of meshes
    const box = new Box3().setFromObject(group)
    const size = new Vector3()
    box.getSize(size)
    size.y = -size.y // flip
    size.z = 1

    // scale to fit in the button
    const scale = new Vector3(this.width * 0.9, this.height * 0.9, 1).divide(size)
    group.scale.copy(scale)

    // add and position above the button
    this.add(group)
    group.position.z = 0.001
  }
}

export class ThreeFluixGithub extends UISVGButton {
  constructor(pointer: PointerInteraction, options: ButtonOptions) {
    const parameters: SVGButtonParameters = {
      svg: "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><title>GitHub</title><path d=\"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12\"/></svg>"
    }
    super(parameters, pointer, options)
  }

  override pressed() {
    window.open('https://github.com/IRobot1/three-fluix-ts', '_blank')
  }
}

export class ThreeJSHome extends UISVGButton {
  constructor(pointer: PointerInteraction, options: ButtonOptions) {
    const parameters: SVGButtonParameters = {
      svg: "<svg role=\"img\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><title>Three.js</title><path d=\"M.38 0a.268.268 0 0 0-.256.332l2.894 11.716a.268.268 0 0 0 .01.04l2.89 11.708a.268.268 0 0 0 .447.128L23.802 7.15a.268.268 0 0 0-.112-.45l-5.784-1.667a.268.268 0 0 0-.123-.035L6.38 1.715a.268.268 0 0 0-.144-.04L.456.01A.268.268 0 0 0 .38 0zm.374.654L5.71 2.08 1.99 5.664zM6.61 2.34l4.864 1.4-3.65 3.515zm-.522.12l1.217 4.926-4.877-1.4zm6.28 1.538l4.878 1.404-3.662 3.53zm-.52.13l1.208 4.9-4.853-1.392zm6.3 1.534l4.947 1.424-3.715 3.574zm-.524.12l1.215 4.926-4.876-1.398zm-15.432.696l4.964 1.424-3.726 3.586zM8.047 8.15l4.877 1.4-3.66 3.527zm-.518.137l1.236 5.017-4.963-1.432zm6.274 1.535l4.965 1.425-3.73 3.586zm-.52.127l1.235 5.012-4.958-1.43zm-9.63 2.438l4.873 1.406-3.656 3.523zm5.854 1.687l4.863 1.403-3.648 3.51zm-.54.04l1.214 4.927-4.875-1.4zm-3.896 4.02l5.037 1.442-3.782 3.638z\"/></svg>"
    }
    super(parameters, pointer, options)
  }

  override pressed() {
    window.open('https://threejs.org', '_blank')
  }

}


export class SVGButtonMenu extends UIButtonMenu {
  constructor(parameters: ButtonMenuParameters, pointer: PointerInteraction, options: UIOptions) {
    super(parameters, pointer, options)
  }

  override createButton(parameters: ButtonParameters): UIButton {
    if (parameters.buttontype == 'svg')
      return new UISVGButton(parameters as SVGButtonParameters, this.pointer, this.options)

    return super.createButton(parameters)
  }

}
