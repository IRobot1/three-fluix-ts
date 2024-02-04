import { ButtonMenuParameters, MenuButtonParameters, PanelParameters, PointerInteraction, TextButtonParameters, UIButton, UIButtonMenu, UIOptions, UIPanel } from "three-fluix";
import { ButtonParameters, InteractiveEventType, UITextButton } from "three-fluix";
import { MeshBasicMaterial, SRGBColorSpace, Vector3, VideoTexture } from "three";
import { LerpUtils } from "./concept1";

export interface MediaPlayerParameters extends PanelParameters {
  padding?: number
  controls?: PanelParameters
}

export class UIMediaPlayer extends UIPanel {
  protected video: HTMLVideoElement
  protected controls: UIPanel
  protected padding: number
  private controlsposition: Vector3
  private playButton: UITextButton

  constructor(parameters: MediaPlayerParameters, protected pointer: PointerInteraction, options: UIOptions) {
    const padding = parameters.padding != undefined ? parameters.padding : 0.01
    const width = parameters.width != undefined ? parameters.width : 1

    const controlswidth = width - padding * 2
    if (!parameters.controls) parameters.controls = {
      fill: { color: 'gray' },
      height: 0.2, width: controlswidth,
      selectable: false,
    }
    if (!parameters.id) parameters.id = 'mediaplayer'

    super(parameters, options)

    this.padding = padding

    const controls = new UIPanel(parameters.controls, options)
    controls.position.y = -(this.height - controls.height - padding) / 2
    this.add(controls)
    controls.position.z = -0.01
    this.controls = controls
    this.controlsposition = controls.position.clone()

    const video = this.createVideoElement()
    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    texture.repeat.set(1 / this.width, 1 / this.height)

    const material = this.material as MeshBasicMaterial
    material.map = texture
    texture.needsUpdate = true

    video.addEventListener('canplaythrough', () => {
      texture.needsUpdate = true

      console.log('Video is fully loaded and can play through.');
      video.play();
    })
    this.video = video

    pointer.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      const target = this.controlsposition
      LerpUtils.vector3(this.controls.position, target)
    })

    const items: Array<MenuButtonParameters> = [
      {
        button: <TextButtonParameters>{
          label: { text: 'skip_previous', isicon: true },
        }
      },
      {
        button: <TextButtonParameters>{
          label: { text: 'play_arrow', isicon: true }, width: 0.15, height: 0.15, radius: 0.07
        }
      },
      {
        button: <TextButtonParameters>{
          label: { text: 'skip_next', isicon: true },
        }
      },
    ]
    const controlButtons = new UIButtonMenu({ items }, pointer, options)
    controls.add(controlButtons)
    controlButtons.position.x = -controlswidth / 2 + this.padding * 2
    controlButtons.position.z = 0.001

    const skipPrevious = controlButtons.buttons[0] as UITextButton
    this.playButton = controlButtons.buttons[1] as UITextButton
    const skipNext = controlButtons.buttons[2] as UITextButton

    this.playButton.pressed = () => { this.togglePlay() }

    skipPrevious.pressed = () => { }
  }

  override highlight() {
    const target = this.controls.position.clone()
    target.y = -(this.height + this.controls.height) / 2 - this.padding
    LerpUtils.vector3(this.controls.position, target)
  }

  private togglePlayButton() {
    this.playButton.label.text = this.playButton.label.text == 'play_arrow' ? 'pause' : 'play_arrow'
  }

  private createVideoElement(): HTMLVideoElement {
    const video: HTMLVideoElement = document.createElement('video');
    video.id = 'video';
    video.loop = true;
    video.muted = true;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.style.display = 'none';

    document.body.appendChild(video);
    return video
  }

  dispose() {
    document.body.removeChild(this.video)
  }

  togglePlay() {
    this.togglePlayButton()
    if (this.playButton.label.text == 'play_arrow')
      this.video.play()
    else
      this.video.pause()
  }

  load(src: string) {
    this.video.src = src
  }


  seek(currentTime: number) {
    this.video.currentTime = currentTime
  }

  // overridables

  createButton(parameters: ButtonParameters): UIButton {
    return new UIButton(parameters, this.pointer, this.options)
  }


}
