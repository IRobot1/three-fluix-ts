import { Component } from "@angular/core";

import { Scene } from "three";

import { ThreeJSApp } from "../app/threejs-app";
import { MediaPlayerParameters, UIMediaPlayer } from "./media-player";

@Component({
  template: '',
})
export class MediaPlayerScene extends Scene {

  constructor(private app: ThreeJSApp) {
    super()

    const z = -0.8

    app.scene = this

    const home = app.showHome(this)
    home.position.set(-0.1, 2.5, z)

    app.camera.position.z = 1

    const mediaparams: MediaPlayerParameters = {
      width: 16 / 9,
    }
    const mediaplayer = new UIMediaPlayer(mediaparams, app.pointer, app.uioptions)
    this.add(mediaplayer)
    mediaplayer.position.set(0, 1.5, z)
    //mediaplayer.load('https://www.eso.org/public/archives/videos/medium_podcast/eso2208-eht-mwa.mp4')
    //mediaplayer.load('https://www.eso.org/public/archives/videos/medium_podcast/cs0008a.mp4')
    //mediaplayer.load('https://images-assets.nasa.gov/video/The%20Webb%20Space%20Telescope%E2%80%99s%20New%20Look%20at%20a%20%E2%80%9CStar%20Factory%E2%80%9D%20on%20This%20Week%20@NASA%20%E2%80%93%20October%2021,%202022/The%20Webb%20Space%20Telescope%E2%80%99s%20New%20Look%20at%20a%20%E2%80%9CStar%20Factory%E2%80%9D%20on%20This%20Week%20@NASA%20%E2%80%93%20October%2021,%202022~small.mp4')
    //mediaplayer.load('https://images-assets.nasa.gov/video/KSC-20190301-VP-FJM001-0001_NASA%20Administrator%20Talks%20Historic%20SpaceX%20Flight/KSC-20190301-VP-FJM001-0001_NASA%20Administrator%20Talks%20Historic%20SpaceX%20Flight~small.mp4')
    //mediaplayer.load('https://images-assets.nasa.gov/video/KSC-20200608-MH-Demo-2_4K_Video_Release-3251785/KSC-20200608-MH-Demo-2_4K_Video_Release-3251785~small.mp4')
    mediaplayer.load('assets/sintel.mp4')

    this.addEventListener('dispose', () => {
      mediaplayer.dispose()
    })

  }
}
