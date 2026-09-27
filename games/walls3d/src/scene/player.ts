import { AmbientLight, AnimationMixer, DirectionalLight, LoopRepeat, Mesh, PointLight, Vector3, type Group, type Scene } from "three";
import { GLTFLoader } from "./threefix";
import type { IPointer } from "../ui/screenStick";
import { Body, Box, Shape, SHAPE_TYPES, Vec3, type World } from "cannon-es";

export class Player {
    loadedModel: Group;
    animationMixer: AnimationMixer;
    speed: Vector3;
    gltf: import("three/addons").GLTF;
    actionIdle: import("three").AnimationAction;
    actionWalk: import("three").AnimationAction;
    boxBody: Body;

    constructor(scene: Scene, world: World) {
        this.speed = new Vector3(0, 0, 0);
        const loader = new GLTFLoader();
        loader.load(
            './player.glb', // Путь к файлу из папки public
            (gltf) => {
                this.gltf = gltf;
                this.loadedModel = gltf.scene;
                scene.add(this.loadedModel);
                this.animationMixer = new AnimationMixer(this.loadedModel);
                console.log(gltf)
                const action = this.animationMixer.clipAction(gltf.animations.find(it=>it.name == 'walk'));
                action.setLoop(LoopRepeat, Infinity);
                //action.play();
                 this.actionWalk= action;

                 const actionIdle = this.animationMixer.clipAction(this.gltf.animations.find(it=>it.name == 'idle'));
            this.animationMixer.stopAllAction();
                actionIdle.setLoop(LoopRepeat, Infinity);
                actionIdle.play();
                this.actionIdle = actionIdle; 

                const dirLight = new PointLight(0xffffff, 2.5/2, 2.5, 1);
                this.loadedModel.add(dirLight);
                dirLight.castShadow = true;
                dirLight.position.set(1.2, -2.2, 0);
                dirLight.shadow.bias = -0.005;

                this.loadedModel.traverseVisible(it=>{
                    if (!(it as Mesh).isMesh){
                        return;
                    }
                    //it.castShadow = true;
                }
                )
                //this.loadedModel.castShadow = true;
            },
            (progress) => {
                // Прогресс загрузки (байты)
                console.log(`Loading: ${(progress.loaded / progress.total) * 100}%`);
            },
            (error) => {
                console.error('Ошибка загрузки GLB:', error);
            }
        );

        this.boxBody = new Body({
            mass: 1, // Объект динамический, на него действует гравитация
            position: new Vec3(0, 3, 0), // Поднимаем на высоту 5 метров
            // В Cannon размеры коробки задаются как "полу-расширения" (половина стороны)
            shape: new Box(new Vec3(0.55, 0.5, 0.55))
        });
        world.addBody(this.boxBody);
        this.boxBody.fixedRotation = true; 
        this.boxBody.updateMassProperties();
        
        const boxBody1 = new Body({
            mass: 0, // Объект динамический, на него действует гравитация
            position: new Vec3(0, 1, 0), // Поднимаем на высоту 5 метров
            // В Cannon размеры коробки задаются как "полу-расширения" (половина стороны)
            //shape: new Box(new Vec3(0.5, 0.5, 0.5)) 
        });
        
       /* [
    { type: 'box', size: [1, 1, 0.129], offset: { x: 0, y: 0, z: 0 } },
    { type: 'box', size: [0.106, 1, 0.186], offset: { x: -0.952, y: 0.814, z: 0.006 } },
    { type: 'box', size: [0.106, 1, 0.186], offset: { x: -1.943, y: 0.814, z: 0.006 } },
    { type: 'box', size: [0.593, 1, 0.129], offset: { x: -2.594, y: 0, z: 0 } },
    { type: 'box', size: [3.324, 1, 0.129], offset: { x: -0.054, y: 0, z: -3.141 } },
    { type: 'box', size: [0.129, 1, 1.462], offset: { x: 0.382, y: 0, z: -1.583 } }
  ]*/[
    { type: 'box', size: [4.625, 1, 0.15], offset: { x: -2.025, y: 1, z: -5.05 } },
    { type: 'box', size: [0.15, 1, 4.75], offset: { x: -6.5, y: 1, z: -0.15 } },
    { type: 'box', size: [0.15, 1, 5.025], offset: { x: 7.5, y: 1, z: 2.875 } },
    { type: 'box', size: [5.65, 1, 0.15], offset: { x: 2, y: 1, z: 8.05 } },
    { type: 'box', size: [1.5, 1, 0.15], offset: { x: -4.85, y: 1, z: 4.45 } },
    { type: 'box', size: [0.15, 1, 1.65], offset: { x: -3.5, y: 1, z: 6.25 } },
    { type: 'box', size: [0.15, 1, 1.525], offset: { x: 2.45, y: 1, z: -3.375 } },
    { type: 'box', size: [2.375, 1, 0.15], offset: { x: 4.975, y: 1, z: -2 } },
    { type: 'box', size: [0.1, 1, 3.45], offset: { x: -0.75, y: 1, z: -1.45 } },
    { type: 'box', size: [0.975, 1, 0.1], offset: { x: -1.825, y: 1, z: -0.1 } },
    { type: 'box', size: [1.075, 1, 0.1], offset: { x: -5.275, y: 1, z: -0.1 } },
    { type: 'box', size: [0.475, 1, 0.1], offset: { x: -0.175, y: 1, z: 1.9 } },
    { type: 'box', size: [1.3, 1, 0.1], offset: { x: 3, y: 1, z: 1.9 } },
    { type: 'box', size: [0.1, 1, 2.95], offset: { x: 2.8, y: 1, z: 4.95 } },
    { type: 'box', size: [0.825, 1, 0.1], offset: { x: 6.525, y: 1, z: 1.9 } },
    { type: 'box', size: [1.875, 1, 0.15], offset: { x: -1.475, y: 1, z: 4.45 } },
    { type: 'box', size: [0.1, 1, 0.5], offset: { x: 0.5, y: 1, z: 4.8 } },
    { type: 'box', size: [0.1, 1, 0.6], offset: { x: 0.5, y: 1, z: 7.3 } }
  ].forEach(it=>{
            const box = new Box(new Vec3(...it.size));
            boxBody1.addShape(box, new Vec3(it.offset.x, it.offset.y, it.offset.z));  
        })
        
        world.addBody(boxBody1);

        const boxBody2 = new Body({
            mass: 0, // Объект динамический, на него действует гравитация
            position: new Vec3(0, -0.1, 0), // Поднимаем на высоту 5 метров
            // В Cannon размеры коробки задаются как "полу-расширения" (половина стороны)
            shape: new Box(new Vec3(10.5, 0.5, 10.5)) 
        });
        world.addBody(boxBody2);
    }

    animate(){
        if (this.loadedModel) {
            this.loadedModel.position.copy(this.boxBody.position)
            this.boxBody.position.x += this.speed.x;
            this.boxBody.position.z += this.speed.z;
            /*this.loadedModel.position.y = 1;
            this.loadedModel.position.x += this.speed.x;
            this.loadedModel.position.z += this.speed.z;*/
            

            this.loadedModel.scale.set(0.125, 0.125, 0.125);
            //this.loadedModel.rotation.y += 0.005; // Вращаем модель, когда она загрузилась
        }

        if (this.animationMixer){
             this.animationMixer.update(0.05);
        }
    }

    input(data: IPointer){
        if (!data){
            this.speed.set(0, 0, 0);
            this.actionIdle.play();
            this.actionWalk.stop();
            return;
        }
        this.actionWalk.play();
        this.actionIdle.stop();
        this.speed.set(data.result.x / 20, 0, data.result.y / 20);
        const forward = new Vector3(-data.result.y / 20, 0, data.result.x / 20);
        if (forward.length() > 0.01){
            this.loadedModel.lookAt(forward.add(this.loadedModel.position));
        }
    }
}