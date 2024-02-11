import { Component } from "@angular/core";

import { Scene } from "three";

import { GUI, UIColorPicker, UIProperties, PropertiesParameters, TitlebarParameters, UITitlebar } from "three-fluix";

import { ThreeJSApp } from "../app/threejs-app";
import { MediaPlayerParameters, UIMediaPlayer } from "./media-player";
import { MathUtils } from "three/src/math/MathUtils";

@Component({
  template: '',
})
export class MediaPlayerScene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()

    const z = -0.5

    app.scene = this

    const home = app.showHome(this)
    home.position.set(-0.1, 1.9, z)

    app.camera.position.x = 0.2
    app.camera.position.z = 0.5

    const mediaparams: MediaPlayerParameters = {
      width: 16 / 9,
    }
    const mediaplayer = new UIMediaPlayer(mediaparams, app.pointer, app.uioptions)
    this.add(mediaplayer)

    const titlebarparams: TitlebarParameters = {
      width: mediaparams.width,
      fill: { color: 'cornflowerblue', transparent: true, opacity: 0.5 },
      title: { text: 'Media Player', material: { color: 'white' } },
    }

    const titlebar = new UITitlebar(titlebarparams, app.pointer, app.uioptions)
    this.add(titlebar)

    titlebar.position.set(0, 1.7, z)
    titlebar.scale.setScalar(0.7)

    titlebar.setPanel(mediaplayer)

    const videos: any = {
      'Sintel': 'assets/sintel.mp4',
      'What it takes to image a black hole': 'https://www.eso.org/public/archives/videos/medium_podcast/eso2208-eht-mwa.mp4',
      'Come to the dark side, we have stars': 'https://www.eso.org/public/archives/videos/medium_podcast/cs0008a.mp4',
      'James Webb new look at a star factory': 'https://images-assets.nasa.gov/video/The%20Webb%20Space%20Telescope%E2%80%99s%20New%20Look%20at%20a%20%E2%80%9CStar%20Factory%E2%80%9D%20on%20This%20Week%20@NASA%20%E2%80%93%20October%2021,%202022/The%20Webb%20Space%20Telescope%E2%80%99s%20New%20Look%20at%20a%20%E2%80%9CStar%20Factory%E2%80%9D%20on%20This%20Week%20@NASA%20%E2%80%93%20October%2021,%202022~small.mp4',
      'Historic first flight of SpaceX Crew Dragon': 'https://images-assets.nasa.gov/video/KSC-20190301-VP-FJM001-0001_NASA%20Administrator%20Talks%20Historic%20SpaceX%20Flight/KSC-20190301-VP-FJM001-0001_NASA%20Administrator%20Talks%20Historic%20SpaceX%20Flight~small.mp4',
      //'Dragon Demo-2 4K': 'https://images-assets.nasa.gov/video/KSC-20200608-MH-Demo-2_4K_Video_Release-3251785/KSC-20200608-MH-Demo-2_4K_Video_Release-3251785~small.mp4',
    }

    const fake = {
      video: 'Sintel',
      playpause: () => { mediaplayer.togglePlay() }
    }
    mediaplayer.load(videos[fake.video])

    const gui = new GUI({})
    gui.add(fake, 'video', videos).name('Select Video').onChange(() => {
      const url = videos[fake.video]
      mediaplayer.load(url)
    })

    const colorpicker = new UIColorPicker({}, app.pointer, app.uioptions)

    const propertiesParams: PropertiesParameters = {
      labelwidth: 0.5,
      pickwidth: 0.9,
      inputwidth: 0.5,
      selectable: false, width: 1.9
    }
    const properties = new UIProperties(propertiesParams, app.pointer, app.uioptions, gui)
    properties.getColorPicker = () => { return colorpicker }
    titlebar.add(properties)

    properties.position.set(0, 0.12, 0.001)
    properties.scale.setScalar(0.8)

    this.addEventListener('dispose', () => {
      mediaplayer.dispose()
      properties.dispose()
    })


  }
}
