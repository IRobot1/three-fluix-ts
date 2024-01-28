import { Scene } from "three";
import { ThreeJSApp } from "../app/threejs-app";
import { UILabel, FontCache, LabelParameters, UIMaterials, UIOptions, TextButtonParameters, UITextButton, SelectParameters, UISelect } from "three-fluix";



export class LabelPerformanceScene extends Scene {
  labels: Array<UILabel> = []


  constructor(private app: ThreeJSApp) {
    super()

    //this.scale.setScalar(0.2)

    const options: UIOptions = {
      fontCache: new FontCache(),
      materials: new UIMaterials(),
    }

    const bordersize = 0.03
    const screenwidth = 16 / 9 - bordersize * 2
    const screenheight = 1 - bordersize * 2


    //const params: LabelParameters = {}
    //for (let i = 0; i < 500; i++) {
    //  params.text = i.toString()

    //  const label = new UILabel(params, options)
    //  this.add(label)
    //  label.position.set(-screenwidth / 2 + Math.random() * screenwidth, -screenheight / 2 + Math.random() * screenheight, 0.001)
    //}

    const buttonparams: TextButtonParameters = {
      width: 0.3, 
      label: { text: 'atesttesMestb', size:0.07, alignX:'left' }
    }

    const button = new UITextButton(buttonparams, app.interactive, options)
    this.add(button)
    button.position.y += 0.12

    const selectparams: SelectParameters = {
      width: 0.3,
      label: { text: 'atesatestestb', size: 0.05 },
      list: {}
    }

    const select = new UISelect(selectparams, app.interactive, options)
    this.add(select)
  }

  dispose = () => {
    //this.labels.forEach(label => label.dispose())
  }
}


