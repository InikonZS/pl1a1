//import * as THREE from 'three';
import { MainScene } from './mainScene';
import { Player } from './player';
import type { IPointer } from '../ui/screenStick';
import { World } from 'cannon-es';
import { Material, type Object3DEventMap, PerspectiveCamera, type Mesh, type BoxGeometry, Timer, PCFShadowMap, Scene, WebGLRenderer, type Vector3Like } from 'three';
import type { ReactElement } from 'react';
import { Cat } from './cat';

export class GameRenderer {
    scene: Scene<Object3DEventMap>;
    camera: PerspectiveCamera;
    cube: Mesh;
    renderer: WebGLRenderer;
    animationFrameId: number;
    geometry: BoxGeometry;
    material: Material;
    mainScene: MainScene;
    player: Player;
    clock: Timer;
    world: World;
    onCollect: (variant: 'red' | 'green' | 'blue')=>void;
    //onActionShow: (type: string, position: Vector3Like, pointHandler: ()=>void)=>void;
    onAnimate: ()=>void;
    setOverlays: React.Dispatch<React.SetStateAction<Record<string, ReactElement>>>;
    canvas: HTMLCanvasElement;
    cat: Cat;
    activePlayer: Cat | Player;

    constructor(canvas: HTMLCanvasElement, setOverlays:React.Dispatch<React.SetStateAction<Record<string, ReactElement>>>) {
        this.setOverlays = setOverlays;
        this.canvas = canvas;
        this.clock = new Timer();
        this.world = new World();
        this.world.gravity.set(0, -9.82, 0);

        this.scene = new Scene();
        this.camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        this.camera.position.y = 5;
        this.camera.rotation.reorder('YXZ');
        this.camera.rotation.set(-Math.PI / 6, -Math.PI / 4, 0 );
        this.camera.layers.enable(0);
        this.camera.layers.enable(1);

        this.renderer = new WebGLRenderer({
            canvas: canvas,
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        /*this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.cube);*/

        window.addEventListener('resize', this.handleResize);

        this.mainScene = new MainScene(this);
        //this.mainScene.onActionShow = (type, position, pointHandler) => this.onActionShow(type, position, pointHandler);
        this.mainScene.onCollect = (variant)=>this.onCollect(variant);
        this.player = new Player(this.scene, this.world);
        this.cat = new Cat(this.scene, this.world);
        this.setActivePlayer('player');

        this.animate(Date.now());
    }

    handleResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    animate = (timeStamp: number) => {
        const delta = Math.min(Math.abs(this.clock.getDelta()), 1 / 5);
        //console.log(delta);

        //this.cube.rotation.x += 0.01;
        //this.cube.rotation.y += 0.01;

        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(this.animate);
        this.mainScene.animate();
        this.player.animate();
        this.cat.animate();
        //console.log(this.world.bodies);
        if(this.player.loadedModel){
            const angle = -Math.PI / 10;
            this.camera.rotation.set(-Math.PI / 6, angle, 0 );
            this.camera.position.set(this.activePlayer.loadedModel.position.x + Math.sin(angle) * 3, 2, this.activePlayer.loadedModel.position.z + Math.cos(angle) * 3);
        }
        this.clock.update(timeStamp);
        this.world.step(1/60, delta, 3);
        this.onAnimate?.();
    }

    setActivePlayer(name?: 'cat' | 'player'){
        /*if (!this.activePlayer){
            this.cat.boxBody.mass = 1000;
            this.player.boxBody.mass = 1000;
        } else {
            this.activePlayer.boxBody.mass = 1000;
        }*/
        const nextPlayer = this.activePlayer == this.cat ? 'player' : 'cat';
        this.activePlayer = {cat: this.cat, player: this.player}[name ?? nextPlayer];
        //this.activePlayer.boxBody.mass = 1;
    }

    input(data: IPointer){
        this.activePlayer.input(data);
    }

    destroy() {
        cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('resize', this.handleResize);
        this.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
    }
}