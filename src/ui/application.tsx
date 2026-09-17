import { useEffect, useRef, useState } from 'react';
import style from './application.module.css'
import { GameRenderer } from '../scene/gameRenderer';
import { ScreenStick } from './screenStick';
import { GameScreen } from './gameScreen';
import { PackshotScreen } from './packshot';

export const App = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneRenderer, setSceneRenderer] = useState<GameRenderer>(null);
  const [inventory, setInventory] = useState<Array<string>>(new Array(5).fill(null)); 

  useEffect(()=>{
    if (!canvasRef.current){
      return;
    }
    const gameRenderer = new GameRenderer(canvasRef.current);
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
    setSceneRenderer(gameRenderer);
    return ()=>{
      gameRenderer.destroy();
    }
  }, []);

  const isFinished = inventory.filter(it=>it != null).length >=3;

  return <div ref={appRef} className={style.app}>
      <canvas ref={canvasRef} width={1280} height={760} className={style.canvas}></canvas>
      <div ref={overlayRef} className={style.overlay}>
        <ScreenStick onInput={(data)=>{
          if (!sceneRenderer){
            return;
          }
          sceneRenderer.input(data);
        }}></ScreenStick>
        {!isFinished && <GameScreen inventory={inventory}></GameScreen>}
        {isFinished && <PackshotScreen></PackshotScreen>}
      </div>
    </div>
}