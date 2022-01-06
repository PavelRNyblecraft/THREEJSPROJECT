import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { WebapiService } from './services/webapi.service';
import { StorageService } from './services/storage.service';

import { CameraPosition, DEFAULT_CAMERA_POSITION } from './interfaces/camera-position';
import { SceneState } from './interfaces/scene-state';
import { Response } from './interfaces/response';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'three-js-project';

  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();

  amount: number = parseInt( window.location.search.substr( 1 ) ) || 10;
  count: number = Math.pow( this.amount, 3 );

  raycaster: THREE.Raycaster = new THREE.Raycaster();
  mouse: THREE.Vector2 = new THREE.Vector2( 1, 1 );

  color: THREE.Color = new THREE.Color();
  white: THREE.Color = new THREE.Color().setHex( 0xffffff );
  light: THREE.HemisphereLight = new THREE.HemisphereLight( 0xffffff, 0x888888 );

  scene: THREE.Scene = new THREE.Scene();

  geometry: THREE.IcosahedronGeometry = new THREE.IcosahedronGeometry( 0.5, 3 );
  material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );
  mesh: THREE.InstancedMesh = new THREE.InstancedMesh( this.geometry, this.material, this.count );

  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  controls!: OrbitControls;

  constructor(
    private webApi: WebapiService,
    private storage: StorageService,
  ) {}

  ngOnInit(): void {

    this.init();
    this.animate();

    if (this.storage.checkCookie('ThreeJSScene')) {
      this.webApi.readSceneState().subscribe((response: Response) => {
        const state: SceneState = JSON.parse(response.message);
        this.setColor(state.instanceColorArray);
        this.setCameraPosition(state.cameraPosition);
      });
    }

    interval(1500).subscribe(val => {
      this.writeScene();
    }); 
  }

  setColor(instanceColor: Array<number>): void {
    const itemSize: number = 3;
    let itemCount: number = 0;

    for (let i = 0; i < (instanceColor.length / itemSize); i++) {
      this.mesh.setColorAt( i, new THREE.Color(instanceColor[itemCount], instanceColor[itemCount + 1], instanceColor[itemCount + 2]));
      itemCount += itemSize;
      this.mesh.instanceColor!.needsUpdate = true;
    }
  }

  setCameraPosition(cameraPosition: CameraPosition): void {
    this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  }

	init(): void {
    this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 100);
    this.setCameraPosition(DEFAULT_CAMERA_POSITION);
    this.camera.lookAt( 0, 0, 0 );

    this.scene = new THREE.Scene();

    this.light.position.set( 0, 1, 0 );
    this.scene.add( this.light );

    let i = 0;
    const offset = ( this.amount - 1 ) / 2;

    const matrix = new THREE.Matrix4();

    for ( let x = 0; x < this.amount; x ++ ) {

      for ( let y = 0; y < this.amount; y ++ ) {

        for ( let z = 0; z < this.amount; z ++ ) {

          matrix.setPosition( offset - x, offset - y, offset - z );

          this.mesh.setMatrixAt( i, matrix );
          this.mesh.setColorAt( i, this.color );

          i ++;

        }

      }

    }

    this.scene.add( this.mesh );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight);
    document.body.appendChild( this.renderer.domElement );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;

    this.controls.minDistance = 15;
    this.controls.maxDistance = 80;

    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('mousemove', this.onMouseMove );

	}

  onKeyDown = (event: KeyboardEvent) => {
    const keyCode = event.key;
    console.log(keyCode);
    if (keyCode === 'ArrowUp') {
      this.camera.rotateY(50);
    } else if (keyCode === 'ArrowDown') {
      this.camera.rotateY(-50);
    } else if (keyCode === 'ArrowLeft') {
      this.camera.rotateX(-50);
    } else if (keyCode === 'ArrowRight') {
      this.camera.rotateX(50);
    }
  }

  writeScene(): void {
    this.webApi.writeSceneState({instanceColorArray: Array.from(this.mesh.instanceColor!.array), cameraPosition: this.camera.position});
  }

  onWindowResize = () => {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  onMouseMove = ( event: MouseEvent ) => {
    event.preventDefault();

    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  animate = () => {

    requestAnimationFrame( this.animate );

    this.controls.update();

    this.raycaster.setFromCamera( this.mouse, this.camera );

    const intersection = this.raycaster.intersectObject( this.mesh );

    if ( intersection.length > 0 ) {

      const instanceId = intersection[ 0 ].instanceId;

      this.mesh.getColorAt( instanceId!, this.color );

      if ( this.color.equals( this.white ) ) {

        this.mesh.setColorAt( instanceId!, this.color.setHex( Math.random() * 0xffffff ) );

        this.mesh.instanceColor!.needsUpdate = true;
      }

    }

    this.render();
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }
}
