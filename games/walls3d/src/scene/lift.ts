import { Body, Box, Vec3, type World } from "cannon-es";
import { AmbientLight, AnimationMixer, Color, DirectionalLight, LoopOnce, LoopRepeat, Material, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3, type AnimationMixerEventMap, type Group, type Object3DEventMap, type Scene, type Vector3Like } from "three";
import { GLTFLoader, type GLTF } from "./threefix";
import type { GameRenderer } from "./gameRenderer";
import { Easing, Tween } from "@tweenjs/tween.js";
/*
]e]]]]]
]111--]
]22---]
]-----e
]3----]
]3----]
]]]ee]]
*/
class LiftInstance {
    collected: boolean;
    loadedModel: Group<Object3DEventMap>;
    animationMixer: AnimationMixer<AnimationMixerEventMap>;
    tween: Tween<Vector3>;
    boxBody: Body;

    constructor(context: GameRenderer, gltf: GLTF, position: Vector3Like) {
        const {scene} = context;
        this.loadedModel = gltf.scene.clone();
        this.loadedModel.position.set(position.x, position.y, position.z);
        scene.add(this.loadedModel);

        this.boxBody = new Body({
            mass: 0,
            position: new Vec3(position.x, position.y+2.1, position.z),
            shape: new Box(new Vec3(0.5, 0.1, 0.5)) 
        });
        context.world.addBody(this.boxBody);
    }

    switch(on: boolean){
        const targetY = on ? 0 : 1.2
        this.tween?.stop();
        this.tween = new Tween(this.loadedModel.position).to({y: targetY}, 2000).easing(Easing.Linear.None).onUpdate((object)=>{
            this.boxBody.position.y = object.y+0.4;
        }).start(Date.now());
        //this.loadedModel.position.y = ;
    }

    animate() {
        if (this.animationMixer) {
            this.animationMixer.update(0.015);
        }
        if (this.tween){
            this.tween.update(Date.now(), false);
        }
    }
}

export class Lift {
    instances: LiftInstance[];
    loaded: boolean;

    constructor(context: GameRenderer) {
        const loader = new GLTFLoader();
        loader.load(
            './lift.glb',
            (gltf) => {
                console.log(gltf)
                this.loaded = true;
                this.instances = [
                    new LiftInstance(context, gltf, {x: 4, y: 1.2, z: 6.5})
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