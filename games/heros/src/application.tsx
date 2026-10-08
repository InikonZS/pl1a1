import { type ReactElement, useEffect, useRef, useState } from 'react';
import style from './application.module.css'
import { findPath, indexateMap } from './tools';

const usePreloader = ()=>{
  const [resources, setResources] = useState<Record<string, HTMLImageElement>>(null);

  useEffect(()=>{
    const resMap: Record<string, HTMLImageElement> = {};
    const promises =
    [
      'ground_grass.png',
      'ground_obst.png'
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
  const [fps, setFps] = useState(60);
  const hoverTile = useRef<{x: number, y: number}>(null);
  const tileSize = 12;

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
    const processMove = ()=>{
      if (!movingPath || !movingPath.length){
        return;
      }   
      moveTicks++;
      if (moveTicks<3){
        return;
      }
      moveTicks = 0;
      const pathPoint = movingPath[movingPath.length - 1 - movingIndex];
      if (pathPoint){
        activeHero.position.x = pathPoint.x;
        activeHero.position.y = pathPoint.y;
        checkNeutrals();
        movingIndex+=1;
      } else {
        movingPath = null;
        movingIndex = 0;
      }
    }

    let rafId: number = null;
    const render = (time: number)=>{
      const renderStartTime = performance.now();

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
          ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize);
      }));
      ctx.fill();

      ctx.fillStyle = pattern2;
      ctx.beginPath();
      tiles.forEach((row, y) => row.forEach((cell, x) => {
          if (cell != '2') {
              return;
          }
          ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize);
      }));
      ctx.fill();
      
      ctx.beginPath();
      heros.forEach(hero=>{
        ctx.rect(hero.position.x * tileSize, hero.position.y * tileSize, tileSize, tileSize);
      }); 
      ctx.fillStyle = '#ff0';
      ctx.fill();

      ctx.fillStyle = '#000';
      heros.forEach(hero=>{
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hero.value.toString(), hero.position.x * tileSize + tileSize/2, hero.position.y * tileSize + tileSize/2);
      }); 

      ctx.beginPath();
      neutrals.forEach(hero=>{
        ctx.rect(hero.position.x * tileSize, hero.position.y * tileSize, tileSize, tileSize);
      }); 
      ctx.fillStyle = '#f00';
      ctx.fill();

      ctx.fillStyle = '#000';
      neutrals.forEach(hero=>{
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hero.value.toString(), hero.position.x * tileSize + tileSize/2, hero.position.y * tileSize + tileSize/2);
      }); 

      if (hoverTile.current){
        ctx.fillStyle= `#99f9`;
        ctx.fillRect(hoverTile.current.x * tileSize, hoverTile.current.y * tileSize, tileSize, tileSize);
      }

      if (path){
        ctx.beginPath();
        ctx.fillStyle = '#0009';
        path.forEach(tile=>{
          ctx.rect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
        });
        ctx.fill();
      }
      
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
          const bounds = canvasRef.current.getBoundingClientRect();
          const scaler = {x: canvasRef.current.width / bounds.width, y: canvasRef.current.height / bounds.height}
          const tilePos = {x: Math.floor((e.clientX - bounds.left) / tileSize * scaler.x), y: Math.floor((e.clientY - bounds.top) / tileSize * scaler.y)}
          //console.log(tilePos)
          hoverTile.current = tilePos;
        }}></canvas>
      </div>}
    </div>
  </div>
}