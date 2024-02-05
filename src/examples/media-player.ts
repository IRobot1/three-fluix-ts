import { ButtonMenuParameters, MenuButtonParameters, PanelParameters, PointerInteraction, TextButtonParameters, UIButton, UIButtonMenu, UIOptions, UIPanel } from "three-fluix";
import { ButtonParameters, InteractiveEventType, UITextButton } from "three-fluix";
import { MeshBasicMaterial, SRGBColorSpace, Vector3, VideoTexture } from "three";
import { LerpUtils } from "./concept1";
import { UILabel } from "three-fluix";

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
  private currentTime: UILabel

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

      this.setButtonToPause()
      video.play();
    })

    video.addEventListener('ended', () => {
      this.setButtonToPlay()
      video.pause()
    })

    this.video = video

    pointer.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      const target = this.controlsposition
      LerpUtils.vector3(this.controls.position, target)
    })

    const playparams: TextButtonParameters = {
      label: { text: 'play_arrow', isicon: true, size: 0.1 }, width: 0.15, height: 0.15, radius: 0.07,
    }
    const playButton = new UITextButton(playparams, pointer, options)
    controls.add(playButton)
    playButton.position.set(-(controlswidth - playButton.width) / 2 + this.padding * 2, 0, 0.001)

    playButton.pressed = () => { this.togglePlay() }
    this.playButton = playButton

    this.addEventListener(InteractiveEventType.CLICK, () => { this.togglePlay() })

    const currentTime = new UILabel({ text: '0:00 / 00:00', alignX: 'left' }, options)
    controls.add(currentTime)
    currentTime.position.set(playButton.position.x + this.padding + 0.1, 0, 0.001)
    this.currentTime = currentTime

    let duration: string
    video.addEventListener('durationchange', (e: any) => {
      duration = this.formatTime(video.duration)
    })

    video.addEventListener('timeupdate', (e: any) => {
      currentTime.text = `${this.formatTime(video.currentTime)} / ${duration}`
    })

    const volumeButtonParams: TextButtonParameters = {
      label: { text: this.getVolumeIcon(), isicon: true }, radius: 0.04
    }

    const volumeButton = new UITextButton(volumeButtonParams, pointer, options)
    controls.add(volumeButton)
    volumeButton.position.set((controlswidth - volumeButton.width) / 2 - this.padding * 2, 0, 0.001)

    let lastvolume = video.volume
    volumeButton.pressed = () => {
      if (video.volume > 0) {
        video.volume = 0
      }
      else {
        video.volume = lastvolume
      }
      volumeButton.label.text = this.getVolumeIcon()
      console.warn(video.volume, volumeButton.label.text)
    }
    this.playButton = playButton

  }

  override highlight() {
    const target = this.controls.position.clone()
    target.y = -(this.height + this.controls.height) / 2 - this.padding
    LerpUtils.vector3(this.controls.position, target)
  }

  getVolumeIcon(): string {
    const volume = this.video.volume
    if (volume > 0.5)
      return 'volume_up'
    else if (volume > 0)
      return 'volume_down'
    return 'volume_off'
  }

  private setButtonToPlay() {
    this.playButton.label.text = 'play_arrow' 
  }
  private setButtonToPause() {
    this.playButton.label.text = 'pause'
  }

  private togglePlayButton() {
    this.playButton.label.text = this.playButton.label.text == 'play_arrow' ? 'pause' : 'play_arrow'
  }

  private formatTime(currentTime: number): string {
    const hours = Math.floor(currentTime / 3600);
    const minutes = Math.floor((currentTime % 3600) / 60);
    const secondsLeft = Math.floor(currentTime % 60);

    // Pad each value with leading zeros to ensure they are at least two digits long, except hours which can be variable length
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(secondsLeft).padStart(2, '0');

    // If there are hours, include them, otherwise just show minutes and seconds
    return `${hours > 0 ? paddedHours + ':' : ''}${paddedMinutes}:${paddedSeconds}`;
  }

  private createVideoElement(): HTMLVideoElement {
    const video: HTMLVideoElement = document.createElement('video');
    video.id = 'video';
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
    if (this.playButton.label.text == 'play_arrow') 
      this.video.play()
    else if (this.video.duration>0)
      this.video.pause()

    this.togglePlayButton()
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
