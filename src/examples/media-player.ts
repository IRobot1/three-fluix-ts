import { CircleGeometry, MeshBasicMaterial, SRGBColorSpace, Vector3, VideoTexture } from "three";

import { UILabel, PanelParameters, PointerInteraction, TextButtonParameters, UIOptions, UIPanel, InteractiveEventType, UITextButton, UISliderbar, UIOrientationType, LabelParameters, UIProgressbar, SliderbarEventType, SliderbarParameters } from "three-fluix";

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
  private progressSlider: UISliderbar

  constructor(parameters: MediaPlayerParameters, protected pointer: PointerInteraction, options: UIOptions) {
    const padding = parameters.padding != undefined ? parameters.padding : 0.01
    const width = parameters.width != undefined ? parameters.width : 1

    if (!parameters.id) parameters.id = 'mediaplayer'

    super(parameters, options)

    this.padding = padding

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


    pointer.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      const target = this.controlsposition
      LerpUtils.vector3(this.controls.position, target)
      progressSlider.visible = false
    })

    let duration: string
    const durationchange = () => {
      duration = this.formatTime(video.duration)
      progressSlider.max = video.duration
    }

    video.addEventListener('durationchange', durationchange)

    const updateCurrentTime = () => {
      currentTime.text = `${this.formatTime(video.currentTime)} / ${duration}`
    }

    const timeupdate = () => {
      progressSlider.value = video.currentTime
      updateCurrentTime()
    }
    video.addEventListener('timeupdate', timeupdate)

    this.video = video

    this._dispose = () => {
      video.removeEventListener('canplaythrough', canplaythrough)
      video.removeEventListener('ended', videoended)
      video.removeEventListener('durationchange', durationchange)
      video.removeEventListener('timeupdate', timeupdate)
    }

    // control panel

    const controlswidth = width - padding * 2
    const controlsheight = 0.2

    if (!parameters.controls) parameters.controls = {}
    if (!parameters.controls.fill) parameters.controls.fill = { color: 'gray' }
    if (parameters.controls.height == undefined) parameters.controls.height = controlsheight
    if (parameters.controls.width == undefined) parameters.controls.width = controlswidth
    parameters.controls.selectable = false

    const controls = this.createPanel(parameters.controls)
    controls.position.y = -(this.height - controls.height - padding) / 2
    this.add(controls)
    controls.position.z = -0.005
    this.controls = controls
    this.controlsposition = controls.position.clone()

    // play/pause button
    const playparams: TextButtonParameters = {
      label: { text: 'play_arrow', isicon: true, size: 0.1 }, width: 0.15, height: 0.15, radius: 0.07,
    }
    const playButton = this.createTextButton(playparams)
    controls.add(playButton)
    playButton.position.set(-(controlswidth - playButton.width) / 2 + this.padding * 2, 0, 0.001)

    playButton.pressed = () => { this.togglePlay() }
    this.playButton = playButton

    this.addEventListener(InteractiveEventType.CLICK, () => { this.togglePlay() })

    // time display
    const currentTime = this.createLabel({ text: '0:00 / 00:00', alignX: 'left' })
    controls.add(currentTime)
    currentTime.position.set(playButton.position.x + this.padding + 0.1, 0, 0.001)

    // volume button
    const volumeButtonParams: TextButtonParameters = {
      label: { text: this.getVolumeIcon(), isicon: true }, radius: 0.04
    }

    const volumeButton = this.createTextButton(volumeButtonParams)
    controls.add(volumeButton)
    volumeButton.position.set((controlswidth - volumeButton.width) / 2 - this.padding * 2, 0, 0.001)

    let lastvolume = video.volume
    volumeButton.pressed = () => {
      if (video.volume > 0) {
        lastvolume = video.volume
        video.volume = 0
      }
      else {
        video.volume = lastvolume
      }
      volumeSlider.value = video.volume
      volumeButton.label.text = this.getVolumeIcon()
    }
    this.playButton = playButton

    // video time position slider
    const sliderparams: SliderbarParameters = {
      width: controlswidth, height: 0.02, radius: 0,
      fill: { color: 'darkgray' },
      slidersize: 0.03,
      sliderradius: 0.05,
      slidermaterial: { color: 'red' },
      selectable: false
    }

    const progressSlider = this.createProgressbar(sliderparams)
    controls.add(progressSlider)
    progressSlider.position.set(0, controlsheight / 2, 0.003)
    progressSlider.visible = false
    this.progressSlider = progressSlider

    progressSlider.createSlider = this.createSlider

    progressSlider.addEventListener(SliderbarEventType.SLIDER_MOVED, () => {
      video.currentTime = progressSlider.value
      updateCurrentTime()
    })

    // volume slider
    const volumeSliderWidth = 0.2
    sliderparams.width = volumeSliderWidth
    sliderparams.max = 1
    sliderparams.step = 0
    sliderparams.initialvalue = video.volume
    const volumeSlider = this.createProgressbar(sliderparams)
    controls.add(volumeSlider)
    volumeSlider.position.set((controlswidth - volumeSliderWidth) / 2 - volumeButton.width - this.padding * 5, 0, 0.001)

    volumeSlider.createSlider = this.createSlider

    volumeSlider.addEventListener(SliderbarEventType.SLIDER_MOVED, () => {
      video.volume = volumeSlider.value
      volumeButton.label.text = this.getVolumeIcon()
    })

  }

  private _dispose() { }

  private getVolumeIcon(): string {
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

  private togglePlay() {
    if (this.playButton.label.text == 'play_arrow')
      this.video.play()
    else if (this.video.duration > 0)
      this.video.pause()

    this.togglePlayButton()
  }


  // public

  override highlight() {
    const target = this.controls.position.clone()
    target.y = -(this.height + this.controls.height) / 2 - this.padding
    LerpUtils.vector3(this.controls.position, target, 0.1, () => {
      this.progressSlider.visible = true
    })
  }

  dispose() {
    this._dispose()
    this.video.pause()
    document.body.removeChild(this.video)
  }

  load(src: string) {
    this.video.src = src
  }


  // overridables

  createPanel(parameters: PanelParameters): UIPanel {
    return new UIPanel(parameters, this.options)
  }

  createLabel(parameters: LabelParameters): UILabel {
    return new UILabel(parameters, this.options)
  }

  createTextButton(parameters: TextButtonParameters): UITextButton {
    return new UITextButton(parameters, this.pointer, this.options)
  }

  createProgressbar(parameters: SliderbarParameters): UIProgressbar {
    return new UIProgressbar(parameters, this.pointer, this.options)
  }

  createSlider(orientation: UIOrientationType, width: number, height: number, radius: number) {
    if (orientation == 'horizontal')
      return new CircleGeometry(width)
    return new CircleGeometry(height)
  }
}
