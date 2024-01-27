import { NgZone } from "@angular/core";

import { ACESFilmicToneMapping, BufferGeometry, Camera, Line, Object3D, PCFSoftShadowMap, PerspectiveCamera, SRGBColorSpace, Scene, Vector2, Vector3, WebGLRenderer } from "three";

import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import Stats from 'three/examples/jsm/libs/stats.module.js';

import { UIRouter } from "./ui-routes";

import { EffectComposer, Pass } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ThreeInteractive } from "three-fluix";

export interface renderState { scene: Scene, camera: Camera, renderer: WebGLRenderer }

export class ThreeJSApp extends WebGLRenderer {
  public camera!: Camera;
  readonly interactive: ThreeInteractive
  public router = new UIRouter()

  startscene?: Scene
  homescene?: Scene
  hidehome = false
  examplescene?: Scene

  constructor() {
    super({ alpha: true, antialias: true })

    this.router.addEventListener('load', () => {
      this.camera.position.set(0, 0, 0)
      this.camera.rotation.set(0, 0, 0)
    })

    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.setPixelRatio(window.devicePixelRatio)
    this.toneMapping = ACESFilmicToneMapping
    this.outputColorSpace = SRGBColorSpace

    this.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.domElement);

    this.shadowMap.enabled = true;
    this.shadowMap.type = PCFSoftShadowMap;

    window.addEventListener('resize', () => {
      var width = window.innerWidth;
      var height = window.innerHeight;
      this.setSize(width, height);

      if (this.camera.type == 'PerspectiveCamera') {
        const perspective = this.camera as PerspectiveCamera
        perspective.aspect = width / height;
        perspective.updateProjectionMatrix();
      }
    });

    this.interactive = new ThreeInteractive(this, this.camera)

    const animate = () => {


      if (this.stats) this.stats.update()

      this.autoClear = false
      if (this.startscene) this.render(this.startscene, this.camera);
      if (this.homescene && !this.hidehome) this.render(this.homescene, this.camera);
      if (this.examplescene) this.render(this.examplescene, this.camera)

      if (this.composer) this.composer.render()

    };

    this.setAnimationLoop(animate);

    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.path) {
        this.navigateback()
      }
    });

    window.addEventListener('load', () => {
      const url = window.location.pathname.slice(1)
      if (!url) return
      try {
        this.navigateto(url)
      } catch (error) {
        console.error(`Invalid route ${url}`)
      }
    });


  }

  vrbutton?: HTMLElement

  // short-cut
  navigateto(route: string) {
    if (this.examplescene) return

    //this.interactive.selectable.clear()
    //this.interactive.draggable.clear()
    this.examplescene = this.router.navigateto(route)
    this.examplescene.position.set(0, 1.5, -0.5)

    this.hidehome = true
  }

  navigateback() {
    if (this.examplescene) {
      // @ts-ignore
      this.examplescene.dispose()
      this.examplescene = undefined
      this.hidehome = false
    }
  }


  disableVR() {
    this.xr.enabled = false
    if (this.vrbutton) {
      document.body.removeChild(this.vrbutton);
      this.vrbutton = undefined
    }
  }

  enableVR(hidebutton = false) {
    if (!this.startscene) return

    const geometry = new BufferGeometry();
    geometry.setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, - 5)]);

    const controller1 = this.xr.getController(0);
    controller1.name = 'left'
    controller1.add(new Line(geometry));
    this.startscene.add(controller1);

    const controller2 = this.xr.getController(1);
    controller2.name = 'right'
    controller2.add(new Line(geometry));
    this.startscene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    const controllerGrip1 = this.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    this.startscene.add(controllerGrip1);

    const controllerGrip2 = this.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    this.startscene.add(controllerGrip2);

    this.xr.enabled = true
    this.vrbutton = VRButton.createButton(this)
    document.body.appendChild(this.vrbutton);
    if (hidebutton) this.vrbutton.style.visibility = 'hidden'
  }

  enterVR() {
    if (this.vrbutton) {
      const event = new Event('click')
      this.vrbutton.dispatchEvent(event)
      this.vrbutton.style.visibility = 'visible'
    }
  }

  stats?: Stats

  enableStats() {
    const stats = new Stats();
    document.body.appendChild(stats.dom);
    stats.showPanel(0);
    this.stats = stats
  }

  disableStats() {
    if (this.stats) {
      document.body.removeChild(this.stats.dom)
      this.stats = undefined
    }
  }

  composer?: EffectComposer

  enablePostProcessing(scene: Scene) {
    const composer = new EffectComposer(this);

    const renderPass = new RenderPass(scene, this.camera);
    composer.addPass(renderPass);

    this.composer = composer
  }

  addPass(pass: Pass) {
    this.composer?.addPass(pass)
  }

  disablePostProcessing() { this.composer = undefined }
}
