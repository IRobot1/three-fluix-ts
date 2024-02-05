import { CircleGeometry, MeshBasicMaterial, SRGBColorSpace, Vector3, VideoTexture } from "three";

import { UILabel, PanelParameters, PointerInteraction, TextButtonParameters, UIButton, UIOptions, UIPanel, ButtonParameters, InteractiveEventType, UITextButton, UISliderbar, UIOrientationType } from "three-fluix";

import { LerpUtils } from "./concept1";
import { UIProgressbar , SliderbarEventType, SliderbarParameters } from "three-fluix";

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
  private slider: UISliderbar

  constructor(parameters: MediaPlayerParameters, protected pointer: PointerInteraction, options: UIOptions) {
    const padding = parameters.padding != undefined ? parameters.padding : 0.01
    const width = parameters.width != undefined ? parameters.width : 1

    const controlswidth = width - padding * 2
    const controlsheight = 0.2
    if (!parameters.controls) parameters.controls = {
      fill: { color: 'gray' },
      height: controlsheight, width: controlswidth,
      selectable: false,
    }
    if (!parameters.id) parameters.id = 'mediaplayer'

    super(parameters, options)

    this.padding = padding

    const controls = new UIPanel(parameters.controls, options)
    controls.position.y = -(this.height - controls.height - padding) / 2
    this.add(controls)
    controls.position.z = -0.003
    this.controls = controls
    this.controlsposition = controls.position.clone()

    const video = this.createVideoElement()
    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    texture.repeat.set(1 / this.width, 1 / this.height)

    const material = this.material as MeshBasicMaterial
    material.map = texture

    const canplaythrough = () => {
      texture.needsUpdate = true

      this.setButtonToPause()
      video.play();
    }

    video.addEventListener('canplaythrough', canplaythrough)

    const videoended = () => {
      this.setButtonToPlay()
      video.pause()
    }
    video.addEventListener('ended', videoended)

    this.video = video

    pointer.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      const target = this.controlsposition
      LerpUtils.vector3(this.controls.position, target)
      slider.visible = false
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

    let duration: string
    const durationchange = () => {
      duration = this.formatTime(video.duration)
      slider.max = video.duration
    }

    video.addEventListener('durationchange', durationchange)

    const updateCurrentTime = () => {
      currentTime.text = `${this.formatTime(video.currentTime)} / ${duration}`
    }

    const timeupdate = () => {
      slider.value = video.currentTime
      updateCurrentTime()
    }
    video.addEventListener('timeupdate', timeupdate)

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
    }
    this.playButton = playButton

    const sliderparams: SliderbarParameters = {
      width: controlswidth, height: 0.02, radius: 0,
      fill: { color: 'darkgray' },
      slidersize: 0.03,
      sliderradius: 0.05,
      slidermaterial: { color: 'red' },
      selectable: false
    }

    const slider = new UIProgressbar(sliderparams, pointer, options)
    controls.add(slider)
    slider.position.set(0, controlsheight / 2, 0.003)
    slider.visible = false
    this.slider = slider

    slider.createSlider = this.createSlider

    slider.addEventListener(SliderbarEventType.VALUE_CHANGED, () => {
      if (video.currentTime = slider.value) return

      video.currentTime = slider.value
      updateCurrentTime()
    })

    this._dispose = () => {
      video.removeEventListener('canplaythrough', canplaythrough)
      video.removeEventListener('ended', videoended)
      video.removeEventListener('durationchange', durationchange)
      video.removeEventListener('timeupdate', timeupdate)
    }
  }

  private _dispose() { }

  override highlight() {
    const target = this.controls.position.clone()
    target.y = -(this.height + this.controls.height) / 2 - this.padding
    LerpUtils.vector3(this.controls.position, target, 0.1, () => {
      this.slider.visible = true
    })
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
    this._dispose()
    this.video.pause()
    document.body.removeChild(this.video)
  }

  togglePlay() {
    if (this.playButton.label.text == 'play_arrow')
      this.video.play()
    else if (this.video.duration > 0)
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

  createSlider(orientation: UIOrientationType, width: number, height: number, radius: number) {
    if (orientation == 'horizontal')
      return new CircleGeometry(width)
    return new CircleGeometry(height)
  }
}
