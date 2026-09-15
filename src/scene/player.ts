import { AmbientLight, AnimationMixer, DirectionalLight, LoopRepeat, PointLight, Vector3, type Group, type Scene } from "three";
import { GLTFLoader } from "three/addons";
import type { IPointer } from "../ui/screenStick";
import { Body, Box, Vec3, type World } from "cannon-es";

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

                const dirLight = new PointLight(0xffffff, 2.5/2, 2.5, 0.01);
                dirLight.castShadow = true;
                dirLight.position.set(0, -2.2, 0);
                dirLight.shadow.bias = -0.005;
                this.loadedModel.add(dirLight);
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
            shape: new Box(new Vec3(0.25, 0.5, 0.25)) 
        });
        world.addBody(this.boxBody);
        this.boxBody.fixedRotation = true; 
        this.boxBody.updateMassProperties();
        
        const boxBody1 = new Body({
            mass: 0, // Объект динамический, на него действует гравитация
            position: new Vec3(0, 1, 0), // Поднимаем на высоту 5 метров
            // В Cannon размеры коробки задаются как "полу-расширения" (половина стороны)
            shape: new Box(new Vec3(0.5, 0.5, 0.5)) 
        });
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