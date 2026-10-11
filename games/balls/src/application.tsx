import { type ReactElement, useEffect, useRef, useState } from 'react';
import style from './application.module.css'
import { getIntersection, getNormalFromPoints, reflectVector } from './tools';

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

function getCanvasRenderedRect(canvas: HTMLCanvasElement) {
  // 1. Получаем CSS-размеры всего элемента canvas
  const cssRect = canvas.getBoundingClientRect();
  
  // 2. Истинные размеры буфера отрисовки
  const bufferWidth = canvas.width;
  const bufferHeight = canvas.height;
  
  if (!bufferWidth || !bufferHeight) return cssRect;

  // 3. Сравниваем соотношения сторон CSS-блока и буфера
  const cssAspect = cssRect.width / cssRect.height;
  const bufferAspect = bufferWidth / bufferHeight;

  let renderWidth = cssRect.width;
  let renderHeight = cssRect.height;
  let xOffset = 0;
  let yOffset = 0;

  if (bufferAspect > cssAspect) {
    // Ограничение по ширине (поля сверху и снизу)
    renderHeight = cssRect.width / bufferAspect;
    yOffset = (cssRect.height - renderHeight) / 2;
  } else {
    // Ограничение по высоте (поля слева и справа)
    renderWidth = cssRect.height * bufferAspect;
    xOffset = (cssRect.width - renderWidth) / 2;
  }

  return {
    left: cssRect.left + xOffset,
    top: cssRect.top + yOffset,
    width: renderWidth,
    height: renderHeight,
    // Смещение внутри прямоугольника getBoundingClientRect
    xOffset: xOffset,
    yOffset: yOffset
  };
}

export const App = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resources = usePreloader();
  const [fps, setFps] = useState(60);

  useEffect(()=>{
    if (!canvasRef.current || !resources){
      return;
    }

    const mapLines = [
      {x: 10, y: 25},
      {x: 500, y: 12},
      {x: 510, y: 400},
      {x: 400, y: 200},
      {x: 200, y: 320},
      {x: 20, y: 340},
    ]

    const heroPivot = {x: 200, y: 200};
    const heroTarget = {x: 100, y: 120};
    const bullet = {x: 200, y: 200};
    const bulletSpeed = {x: 4, y: 4.2}

    const ctx = canvasRef.current.getContext('2d');

    let rafId: number = null;
    const render = (time: number)=>{
      const renderStartTime = performance.now();

      ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

      ctx.fillStyle = '#f00';
      ctx.fillRect(heroPivot.x - 5, heroPivot.y - 5, 10, 10);
      ctx.fillStyle = '#ff0';
      ctx.fillRect(heroTarget.x - 3, heroTarget.y - 3, 6, 6);
      ctx.fillStyle = '#0ff';
      ctx.fillRect(bullet.x - 3, bullet.y - 3, 6, 6);

      const nextBulletPos = {
        x: bullet.x + bulletSpeed.x,
        y: bullet.y + bulletSpeed.y,
      }

      const lastPoint = mapLines[mapLines.length-1];

     
      const processIntersect = ()=>{
        let intesected = false;
        for (let i = 0; i< mapLines.length; i++){
          const point = mapLines[i];
          const prevPoint = mapLines[i-1] || lastPoint;
          const intersection = getIntersection(prevPoint, point, bullet, nextBulletPos);
          if (intersection){
            const reflectedSpeed = reflectVector(bulletSpeed, getNormalFromPoints(prevPoint, point));
            const distToIntersection = Math.hypot(bullet.x - intersection.x, bullet.y - intersection.y);
            const speedDist = Math.hypot(bulletSpeed.x, bulletSpeed.y);
            const reflectPercent = distToIntersection / speedDist;
            bullet.x = intersection.x;
            bullet.y = intersection.y;
            bulletSpeed.x = reflectedSpeed.x;
            bulletSpeed.y = reflectedSpeed.y;
            //processIntersect({x: reflectedLocalSpeed.x * reflectPercent, y: reflectedLocalSpeed.y * reflectPercent})
            bullet.x += bulletSpeed.x * 0.0001//* reflectPercent* 0.01;
            bullet.y += bulletSpeed.y * 0.0001//* reflectPercent*0.01;
            intesected = true;
            break;
          }
        }
        if (!intesected){
            bullet.x += bulletSpeed.x;
            bullet.y += bulletSpeed.y;
        }
      }
    
      processIntersect();
 
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      mapLines.forEach(point=>{
        ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      const fps = 1000/(Math.max(performance.now() - renderStartTime, 0.01));
      setFps((last)=>{
        return (last * 32 + fps)/ (32+1);
      })
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
      <div className={style.loading}>{Math.floor(fps)}</div>
      {resources && <div className={style.canvasWrap}>
        <canvas ref={canvasRef} width={800} height={600} className={style.canvas} onPointerMove={(e)=>{
          const bounds = getCanvasRenderedRect(canvasRef.current);//canvasRef.current.getBoundingClientRect();
          const scaler = {x: canvasRef.current.width / bounds.width, y: canvasRef.current.height / bounds.height}
        }}></canvas>
      </div>}
    </div>
  </div>
}