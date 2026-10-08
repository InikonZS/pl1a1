import { type ReactElement, useEffect, useRef, useState } from 'react';
import style from './application.module.css'

const usePreloader = ()=>{
  const [resources, setResources] = useState<Record<string, HTMLImageElement>>(null);

  useEffect(()=>{
    const resMap: Record<string, HTMLImageElement> = {};
    const promises =
    [
      
    ].map(name=>{
      const promise = new Promise<void>(resolve=>{
        const image = new Image();
        if (typeof name == 'string') {
          image.src =  name;
          image.onload = ()=>{
            resMap[name] = image;
            resolve();
          }
        } else {
          
        }
      });
      return promise;
    });
    Promise.all(promises).then(()=>{
      setResources(resMap);
    })
  },[]);

  return resources;
}

export const App = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resources = usePreloader();

  useEffect(()=>{
    if (!canvasRef.current || !resources){
      return;
    }

    const ctx = canvasRef.current.getContext('2d');

    let rafId: number = null;
    const render = (time: number)=>{
      rafId = requestAnimationFrame((timestamp)=>{
        render(timestamp);
      })
    }
    render(0);

    return ()=>{
      cancelAnimationFrame(rafId);
    }
  }, [resources]);

  return <div ref={appRef} className={style.app} onDragStart={(e) => { e.preventDefault() }}>
    <div ref={overlayRef} className={style.overlay}>
      {!resources && <div className={style.loading}>loading...</div>}
      {resources && <div className={style.canvasWrap}>
        <canvas ref={canvasRef} width={800} height={600} className={style.canvas}></canvas>
      </div>}
    </div>
  </div>
}