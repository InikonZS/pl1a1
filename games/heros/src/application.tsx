import { type ReactElement, useEffect, useRef, useState } from 'react';
import style from './application.module.css'
import { findPath, indexateMap } from './tools';
import { ScreenStick } from './screenStick';

const lerp = (a: number, b: number, t: number)=>{
  return a + (b - a) * t;
}

const usePreloader = ()=>{
  const [resources, setResources] = useState<Record<string, HTMLImageElement>>(null);

  useEffect(()=>{
    const resMap: Record<string, HTMLImageElement> = {};
    const promises =
    [
      'ground_grass.png',
      'ground_obst.png',
      'ground_tree.png'
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
  const hoverTile = useRef<{x: number, y: number}>(null);
  const camera = useRef<{x: number, y: number}>({x: 0, y: 0});
  const scrollData = useRef<{x: number, y: number}>(null);
  const tileSize = 32;

  useEffect(()=>{
    if (!canvasRef.current || !resources){
      return;
    }

    const heros = [
      {
        value: 1,
        position: {x: 10, y: 10}
      }
    ];

    const activeHero = heros[0];

    let neutrals = [
      {
        value: 1,
        position: {x: 20, y: 20}
      },
      {
        value: 2,
        position: {x: 20, y: 30}
      },
    ];

    let lastPath: {x: number, y: number}[] = null;
    let movingPath: {x: number, y: number}[] = null;
    let movingIndex = 0;

    canvasRef.current.onpointerdown = (e)=>{
      if (!hoverTile.current){
        return;
      }
      movingPath = lastPath;
      //activeHero.position.x = hoverTile.current.x;
      //activeHero.position.y = hoverTile.current.y;
    }
    const tiles = new Array(40).fill(null).map(it => new Array(60).fill(null).map(jt => Math.random() < 0.7 ? '1' : '2'));

    const ctx = canvasRef.current.getContext('2d');

    const pattern1 = ctx.createPattern(resources['ground_grass.png'], "repeat");
    pattern1.setTransform(new DOMMatrix().scale(tileSize / resources['ground_grass.png'].naturalWidth, tileSize / resources['ground_grass.png'].naturalHeight));
    const pattern2 = ctx.createPattern(resources['ground_obst.png'], "repeat");
    pattern2.setTransform(new DOMMatrix().scale(tileSize / resources['ground_obst.png'].naturalWidth, tileSize / resources['ground_obst.png'].naturalHeight));

    const pattern3 = ctx.createPattern(resources['ground_tree.png'], "repeat");
    pattern3.setTransform(new DOMMatrix().scale(tileSize / resources['ground_obst.png'].naturalWidth, tileSize / resources['ground_obst.png'].naturalHeight));
    const pattern3a = ctx.createPattern(resources['ground_tree.png'], "repeat");
    pattern3a.setTransform(new DOMMatrix().translate(0, -tileSize).scale(tileSize / resources['ground_obst.png'].naturalWidth, tileSize / resources['ground_obst.png'].naturalHeight));

    const checkNeutrals = ()=>{
      neutrals.forEach(neutral=>{
        if (activeHero.position.x == neutral.position.x && activeHero.position.y == neutral.position.y){
          //value check
          activeHero.value = activeHero.value + neutral.value;
          neutral.value = 0;
        }
      });
      neutrals = neutrals.filter(it=>it.value);
    }
    let moveTicks = 0;
    let initHeroPos: {x: number, y: number} = {...activeHero.position};
    const processMove = ()=>{
      if (!movingPath || !movingPath.length){
        return;
      }   
      moveTicks++;
      if (moveTicks<3){
        const lastPoint = movingPath[movingPath.length - 1 - movingIndex];
        //activeHero.position.x = lerp(initHeroPos.x, lastPoint.x, moveTicks/3);
        //activeHero.position.y = lerp(initHeroPos.y, lastPoint.y, moveTicks/3);
        return;
      }
      moveTicks = 0;
      initHeroPos = {...activeHero.position};
      const pathPoint = movingPath[movingPath.length - 1 - movingIndex];
      if (pathPoint){
        activeHero.position.x = pathPoint.x;
        activeHero.position.y = pathPoint.y;
        camera.current = {x: (-activeHero.position.x +10) * tileSize , y: (-activeHero.position.y +10) * tileSize}
        patternTransform();
        checkNeutrals();
        movingIndex+=1;
      } else {
        movingPath = null;
        movingIndex = 0;
      }
    }

    const processCamera = ()=>{
      if (!scrollData.current){
        return;
      }
      
      const sensitive = -16;
      camera.current = {x: camera.current.x + scrollData.current.x * sensitive, y: camera.current.y + scrollData.current.y * sensitive}
      patternTransform();
    }

    const patternTransform = ()=>{
      const patternFix = new DOMMatrix().translate(camera.current.x % tileSize, camera.current.y % tileSize).scale(tileSize / resources['ground_grass.png'].naturalWidth, tileSize / resources['ground_grass.png'].naturalHeight);
      const patternFixA = new DOMMatrix().translate(camera.current.x % tileSize, camera.current.y % (tileSize * 2) - tileSize).scale(tileSize / resources['ground_grass.png'].naturalWidth, tileSize / resources['ground_grass.png'].naturalHeight);
      const patternFix0 = new DOMMatrix().translate(camera.current.x % tileSize, camera.current.y % (tileSize * 2)).scale(tileSize / resources['ground_grass.png'].naturalWidth, tileSize / resources['ground_grass.png'].naturalHeight);
      

      pattern1.setTransform(patternFix);
      pattern2.setTransform(patternFix);
      pattern3.setTransform(patternFix0);
      pattern3a.setTransform(patternFixA);
    }

    const tiledX = (x: number) => {
      return Math.floor(x * tileSize + camera.current.x);
    }

    const tiledY = (y: number) => {
      return Math.floor(y * tileSize + camera.current.y);
    }

    let rafId: number = null;
    const render = (time: number)=>{
      const renderStartTime = performance.now();

      processCamera();
      processMove();
      const same = hoverTile.current && (hoverTile.current.x == activeHero.position.x && hoverTile.current.y == activeHero.position.y);
      const path = (hoverTile.current && !same) ? findPath(indexateMap(tiles, activeHero.position), hoverTile.current): [];
      lastPath = path;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = pattern1;
      ctx.beginPath();
      tiles.forEach((row, y) => row.forEach((cell, x) => {
          if (cell != '1') {
              return;
          }
          ctx.rect(tiledX(x), tiledY(y), tileSize, tileSize);
      }));
      ctx.fill();

      ctx.fillStyle = pattern1;
      ctx.beginPath();
      tiles.forEach((row, y) => row.forEach((cell, x) => {
          if (cell != '2') {
              return;
          }
          ctx.rect(tiledX(x), tiledY(y), tileSize, tileSize);
      }));
      ctx.fill();
      
      ctx.beginPath();
      heros.forEach(hero=>{
        ctx.rect(tiledX(hero.position.x), tiledY(hero.position.y), tileSize, tileSize);
      }); 
      ctx.fillStyle = '#ff0';
      ctx.fill();

      ctx.fillStyle = '#000';
      heros.forEach(hero=>{
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hero.value.toString(), tiledX(hero.position.x) + tileSize/2, tiledY(hero.position.y) + tileSize/2);
      }); 

      ctx.beginPath();
      neutrals.forEach(hero=>{
        ctx.rect(tiledX(hero.position.x), tiledY(hero.position.y), tileSize, tileSize);
      }); 
      ctx.fillStyle = '#f00';
      ctx.fill();

      ctx.fillStyle = '#000';
      neutrals.forEach(hero=>{
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hero.value.toString(), tiledX(hero.position.x) + tileSize/2, tiledY(hero.position.y) + tileSize/2);
      }); 

      if (hoverTile.current){
        ctx.fillStyle= `#99f9`;
        ctx.fillRect(tiledX(hoverTile.current.x), tiledY(hoverTile.current.y), tileSize, tileSize);
      }

      if (path){
        ctx.beginPath();
        ctx.fillStyle = '#0009';
        path.forEach(tile=>{
          ctx.moveTo(tiledX(tile.x), tiledY(tile.y));
          ctx.ellipse(tiledX(tile.x) + tileSize/2, tiledY(tile.y) + tileSize/2, tileSize/4, tileSize/4, 0, 0, Math.PI*2);
        });
        ctx.fill();
      }

      ctx.fillStyle = pattern3;
      ctx.beginPath();
      tiles.forEach((row, y) => row.forEach((cell, x) => {
          if (cell != '2' || y%2!=1) {
              return;
          }
          ctx.rect(tiledX(x), tiledY(y)- tileSize, tileSize, tileSize*2);
      }));
      ctx.fill();

      ctx.fillStyle = pattern3a;
      ctx.beginPath();
      tiles.forEach((row, y) => row.forEach((cell, x) => {
          if (cell != '2' || y%2!=0) {
              return;
          }
          ctx.rect(tiledX(x), tiledY(y)- tileSize, tileSize, tileSize*2);
      }));
      ctx.fill();
      
      const fps = 1000/(performance.now() - renderStartTime);
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
          const tilePos = {x: Math.floor((e.clientX - bounds.left - camera.current.x) / tileSize * scaler.x), y: Math.floor((e.clientY - bounds.top - camera.current.y) / tileSize * scaler.y)}
          //console.log(tilePos)
          hoverTile.current = tilePos;
        }}></canvas>
      </div>}
      <div className={style.controlPanel}>
        <div className={style.heroes}>
          {new Array(4).fill(null).map((it, i)=>{
            return <div className={style.hero}>{i}</div>
          })}
        </div>
        <div className={style.turnButton}>Turn</div>
        { <div className={style.minimap}>
          <ScreenStick onInput={(data)=>{
            scrollData.current = data?.result;
          }}></ScreenStick>
        </div> }
      </div>
    </div>
  </div>
}