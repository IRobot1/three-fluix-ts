import { PointerInteraction } from "./pointer-interaction";
import { UITextButton } from "./button-text";
import { ButtonParameters, LabelParameters, PanelParameters, TextButtonParameters } from "./model";
import { PanelEventType, PanelOptions, UIPanel } from "./panel";
import { UILabel } from "./label";
import { ButtonMenuParameters, UIButtonMenu } from "./button-menu";

export interface TitlebarParameters extends ButtonParameters {
  title: LabelParameters
  panel?: PanelParameters              // customize panel
  leftbuttons?: ButtonMenuParameters   // buttons left of title
  rightbuttons?: ButtonMenuParameters  // buttons right of title
}

export enum TitlebarEventType {
  PANEL_EXPANDED = 'panel_expanded'
}

export class UITitlebar extends UIPanel {

  get text() { return this.label.text }
  set text(newvalue: string) {
    if (this.label.text != newvalue) {
      this.label.text = newvalue
    }
  }


  readonly label: UILabel
  readonly panel: UIPanel
  readonly leftbuttons: UIButtonMenu | undefined
  readonly rightbuttons: UIButtonMenu | undefined

  readonly expanded = false

  constructor(parameters: TitlebarParameters, protected pointer: PointerInteraction, options: PanelOptions) {
    parameters.title.alignX = 'center'
    parameters.draggable = true

    if (parameters.height == undefined) parameters.height = 0.12
    if (parameters.radius == undefined) parameters.radius = 0
    if (!parameters.fill) parameters.fill = {}
    if (!parameters.fill.color) parameters.fill.color = 0x888888

    if (!parameters.panel) parameters.panel = {}
    parameters.panel.width = parameters.width
    
    super(parameters, options)

    this.name = parameters.id != undefined ? parameters.id : 'titlebar'

    const padding = parameters.title.padding != undefined ? parameters.title.padding : 0.02
    if (parameters.title.maxwidth == undefined) parameters.title.maxwidth = this.width - padding * 2

    // left buttons
    if (parameters.leftbuttons) {
      const leftparams = parameters.leftbuttons
      if (!leftparams.hintoptions) leftparams.hintoptions = 'above'

      const leftbuttons = this.createButtonMenu(leftparams)
      this.add(leftbuttons)
      leftbuttons.position.x = -this.width / 2 + 0.01

      this.leftbuttons = leftbuttons
    }

    // right buttons
    if (parameters.rightbuttons) {
      const rightparams = parameters.rightbuttons
      if (!rightparams.hintoptions) rightparams.hintoptions = 'above'

      const rightbuttons = this.createButtonMenu(rightparams)
      this.add(rightbuttons)
      console.warn(rightbuttons.width)
      rightbuttons.position.x = this.width / 2 - rightbuttons.width + 0.01

      this.rightbuttons = rightbuttons
    }



    // label
    const label = this.createLabel(parameters.title)
    this.add(label)

    if (label.alignX == 'left')
      label.position.x = -this.width / 2 + label.padding
    else if (label.alignX == 'right')
      label.position.x = this.width / 2 - label.padding

    label.position.z = 0.001
    this.label = label

    this.addEventListener(PanelEventType.WIDTH_CHANGED, () => {
      label.maxwidth = this.width
    })

    // panel
    let panelparams = parameters.panel
    if (!panelparams) panelparams = {}
    panelparams.selectable = false

    this.panel = this.createPanel(panelparams)
    this.setPanel(this.panel)
  }

  // provide a custom panel
  setPanel(panel: UIPanel) {
    this.remove(this.panel)
    this.add(panel)
    panel.position.x = (panel.width - this.width) / 2
    panel.position.y = -(this.height + panel.height) / 2 //- this.spacing
    // @ts-ignore
    this.panel = panel

    panel.addEventListener(PanelEventType.HEIGHT_CHANGED, () => {
      if (this.leftbuttons) this.leftbuttons.position.x = -this.width / 2 + 0.01
      panel.position.y = -(this.height + panel.height) / 2
    })

  }

  // overridables
  createPanel(parameters: PanelParameters): UIPanel {
    return new UIPanel(parameters, this.options)
  }

  createLabel(parameters: LabelParameters): UILabel {
    return new UILabel(parameters, this.options)
  }

  createButtonMenu(parameters: ButtonMenuParameters): UIButtonMenu {
    return new UIButtonMenu(parameters, this.pointer, this.options)
  }
}
