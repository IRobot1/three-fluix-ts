import { Component, NgZone } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  providers: [ThreeJSApp]
})
export class AppComponent {
  title = 'test'
  constructor(
    router: Router,
    zone: NgZone,
    app: ThreeJSApp,
  ) {

    zone.runOutsideAngular(() => {


    })


  }
}
