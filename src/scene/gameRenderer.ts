import * as THREE from 'three';
import { MainScene } from './mainScene';
import { Player } from './player';
import type { IPointer } from '../ui/screenStick';
import { World } from 'cannon-es';

export class GameRenderer {
    scene: THREE.Scene<THREE.Object3DEventMap>;
    camera: THREE.PerspectiveCamera;
    cube: THREE.Mesh;
    renderer: THREE.WebGLRenderer;
    animationFrameId: number;
    geometry: THREE.BoxGeometry;
    material: THREE.Material;
    mainScene: MainScene;
    player: Player;
    clock: THREE.Timer;
    world: World;
    onCollect: (variant: 'red' | 'green' | 'blue')=>void;

    constructor(canvas: HTMLCanvasElement) {
        this.clock = new THREE.Timer();
        this.world = new World();
        this.world.gravity.set(0, -9.82, 0);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
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

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        /*this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.cube);*/

        window.addEventListener('resize', this.handleResize);

        this.mainScene = new MainScene(this.scene, this.world);
        this.mainScene.onCollect = (variant)=>this.onCollect(variant);
        this.player = new Player(this.scene, this.world);

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
        //console.log(this.world.bodies);
        if(this.player.loadedModel){
            const angle = -Math.PI / 10;
            this.camera.rotation.set(-Math.PI / 6, angle, 0 );
            this.camera.position.set(this.player.loadedModel.position.x + Math.sin(angle) * 3, 2, this.player.loadedModel.position.z + Math.cos(angle) * 3);
        }
        this.clock.update(timeStamp);
        this.world.step(1/60, delta, 3);
        
    }

    input(data: IPointer){
        this.player.input(data);
    }

    destroy() {
        cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('resize', this.handleResize);
        this.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
    }
}