import { Body, Box, Vec3, type World } from "cannon-es";
import { AmbientLight, AnimationAction, AnimationMixer, Color, DirectionalLight, LoopOnce, LoopRepeat, Material, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3, type AnimationMixerEventMap, type Group, type Object3DEventMap, type Scene, type Vector3Like } from "three";
import { GLTFLoader, type GLTF } from "./threefix";

class SwitchInstance {
    loadedModel: Group<Object3DEventMap>;
    animationMixer: AnimationMixer<AnimationMixerEventMap>;
    inArea: boolean;
    switched: boolean;
    switching: boolean;
    offInitialAction: AnimationAction;
    onInitialAction: AnimationAction;
    onAction: AnimationAction;
    offAction: AnimationAction;

    constructor(scene: Scene, world: World, gltf: GLTF, position: Vector3Like, color: Vector3Like, onSwitch: (switched: boolean)=>void, onActionShow: (type: string, position: Vector3Like, pointHandler: ()=>void)=>void) {
        this.loadedModel = gltf.scene.clone();
        /*this.loadedModel.traverse(it=>{
            if (it instanceof Mesh){
                console.log(it);
                it.material = it.material.clone();
                (it.material as MeshStandardMaterial)?.color?.set(color.x, color.y, color.z);
                (it.material as MeshStandardMaterial)?.emissive?.set(color.x, color.y, color.z);
            }
        })*/
        this.animationMixer = new AnimationMixer(this.loadedModel);
        const onAction = this.animationMixer.clipAction(gltf.animations.find(it => it.name == 'on'));
        onAction.setLoop(LoopOnce, 0);
        onAction.clampWhenFinished = true;
        this.onAction = onAction;
        const offAction = this.animationMixer.clipAction(gltf.animations.find(it => it.name == 'off'));
        offAction.setLoop(LoopOnce, 0);
        offAction.clampWhenFinished = true;
        this.offAction = offAction;
        const onInitialAction = this.animationMixer.clipAction(gltf.animations.find(it => it.name == 'initial_on'));
        onInitialAction.setLoop(LoopOnce, 0);
        onInitialAction.clampWhenFinished = true;
        this.onInitialAction = onInitialAction;
        const offInitialAction = this.animationMixer.clipAction(gltf.animations.find(it => it.name == 'initial_off'));
        offInitialAction.setLoop(LoopOnce, 0);
        offInitialAction.clampWhenFinished = true;
        this.offInitialAction = offInitialAction;
        this.animationMixer.stopAllAction();
        offInitialAction.play();
        this.animationMixer.update(0);
        offInitialAction.stop();
        //this.switched = false;
        this.animationMixer.addEventListener('finished', (event)=>{
            if (event.action == onAction){
                this.switched = true;
                this.switching = false;
                onSwitch(this.switched);
            }
            if (event.action == offAction){
                this.switched = false;
                this.switching = false;
                onSwitch(this.switched);
            }
            if (event.action == onInitialAction){
                this.switched = true;
                this.switching = false;
                onSwitch(this.switched);
            }
            if (event.action == offInitialAction){
                this.switched = false;
                this.switching = false;
                onSwitch(this.switched);
            }
        });

        const boxBody = new Body({
            mass: 0,
            position: new Vec3(position.x, position.y, position.z),
            shape: new Box(new Vec3(0.125, 0.25, 0.125)),
            isTrigger: true,
            fixedRotation: true
        });
        boxBody.addEventListener('collide', (e: any) => {
            if (this.inArea) {
                return;
            }
            this.inArea = true;
            onActionShow('', position, ()=>{
                if (this.switched){
                    this.switchOff();
                } else {
                    this.switchOn();
                }
            });
        });
        world.addEventListener('endContact', (e: any) => {
            if (!this.inArea) {
                return;
            }
            this.inArea = false;
            onActionShow('', null, null);
        });
        world.addBody(boxBody);
        //scene.add(crystal);
        this.loadedModel.position.set(position.x, position.y, position.z);
        scene.add(this.loadedModel);
    }

    switchOn(){
        if (this.switching){
            return;
        }
        this.switching = true;
        //this.animationMixer.stopAllAction();
        this.onAction.reset();
        this.onAction.play();
        this.offAction.crossFadeTo(this.onAction, 0);
    }

    switchOff(){
        if (this.switching){
            return;
        }
        this.switching = true;
        //this.animationMixer.stopAllAction();
        
        this.offAction.reset();
        this.offAction.play();
        this.onAction.crossFadeTo(this.offAction, 0);
    }

    animate() {
        if (this.animationMixer) {
            this.animationMixer.update(0.015);
        }
    }
}

export class Switches {
    instances: SwitchInstance[];
    loaded: boolean;
    onSwitch: ()=>void;
    onActionShow: (type: string, position: Vector3Like, pointHandler: ()=>void)=>void;

    constructor(scene: Scene, world: World) {
        const loader = new GLTFLoader();
        loader.load(
            './switch_ani.glb',
            (gltf) => {
                console.log(gltf)
                this.loaded = true;
                this.instances = [
                    new SwitchInstance(scene, world, gltf, {x: -2, y: 0.5, z: -2}, {x: 0.1, y: 0.9, z: 0.1}, ()=>{this.onSwitch()}, (type, position, pointHandler)=>{
                        this.onActionShow(type, position, pointHandler);
                    }),
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