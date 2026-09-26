import { type ReactElement, useEffect, useRef, useState } from 'react';
import style from './application.module.css'
import { GameRenderer } from '../scene/gameRenderer';
import { ScreenStick } from './screenStick';
import { GameScreen } from './gameScreen';
import { PackshotScreen } from './packshot';
import { Vector3, type Vector3Like } from 'three';
import { ActionPoint } from './actionPoint';
import { BlockGame } from './blockGame';

export const App = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneRenderer, setSceneRenderer] = useState<GameRenderer>(null);
  const [inventory, setInventory] = useState<Array<string>>(new Array(5).fill(null));
  const [overlays, setOverlays] = useState<Record<string, ReactElement>>({});

  useEffect(()=>{
    if (!canvasRef.current){
      return;
    }
    const gameRenderer = new GameRenderer(canvasRef.current, setOverlays);
    gameRenderer.onCollect = (variant)=>{
      setInventory(last=>{
        const index = last.indexOf(null);
        const next = [...last];
        if (index !=-1) {
          next[index] = variant;
        } else {
          next.push(variant);
        }
        return next;
      });
    }

    let pointWorld: Vector3Like = null;
    /*gameRenderer.onActionShow = (type, position, pointHandler)=>{
      pointWorld = position;
      setPointHandler(()=>pointHandler);
      console.log(pointHandler)
    }*/

    gameRenderer.onAnimate = ()=>{
      //const point = pointWorld ? new Vector3(pointWorld.x, pointWorld.y, pointWorld.z).project(gameRenderer.camera) : null;
      //setPoint(!point ? null : new Vector3(point.x, -point.y, point.z).multiply(new Vector3(0.5, 0.5, 1)).add(new Vector3(0.5, 0.5, 0)).multiply(new Vector3(canvasRef.current.clientWidth, canvasRef.current.clientHeight, 1)));
      //const point = new Vector3(4, 0.5, 5).project(gameRenderer.camera);
      
      
      //setPoint(new Vector3(point.x, -point.y, point.z).multiply(new Vector3(0.5, 0.5, 1)).add(new Vector3(0.5, 0.5, 0)).multiply(new Vector3(canvasRef.current.clientWidth, canvasRef.current.clientHeight, 1)));
    }
    setSceneRenderer(gameRenderer);
    return ()=>{
      gameRenderer.destroy();
    }
  }, []);

  const isFinished = inventory.filter(it=>it != null).length >=3;

  return <div ref={appRef} className={style.app} onDragStart={(e)=>{e.preventDefault()}}>
      <canvas ref={canvasRef} width={1280} height={760} className={style.canvas}></canvas>
      <div ref={overlayRef} className={style.overlay}>
        <ScreenStick onInput={(data)=>{
          if (!sceneRenderer){
            return;
          }
          sceneRenderer.input(data);
        }}></ScreenStick>
        {Object.values(overlays)}
        {/* {point && pointHandler && <ActionPoint point={point} onClick={()=>pointHandler()}></ActionPoint>} */}
        {!isFinished && <GameScreen inventory={inventory} onPlayerChange={()=>sceneRenderer.setActivePlayer()}></GameScreen>}
        {isFinished && <PackshotScreen></PackshotScreen>}
        <BlockGame></BlockGame>
      </div>
    </div>
}