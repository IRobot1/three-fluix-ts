import { Component, NgZone } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
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

      app.router.add('/', () => { return new HomeScene(app) })
    })
  }
}
