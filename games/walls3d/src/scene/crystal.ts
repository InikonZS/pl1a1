import { Body, Box, Vec3, type World } from "cannon-es";
import { AmbientLight, AnimationMixer, Color, DirectionalLight, LoopOnce, LoopRepeat, Material, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3, type AnimationMixerEventMap, type Group, type Object3DEventMap, type Scene, type Vector3Like } from "three";
import { GLTFLoader, type GLTF } from "./threefix";

class CrystalInstance {
    collected: boolean;
    loadedModel: Group<Object3DEventMap>;
    animationMixer: AnimationMixer<AnimationMixerEventMap>;

    constructor(scene: Scene, world: World, gltf: GLTF, position: Vector3Like, color: Vector3Like, onCollect: ()=>void) {
        this.loadedModel = gltf.scene.clone();
        this.loadedModel.traverse(it=>{
            if (it instanceof Mesh){
                console.log(it);
                it.material = it.material.clone();
                (it.material as MeshStandardMaterial)?.color?.set(color.x, color.y, color.z);
                (it.material as MeshStandardMaterial)?.emissive?.set(color.x, color.y, color.z);
            }
        })
        this.animationMixer = new AnimationMixer(this.loadedModel);
        const idleAction = this.animationMixer.clipAction(gltf.animations.find(it => it.name == 'idle'));
        idleAction.setLoop(LoopRepeat, Infinity);
        const collectAction = this.animationMixer.clipAction(gltf.animations.find(it => it.name == 'collect'));
        collectAction.setLoop(LoopOnce, 0);
        collectAction.clampWhenFinished = true;
        this.animationMixer.stopAllAction();
        idleAction.play();

        const boxBody = new Body({
            mass: 0,
            position: new Vec3(position.x, position.y, position.z),
            shape: new Box(new Vec3(0.125, 0.25, 0.125)),
            isTrigger: true,
            fixedRotation: true
        });
        boxBody.addEventListener('collide', (e: any) => {
            if (this.collected) {
                return;
            }
            this.collected = true;
            idleAction.stop();
            collectAction.play();
            this.animationMixer.addEventListener('finished', (e) => {
                if (e.action === collectAction) {
                    this.loadedModel.visible = false;
                    onCollect();
                }
            });

        });
        world.addEventListener('endContact', (e: any) => {
            console.log(e);
        });
        world.addBody(boxBody);
        //scene.add(crystal);
        this.loadedModel.position.set(position.x, position.y, position.z);
        scene.add(this.loadedModel);
    }

    animate() {
        if (this.animationMixer) {
            this.animationMixer.update(0.015);
        }
    }
}

export class Crystal {
    instances: CrystalInstance[];
    loaded: boolean;
    onCollect: (variant: 'red' | 'green' | 'blue')=>void;

    constructor(scene: Scene, world: World) {
        const loader = new GLTFLoader();
        loader.load(
            './crystal.glb',
            (gltf) => {
                console.log(gltf)
                this.loaded = true;
                this.instances = [
                    new CrystalInstance(scene, world, gltf, {x: -2, y: 0.5, z: -2}, {x: 0.1, y: 0.9, z: 0.1}, ()=>{this.onCollect('green')}),
                    new CrystalInstance(scene, world, gltf, {x: -2, y: 0.5, z: 6}, {x: 0.1, y: 0.3, z: 0.9}, ()=>{this.onCollect('blue')}),
                    new CrystalInstance(scene, world, gltf, {x: 4, y: 0.5, z: 5}, {x: 0.9, y: 0.1, z: 0.3}, ()=>{this.onCollect('red')}),
                ]
            },
            (progress) => {
                // Прогресс загрузки (байты)
                console.log(`Loading: ${(progress.loaded / progress.total) * 100}%`);
            },
            (error) => {
                console.error('Ошибка загрузки GLB:', error);
            }
        );
    }

    animate() {
        if (this.loaded) {
            this.instances.forEach(it=>it.animate());
        }
    }
}