import { Component, NgZone } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
import { StartScene } from './start';
import { HomeScene } from './home';


@Component({
  selector: 'app-root',
  template: '',
})
export class AppComponent {
  title = 'test'
  constructor(zone: NgZone) {

    zone.runOutsideAngular(() => {


      const app = new ThreeJSApp()
      app.startscene = new StartScene(app)
      app.homescene = new HomeScene(app)

    })


  }
}
