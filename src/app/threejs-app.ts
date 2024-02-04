import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";

import { ACESFilmicToneMapping, BufferGeometry, Camera, Line, Object3D, PCFSoftShadowMap, PerspectiveCamera, SRGBColorSpace, Scene, Vector2, Vector3, WebGLRenderer } from "three";

import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { EffectComposer, Pass } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Timer } from 'three/examples/jsm/misc/Timer.js';

import { FontCache, InteractiveEventType, KeyboardInteraction, ButtonMenuParameters, PointerInteraction, UIMaterials, UIButtonMenu, UIOptions, MenuButtonParameters } from "three-fluix";

export interface renderState { scene: Scene, camera: Camera, renderer: WebGLRenderer }

@Injectable()
export class ThreeJSApp extends WebGLRenderer {
  public camera!: Camera;
  readonly pointer: PointerInteraction

  uioptions: UIOptions
  timer: Timer;

  private _scene: Scene | undefined
  get scene() { return this._scene }
  set scene(newvalue: Scene | undefined) {
    if (this._scene != newvalue) {
      this._scene = newvalue
      this.pointer.scene = newvalue
      this.camera.position.set(0, 1.5, 0)
      this.orbit.target.set(0, 1.5, -1)
      this.enableVR()
    }
  }

  constructor(private router: Router, zone: NgZone) {
    super({ alpha: true, antialias: true })

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

    this.pointer = new PointerInteraction(this, this.camera)

    const timer = new Timer()
    this.timer = timer

    const animate = () => {
      if (!this.scene) return

      if (this.stats) this.stats.update()

      timer.update()
      this.scene.dispatchEvent<any>({ type: 'tick', timer })

      this.render(this.scene, this.camera);

      if (this.composer) this.composer.render()

    };

    zone.runOutsideAngular(() => {
      this.setAnimationLoop(animate);
    })

    const orbit = new OrbitControls(this.camera, this.domElement);
    orbit.enableRotate = true;
    orbit.update();
    this.orbit = orbit

    const disableRotate = () => { orbit.enableRotate = false }
    this.pointer.addEventListener(InteractiveEventType.DRAGSTART, disableRotate)

    this.uioptions = {
      materials: new UIMaterials(),
      fontCache: new FontCache(),
      keyboard: new KeyboardInteraction(this)
    }
  }

  home() {
    this.router.navigate(['/'])
  }

  showHome(scene: Scene): Object3D {
    const items: Array<MenuButtonParameters> = [
      {
        label: { text: 'home', isicon: true }, hint: 'Home', selected: () => {
          this.home()
        }
      },
      {
        label: { text: 'flip_camera_android', isicon: true }, hint: 'Orbit On/Off', selected: () => {
          this.enableRotate = !this.enableRotate
        }
      },
    ]

    const menuparams: ButtonMenuParameters = {
      items,
      hintLabel: {
        alignX: 'left', size: 0.05, material: { color: 'white' }
      }
    }

    const home = new UIButtonMenu(menuparams, this.pointer, this.uioptions)

    scene.add(home)
    return home
  }


  get enableRotate() { return this.orbit.enableRotate }
  set enableRotate(newvalue: boolean) { this.orbit.enableRotate = newvalue }

  get enableOrbit() { return this.orbit.enabled }
  set enableOrbit(newvalue: boolean) { this.orbit.enabled = newvalue }

  orbit: OrbitControls
  vrbutton?: HTMLElement

  disableVR() {
    this.xr.enabled = false
    if (this.vrbutton) {
      document.body.removeChild(this.vrbutton);
      this.vrbutton = undefined
    }
  }

  enableVR(hidebutton = false) {
    const scene = this.scene!

    const geometry = new BufferGeometry();
    geometry.setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, - 5)]);

    const controller1 = this.xr.getController(0);
    controller1.name = 'left'
    controller1.add(new Line(geometry));
    scene.add(controller1);

    const controller2 = this.xr.getController(1);
    controller2.name = 'right'
    controller2.add(new Line(geometry));
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    const controllerGrip1 = this.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    const controllerGrip2 = this.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    if (this.xr.enabled) return

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
