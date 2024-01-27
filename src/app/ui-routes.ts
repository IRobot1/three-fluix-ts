import { EventDispatcher, Scene } from "three";

interface Route {
  [path: string]: () => Scene
}

export class UIRouter extends EventDispatcher<any> {

  constructor(public routes: Route = {}) {
    super()
  }

  add(path: string, example: () => any) {
    this.routes[path] = example
  }


  navigateto(route: string): Scene {
    console.log('loading', route)
    return this.routes[route]()
  }


}
