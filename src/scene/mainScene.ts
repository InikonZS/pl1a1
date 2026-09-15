import type { World } from "cannon-es";
import { AmbientLight, DirectionalLight, type Group, type Scene } from "three";
import { GLTFLoader } from "three/addons";

export class MainScene {
    loadedModel: Group;

    constructor(scene: Scene, world: World) {
        const loader = new GLTFLoader();
        loader.load(
            './brickwall.glb', // Путь к файлу из папки public
            (gltf) => {
                this.loadedModel = gltf.scene;
                this.loadedModel.castShadow = true;
                this.loadedModel.receiveShadow = true;
                this.loadedModel.traverse(it=>{it.castShadow = true; it.receiveShadow = true});
                scene.add(this.loadedModel);
            },
            (progress) => {
                // Прогресс загрузки (байты)
                console.log(`Loading: ${(progress.loaded / progress.total) * 100}%`);
            },
            (error) => {
                console.error('Ошибка загрузки GLB:', error);
            }
        );

        const ambientLight = new AmbientLight(0xffffff, 1.5/100);
        scene.add(ambientLight);

        const dirLight = new DirectionalLight(0xffffff, 2.5/100);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);
    }

    animate(){
        if (this.loadedModel) {
            //this.loadedModel.rotation.y += 0.005; // Вращаем модель, когда она загрузилась
        }
    }
}