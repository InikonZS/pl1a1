import { useEffect, useRef, useState } from 'react';
import style from './application.module.css'
import { GameRenderer } from '../scene/gameRenderer';
import { ScreenStick } from './screenStick';

export const App = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneRenderer, setSceneRenderer] = useState<GameRenderer>(null);

  useEffect(()=>{
    if (!canvasRef.current){
      return;
    }
    const gameRenderer = new GameRenderer(canvasRef.current);
    setSceneRenderer(gameRenderer);
    return ()=>{
      gameRenderer.destroy();
    }
  }, []);

  return <div ref={appRef} className={style.app}>
      <canvas ref={canvasRef} width={1280} height={760} className={style.canvas}></canvas>
      <div ref={overlayRef} className={style.overlay}>
        <ScreenStick onInput={(data)=>{
          if (!sceneRenderer){
            return;
          }
          sceneRenderer.input(data);
        }}></ScreenStick>
      </div>
    </div>
}