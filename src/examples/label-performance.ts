import { Scene } from "three";
import { ThreeJSApp } from "../app/threejs-app";
import { UILabel, FontCache, LabelParameters, UIMaterials, UIOptions, TextButtonParameters, UITextButton, SelectParameters, UISelect, KeyboardInteraction, TextEntryParameters, UITextEntry } from "three-fluix";



export class LabelPerformanceScene extends Scene {
  labels: Array<UILabel> = []


  constructor(private app: ThreeJSApp) {
    super()

    //this.scale.setScalar(0.2)

    const options: UIOptions = {
      fontCache: new FontCache(),
      materials: new UIMaterials(),
      keyboard : new KeyboardInteraction(app)
    }

    const bordersize = 0.03
    const screenwidth = 16 / 9 - bordersize * 2
    const screenheight = 1 - bordersize * 2


    const params: LabelParameters = {}
    for (let i = 0; i < 500; i++) {
      params.text = i.toString()

      const label = new UILabel(params, options)
      this.add(label)
      label.position.set(-screenwidth / 2 + Math.random() * screenwidth, -screenheight / 2 + Math.random() * screenheight, 0.001)

      this.labels.push(label)
    }

    //const buttonparams: TextEntryParameters = {
    //  width: 0.3, 
    //  label: { text: 'Three Fluix Three Fluix' }
    //}

    //const button = new UITextEntry(buttonparams, app.interactive, options)
    //this.add(button)

    //options.keyboard?.add(button)
  }

  dispose = () => {
    this.labels.forEach(label => label.dispose())
  }
}


