import { Scene } from "three";
import { ThreeJSApp } from "../app/threejs-app";
import { UILabel, FontCache, UIMaterials, UIOptions, SelectParameters, UISelect, ListParameters, SelectEventType, KeyboardInteraction } from "three-fluix";



export class LabelPerformanceScene extends Scene {
  labels: Array<UILabel> = []
  inputwidth: any;


  constructor(private app: ThreeJSApp) {
    super()

    //this.scale.setScalar(0.2)

    const options: UIOptions = {
      fontCache: new FontCache(),
      materials: new UIMaterials(),
      keyboard: new KeyboardInteraction(app)
    }

    const bordersize = 0.03
    const screenwidth = 16 / 9 - bordersize * 2
    const screenheight = 1 - bordersize * 2

    const FONTS: any = {
      'Noto Sans (none)': null,
      'Roboto': 'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff',
      'Alex Brush': 'https://fonts.gstatic.com/s/alexbrush/v8/SZc83FzrJKuqFbwMKk6EhUXz6w.woff',
      'Comfortaa': 'https://fonts.gstatic.com/s/comfortaa/v12/1Ptsg8LJRfWJmhDAuUs4TYFs.woff',
      'Cookie': 'https://fonts.gstatic.com/s/cookie/v8/syky-y18lb0tSbf9kgqU.woff',
      'Cutive Mono': 'https://fonts.gstatic.com/s/cutivemono/v6/m8JWjfRfY7WVjVi2E-K9H6RCTmg.woff',
      'Gabriela': 'https://fonts.gstatic.com/s/gabriela/v6/qkBWXvsO6sreR8E-b8m5xL0.woff',
      'Monoton': 'https://fonts.gstatic.com/s/monoton/v9/5h1aiZUrOngCibe4fkU.woff',
      'Philosopher': 'https://fonts.gstatic.com/s/philosopher/v9/vEFV2_5QCwIS4_Dhez5jcWBuT0s.woff',
      'Quicksand': 'https://fonts.gstatic.com/s/quicksand/v7/6xKtdSZaM9iE8KbpRA_hK1QL.woff',
      'Trirong': 'https://fonts.gstatic.com/s/trirong/v3/7r3GqXNgp8wxdOdOn4so3g.woff',
      'Trocchi': 'https://fonts.gstatic.com/s/trocchi/v6/qWcqB6WkuIDxDZLcPrxeuw.woff',
      'Advent Pro': 'https://fonts.gstatic.com/s/adventpro/v7/V8mAoQfxVT4Dvddr_yOwhTqtLg.woff',
      'Henny Penny': 'https://fonts.gstatic.com/s/hennypenny/v5/wXKvE3UZookzsxz_kjGSfPQtvXQ.woff',
      'Orbitron': 'https://fonts.gstatic.com/s/orbitron/v9/yMJRMIlzdpvBhQQL_Qq7dys.woff',
      'Sacramento': 'https://fonts.gstatic.com/s/sacramento/v5/buEzpo6gcdjy0EiZMBUG4C0f-w.woff',
      'Snowburst One': 'https://fonts.gstatic.com/s/snowburstone/v5/MQpS-WezKdujBsXY3B7I-UT7SZieOA.woff',
      'Syncopate': 'https://fonts.gstatic.com/s/syncopate/v9/pe0sMIuPIYBCpEV5eFdCBfe5.woff',
      'Wallpoet': 'https://fonts.gstatic.com/s/wallpoet/v9/f0X10em2_8RnXVVdUObp58I.woff',
      'Sirin Stencil': 'https://fonts.gstatic.com/s/sirinstencil/v6/mem4YaWwznmLx-lzGfN7MdRyRc9MAQ.woff'
    }

    const fonts: Array<{ label: string, value: number }> = []
    for (let key in FONTS) {
      fonts.push({ label: key, value: FONTS[key] })
    }
    let initialvalue = 'Roboto'

    const maxwidth = 1
    const listparams: ListParameters = {
      width: maxwidth,
      data: fonts,
      field: 'label',
      maxwidth,
    }

    const selectparams: SelectParameters = {
      width: maxwidth,
      label: {
        text: initialvalue,
      },
      list: listparams,
      initialselected: initialvalue,
    }

    const select = new UISelect(selectparams, app.interactive, options)
    this.add(select)
    select.position.y = 0.3

    select.addEventListener(SelectEventType.SELECTED_DATA_CHANGED, (e: any) => {
      //console.warn(e.data.value)
      label.font = e.data.value
    })

    const label = new UILabel({ text: 'Three Fluix' }, options)
    this.add(label)
    label.position.y = 0.4

    //const params: LabelParameters = {}
    //for (let i = 0; i < 500; i++) {
    //  params.text = i.toString()

    //  const label = new UILabel(params, options)
    //  this.add(label)
    //  label.position.set(-screenwidth / 2 + Math.random() * screenwidth, -screenheight / 2 + Math.random() * screenheight, 0.001)

    //  this.labels.push(label)
    //}

    //const numberparams: NumberEntryParameters = {
    //  width: 0.3,
    //  initialvalue: Math.PI
    //  //label: { text: 'The quick brown fox jumped over the lazy dog' }
    //}

    //const numberEntry = new UINumberEntry(numberparams, app.interactive, options)
    //this.add(numberEntry)
    //numberEntry.position.y = 0.2

    //const textparams: TextEntryParameters = {
    //  width: 0.3,
    //  label: { text: 'The quick brown fox jumped over the lazy dog' }
    //}

    //const textEntry = new UITextEntry(textparams, app.interactive, options)
    //this.add(textEntry)

    //options.keyboard?.add(numberEntry, textEntry)
  }

  dispose = () => {
    this.labels.forEach(label => label.dispose())
  }
}


