import { Body, Box, Vec3, type World } from "cannon-es";
import { AmbientLight, DirectionalLight, type Group, type Scene, type Vector3Like } from "three";
import { GLTFLoader } from "./threefix";
import { Crystal } from "./crystal";
import { Switches } from "./switch";

export class MainScene {
    loadedModel: Group;
    crystal: Crystal;
    onCollect: (variant: 'red' | 'green' | 'blue')=>void;
    onActionShow: (type: string, position: Vector3Like, pointHandler: ()=>void)=>void;
    switches: Switches;

    constructor(scene: Scene, world: World) {
        const loader = new GLTFLoader();
        loader.load(
            './brickwall3.glb', // Путь к файлу из папки public
            (gltf) => {
                this.loadedModel = gltf.scene;
                this.loadedModel.castShadow = true;
                this.loadedModel.receiveShadow = true;
                this.loadedModel.traverse(it=>{it.castShadow = true; it.receiveShadow = true});
                /*const crystal = this.loadedModel.getObjectByName('Cube013').clone();
                console.log(crystal);
                crystal.position.set(0, 0.5, 0);
                const boxBody = new Body({
                    mass: 0,
                    position: new Vec3(0, 0.5, 0),
                    shape: new Box(new Vec3(0.25, 0.25, 0.25)),
                    isTrigger: true
                });
                boxBody.addEventListener('collide',(e: any)=>{
                    console.log(e);
                });
                world.addEventListener('endContact',(e: any)=>{
                    console.log(e);
                });
                world.addBody(boxBody);*/
                //scene.add(crystal);
                this.switches = new Switches(scene, world);
                this.switches.onActionShow = (type, position, pointHandler)=>this.onActionShow(type, position, pointHandler);
                this.switches.onSwitch = () => {};
                this.crystal = new Crystal(scene, world);
                this.crystal.onCollect = (variant) => this.onCollect(variant);
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
            this.crystal.animate();
            this.switches.animate();
            //this.loadedModel.rotation.y += 0.005; // Вращаем модель, когда она загрузилась
        }
    }
}