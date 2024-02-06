import { CircleGeometry, SRGBColorSpace, Vector3, VideoTexture } from "three";

import { InteractiveEventType, LabelParameters, PanelParameters, PointerInteraction, SliderbarEventType, SliderbarParameters, TextButtonParameters, UILabel, UIOptions, UIOrientationType, UIPanel, UIProgressbar, UISliderbar, UITextButton } from "three-fluix";

import { LerpUtils } from "./concept1";

export interface MediaPlayerParameters extends PanelParameters {
  controls?: PanelParameters     // control panel settings
  play?: TextButtonParameters    // play button settings
  playIcon?: string              // default is play_arrow
  pauseIcon?: string             // default is pause
  currentTime?: LabelParameters  // current time label settings
  volume?: TextButtonParameters  // volume button settings
  volumeUpIcon?: string          // volume up icon
  volumeDownIcon?: string        // volume down icon
  volumeOffIcon?: string         // volume off icon
  slider?: SliderbarParameters   // time and volume slider settings
}

export class UIMediaPlayer extends UIPanel {
  readonly controls: UIPanel
  readonly playButton: UITextButton
  readonly currentTime: UILabel
  readonly volumeSlider: UISliderbar
  readonly volumeButton: UITextButton
  readonly progressSlider: UISliderbar

  protected video: HTMLVideoElement

  private padding: number
  private controlsposition: Vector3
  private playIcon: string
  private pauseIcon: string

  constructor(parameters: MediaPlayerParameters, protected pointer: PointerInteraction, options: UIOptions) {
    const width = parameters.width != undefined ? parameters.width : 1

    if (!parameters.id) parameters.id = 'mediaplayer'

    super(parameters, options)

    const padding = 0.01
    this.padding = padding

    const video = this.createVideoElement()
    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    texture.repeat.set(1 / this.width, 1 / this.height)

    // @ts-ignore
    this.material.map = texture

    const canplaythrough = () => {
      texture.needsUpdate = true
      playButton.disabled = false
      this.setButtonToPause(pauseIcon)
      video.play();
    }

    video.addEventListener('canplaythrough', canplaythrough)

    const videoended = () => {
      this.setButtonToPlay(playIcon)
      video.pause()
    }
    video.addEventListener('ended', videoended)


    pointer.addEventListener(InteractiveEventType.POINTERMISSED, () => {
      const target = this.controlsposition
      LerpUtils.vector3(this.controls.position, target)
      progressSlider.visible = false
    })

    let duration = this.formatTime(0)
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

    if (!parameters.controls) parameters.controls = {}
    if (!parameters.controls.fill) parameters.controls.fill = { color: 'gray' }
    if (parameters.controls.height == undefined) parameters.controls.height = 0.25
    parameters.controls.width = controlswidth
    parameters.controls.selectable = false

    const controlsheight = parameters.controls.height

    const controls = this.createPanel(parameters.controls)
    controls.position.y = -(this.height - controls.height - padding) / 2
    this.add(controls)
    controls.position.z = -0.005
    this.controls = controls
    this.controlsposition = controls.position.clone()

    // play/pause button
    const playIcon = parameters.playIcon ? parameters.playIcon : 'play_arrow'
    this.playIcon = playIcon
    const pauseIcon = parameters.pauseIcon ? parameters.pauseIcon : 'pause'
    this.pauseIcon = pauseIcon

    if (!parameters.play) parameters.play = { label: {} }
    parameters.play.label.text = playIcon
    parameters.play.label.isicon = true
    if (parameters.play.label.size == undefined) parameters.play.label.size = 0.1
    if (parameters.play.width == undefined) parameters.play.width = 0.15
    if (parameters.play.height == undefined) parameters.play.height = 0.15
    if (parameters.play.radius == undefined) parameters.play.radius = 0.07
    parameters.play.disabled = true

    const playButton = this.createTextButton(parameters.play)
    controls.add(playButton)
    playButton.position.set(-(controlswidth - playButton.width) / 2 + padding * 2, 0, 0.001)

    playButton.pressed = () => { this.togglePlay() }
    this.playButton = playButton

    this.addEventListener(InteractiveEventType.CLICK, () => {
      this.togglePlay()
    })

    // time display
    if (!parameters.currentTime) parameters.currentTime = {}
    parameters.currentTime.text = '0:00 / 00:00'
    parameters.currentTime.alignX = 'left'

    const currentTime = this.createLabel(parameters.currentTime)
    controls.add(currentTime)
    currentTime.position.set(playButton.position.x + padding + 0.1, 0, 0.001)
    this.currentTime = currentTime

    // volume button
    const volumeUpIcon = parameters.volumeUpIcon ? parameters.volumeUpIcon : 'volume_up'
    const volumeDownIcon = parameters.volumeDownIcon ? parameters.volumeDownIcon : 'volume_down'
    const volumeOffIcon = parameters.volumeOffIcon ? parameters.volumeOffIcon : 'volume_off'

    if (!parameters.volume) parameters.volume = { label: {} }
    if (parameters.volume.radius == undefined) parameters.volume.radius = 0.04
    parameters.volume.label.text = this.getVolumeIcon(volumeUpIcon, volumeDownIcon, volumeOffIcon)
    parameters.volume.label.isicon = true

    const volumeButton = this.createTextButton(parameters.volume)
    controls.add(volumeButton)
    volumeButton.position.set((controlswidth - volumeButton.width) / 2 - padding * 2, 0, 0.001)
    this.volumeButton = volumeButton

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
      volumeButton.label.text = this.getVolumeIcon(volumeUpIcon, volumeDownIcon, volumeOffIcon)
    }
    this.playButton = playButton

    // video time position slider
    if (!parameters.slider) parameters.slider = {}
    if (!parameters.slider.height) parameters.slider.height = 0.02
    if (!parameters.slider.radius) parameters.slider.radius = 0
    if (!parameters.slider.fill) parameters.slider.fill = { color: 'black' }
    if (!parameters.slider.slidersize) parameters.slider.slidersize = 0.03
    if (!parameters.slider.sliderradius) parameters.slider.sliderradius = 0.05
    if (!parameters.slider.slidermaterial) parameters.slider.slidermaterial = { color: 'white' }
    parameters.slider.max = 0
    parameters.slider.width = controlswidth
    parameters.slider.selectable= false

    const progressSlider = this.createProgressbar(parameters.slider)
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
    parameters.slider.width = volumeSliderWidth
    parameters.slider.max = 1
    parameters.slider.step = 0
    parameters.slider.initialvalue = video.volume
    const volumeSlider = this.createProgressbar(parameters.slider)
    controls.add(volumeSlider)
    volumeSlider.position.set((controlswidth - volumeSliderWidth) / 2 - volumeButton.width - padding * 5, 0, 0.001)
    this.volumeSlider = volumeSlider

    // override to draw a circle instead of bar
    volumeSlider.createSlider = this.createSlider

    volumeSlider.addEventListener(SliderbarEventType.SLIDER_MOVED, () => {
      video.volume = volumeSlider.value
      volumeButton.label.text = this.getVolumeIcon(volumeUpIcon, volumeDownIcon, volumeOffIcon)
    })

  }

  private _dispose() { }

  private getVolumeIcon(volumeUpIcon: string, volumeDownIcon: string, volumeOffIcon:string): string {
    const volume = this.video.volume
    if (volume > 0.5)
      return volumeUpIcon
    else if (volume > 0)
      return volumeDownIcon
    return volumeOffIcon
  }

  private setButtonToPlay(playicon: string) {
    this.playButton.label.text = playicon
  }
  private setButtonToPause(pauseicon: string) {
    this.playButton.label.text = pauseicon
  }

  private togglePlayButton(playIcon: string, pauseIcon: string) {
    this.playButton.label.text = this.playButton.label.text == playIcon ? pauseIcon : playIcon
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

  // public

  togglePlay() {
    if (!this.video.duration) return

    if (this.playButton.label.text == this.playIcon)
      this.video.play()
    else if (this.video.duration > 0)
      this.video.pause()

    this.togglePlayButton(this.playIcon, this.pauseIcon)
  }

  load(src: string) {
    this.video.src = src
  }

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
