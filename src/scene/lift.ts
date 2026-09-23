import { Body, Box, Vec3, type World } from "cannon-es";
import { AmbientLight, AnimationMixer, Color, DirectionalLight, LoopOnce, LoopRepeat, Material, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3, type AnimationMixerEventMap, type Group, type Object3DEventMap, type Scene, type Vector3Like } from "three";
import { GLTFLoader, type GLTF } from "./threefix";
import type { GameRenderer } from "./gameRenderer";

class LiftInstance {
    collected: boolean;
    loadedModel: Group<Object3DEventMap>;
    animationMixer: AnimationMixer<AnimationMixerEventMap>;

    constructor(context: GameRenderer, gltf: GLTF, position: Vector3Like) {
        const {scene} = context;
        this.loadedModel = gltf.scene.clone();
        this.loadedModel.position.set(position.x, position.y, position.z);
        scene.add(this.loadedModel);
    }

    switch(on: boolean){
        this.loadedModel.position.y = on ? 0 : 1.2;
    }

    animate() {
        if (this.animationMixer) {
            this.animationMixer.update(0.015);
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