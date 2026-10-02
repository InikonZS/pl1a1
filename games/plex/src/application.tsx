import { type ReactElement, useEffect, useRef, useState } from 'react';
import style from './application.module.css'
import { levels } from './levels';
import { GameLogic } from './tilingLogic';
import { CanvasTest } from './canvasTest';
import { MobileStick } from './mobileStick';

const usePreloader = ()=>{
  const [resources, setResources] = useState<Record<string, HTMLImageElement>>(null);

  useEffect(()=>{
    const resMap: Record<string, HTMLImageElement> = {};
    const promises =
    [
      './supainf.png',
      './supapcb.png',
      './supawall.png',
      './supazonk.png',
      './supamicro.png',
      './supamicrostart.png',
      './supamicroend.png',
      './supaexit.png',
      './supadisc.png',
      './supahero.png',
      './expl1.png'
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
  const [actualKey, setActualKey] = useState('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const actualKeyRef = useRef('idle');
  const resources = usePreloader();
  const [collected, setCollected] = useState<{current: number, target: number}>({current: 0, target: 0});
  const [failed, setFailed] = useState(false);
  const [win, setWin] = useState(false);
  const [levelHash, setLevelHash] = useState(0);
  //const [level, setLevel] = useState<string[][]>(null);

  useEffect(() => {
    const keyHolder: string[] = [];

    const pushHolder = (key: string) => {
      const index = keyHolder.findIndex(it => it == key);
      if (index == -1) {
        keyHolder.push(key);
        setActualKey(keyHolder[keyHolder.length-1] || 'idle');
      } 
    }
    const keydownHandler = (e: KeyboardEvent) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) {
        pushHolder('up');
      }
      if (['KeyS', 'ArrowDown'].includes(e.code)) {
        pushHolder('down');
      }
      if (['KeyD', 'ArrowRight'].includes(e.code)) {
        pushHolder('right');
      }
      if (['KeyA', 'ArrowLeft'].includes(e.code)) {
        pushHolder('left');
      }
    };

    const spliceHolder = (key: string) => {
      const index = keyHolder.findIndex(it => it == key);
      if (index != -1) {
        keyHolder.splice(index, 1);
        setActualKey(keyHolder[keyHolder.length-1] || 'idle');
      }
    }
    const keyupHandler = (e: KeyboardEvent) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) {
        spliceHolder('up');
      }
      if (['KeyS', 'ArrowDown'].includes(e.code)) {
        spliceHolder('down');
      }
      if (['KeyD', 'ArrowRight'].includes(e.code)) {
        spliceHolder('right');
      }
      if (['KeyA', 'ArrowLeft'].includes(e.code)) {
        spliceHolder('left');
      }
    };

    const handleBlur = () => {
      keyHolder.splice(0);
      setActualKey('idle');
    };

    window.addEventListener('keydown', keydownHandler);
    window.addEventListener('keyup', keyupHandler);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', keydownHandler);
      window.removeEventListener('keyup', keyupHandler);
      window.removeEventListener('blur', handleBlur);
    }
  }, []);

  useEffect(()=>{
    actualKeyRef.current = actualKey;
  }, [actualKey]);

  /*useEffect(()=>{
    if (!canvasRef.current){
      return;
    }
    const logic = new GameLogic(levels[0]);
    const ctx = canvasRef.current.getContext('2d');
    const level = levels[0].map(it=>it.map(jt=>jt));
    const levelNext = levels[0].map(it=>it.map(jt=>jt));
    const levelAni = levels[0].map(it=>it.map(jt=>({x:0, y:0})));
    let playerPos = {x: 8, y: 1};
    let playerTargetPos = {x: playerPos.x, y: playerPos.y};
    let playerPushing = false;
    let playerDelay = 0;

    const tryMove = (x: number, y: number)=>{
        if (level[playerTargetPos.y+y][playerTargetPos.x+x]=='w' ){
          return;
        }
        if (['e'].includes(level[playerTargetPos.y+y][playerTargetPos.x+x])){
           playerPushing = false;
        }
        if (['b', 'i'].includes(level[playerTargetPos.y+y][playerTargetPos.x+x])){
           level[playerTargetPos.y+y][playerTargetPos.x+x] = 'e'; 
        levelNext[playerTargetPos.y+y][playerTargetPos.x+x] = 'e'; 
        playerPushing = false;
          return;
        }
        if (['z'].includes(level[playerTargetPos.y+y][playerTargetPos.x+x])){
          if (!playerPushing){
            playerPushing = true;
            playerDelay = 10;
            console.log('push')
            return;
          }
          console.log('pushing')
          let item = level[playerTargetPos.y+y][playerTargetPos.x+x];
          if (level[playerTargetPos.y+y][playerTargetPos.x+x+x] != 'e'){
            return;
          }
          //level[playerTargetPos.y+y][playerTargetPos.x+x] ='e';
          //level[playerTargetPos.y+y][playerTargetPos.x+x+x] ='z';
          levelNext[playerTargetPos.y+y][playerTargetPos.x+x] ='e';
          levelNext[playerTargetPos.y+y][playerTargetPos.x+x+x] =item;
          levelAni[playerTargetPos.y + y][playerTargetPos.x +x]={x:x, y:0}
        }
        playerPushing = false;
        playerTargetPos.x += x;
        playerTargetPos.y += y;
        playerDelay = 10;
    }

    let zonkDelay = 0;
    const zonkFall = ()=>{
      if (zonkDelay>0){
        zonkDelay--;
        return;
      }
      zonkDelay = 10;
      //console.log('sync')
       level.forEach((row,y)=>{
        row.forEach((cell,x)=>{
          if (['z', 'i'].includes(cell)){
          level[y][x]='e';
          level[y+levelAni[y][x].y][x+ levelAni[y][x].x]=cell;
          levelAni[y][x]={x:0, y:0}
          }
          
        })})
      levelNext.forEach((row,y)=>{
        row.forEach((cell,x)=>{
          if (['z', 'i'].includes(level[y][x]) && ['z', 'i'].includes(levelNext[y][x]) && level[y+1]?.[x]=='e' && levelNext[y+1]?.[x]=='e' && !(playerTargetPos.y == y+1 && playerTargetPos.x==x)){
            levelNext[y][x]='e';
            levelNext[y+1][x]=cell;
            levelAni[y][x]={x:0, y:1}
            return;
          }
          if (['z', 'i'].includes(level[y][x]) && ['z', 'i'].includes(level[y+1]?.[x]) && ['z', 'i'].includes(levelNext[y][x]) && ['z', 'i'].includes(levelNext[y+1]?.[x]) && level[y]?.[x+1]=='e' && level[y+1]?.[x+1]=='e' && levelNext[y]?.[x+1]=='e' && levelNext[y+1]?.[x+1]=='e' && !(playerTargetPos.y == y && playerTargetPos.x==x+1) && !(playerTargetPos.y == y+1 && playerTargetPos.x==x+1)){
            levelNext[y][x]='e';
            levelNext[y][x+1]=cell;
            levelAni[y][x]={x:1, y:0}
            return
          }
          if (['z', 'i'].includes(level[y][x]) && ['z', 'i'].includes(level[y+1]?.[x]) && ['z', 'i'].includes(levelNext[y][x]) && ['z', 'i'].includes(levelNext[y+1]?.[x]) && level[y]?.[x-1]=='e' && level[y+1]?.[x-1]=='e' && levelNext[y]?.[x-1]=='e' && levelNext[y+1]?.[x-1]=='e'  && !(playerTargetPos.y == y && playerTargetPos.x==x-1) && !(playerTargetPos.y == y+1 && playerTargetPos.x==x-1)){
            levelNext[y][x]='e';
            levelNext[y][x-1]=cell;
            levelAni[y][x]={x:-1, y:0}
            return
          }
        })
      })
    }
    const render = (time: number)=>{
      if (playerDelay>=0){
        playerDelay--;
      } else {
        if (actualKeyRef.current == 'idle'){
          playerPushing = false;
        }
        if (actualKeyRef.current == 'left'){
          tryMove(-1, 0);
        }
        if (actualKeyRef.current == 'right'){
           tryMove(1, 0);
        }
        if (actualKeyRef.current == 'down'){
           tryMove(0, 1);
        }
        if (actualKeyRef.current == 'up'){
           tryMove(0, -1);
        }
        
        // level[playerTargetPos.y][playerTargetPos.x] = 'e'; 
        // levelNext[playerTargetPos.y][playerTargetPos.x] = 'e'; 
      }
      if (Math.abs(playerPos.x-playerTargetPos.x)>0.1){
        playerPos.x += Math.sign(playerTargetPos.x - playerPos.x)/11;
      } else {
        playerPos.x = playerTargetPos.x;
      }
      if (Math.abs(playerPos.y-playerTargetPos.y)>0.1){
        playerPos.y += Math.sign(playerTargetPos.y - playerPos.y)/11;
      }else {
        playerPos.y = playerTargetPos.y;
      }

      zonkFall();
      const tileSize = 20;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      level.forEach((row,y)=>{
        row.forEach((cell,x)=>{
          ctx.fillStyle = {w: 'rgb(137, 137, 137)', p: '#0000', e: '#0000', b: '#090', z: '#ff0', i: '#25c'}[cell];
          const ani = levelAni[y][x];
          ctx.fillRect((x+ani.x*(10-zonkDelay)/11) * tileSize , (y+ani.y*(10-zonkDelay)/11) * tileSize, tileSize, tileSize);
          !['e'].includes(cell) && ctx.strokeRect((x+ani.x*(10-zonkDelay)/11) * tileSize, (y+ani.y*(10-zonkDelay)/11) * tileSize, tileSize, tileSize);
        })
      })
      ctx.fillStyle = '#f33';
      ctx.fillRect(playerPos.x * tileSize, playerPos.y * tileSize, tileSize, tileSize);
      //ctx.fillStyle = '#fff9';
      //ctx.fillRect(playerTargetPos.x * tileSize, playerTargetPos.y * tileSize, tileSize, tileSize);
      requestAnimationFrame((timestamp)=>{
        render(timestamp);
      })
    }
    render(Date.now());
  }, []);*/

  useEffect(()=>{
    if (!canvasRef.current || !resources){
      return;
    }
    setFailed(false);
    setWin(false);
    let win = false;
    const logic = new GameLogic(levels[0]);
    let cameraPos: {x: number, y: number} = null;
    const playerPos = {x: 0, y: 0};
    logic.onMainTick = () => {
      setCollected({current: logic.collected, target: logic.targetCount});
    }
    logic.onTransitionTick = (time) => {
      const tileSize = 32;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      let foundPlayer = false;
      logic.tilingLogic.tileMapNext.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (['p','ppr', 'ppl', 'pe', 'pw'].includes(cell)){
            if (cell == 'pw'){
              win = true;
            }
            playerPos.x = x - Math.floor((ctx.canvas.width / tileSize)/2), //Math.floor(logic.tilingLogic.tileMap[0].length /2);
            playerPos.y = y - Math.floor((ctx.canvas.height / tileSize)/2) //Math.floor(logic.tilingLogic.tileMap.length /1);
            if (cameraPos == null){
              cameraPos = {...playerPos};
            }
            foundPlayer = true;
          };
        })
      });
      if (!foundPlayer){
        //console.log('failed');
        if (win){
          setWin(true);
        } else {
          setFailed(true);
        }
      }
      //if (cameraPos.x !=playerPos.x || cameraPos.y != playerPos.y){
        //cameraPos.x += Math.sign(-cameraPos.x + playerPos.x)/10;
        //cameraPos.y += Math.sign(-cameraPos.y + playerPos.y)/10;
        cameraPos.x = cameraPos.x + (-cameraPos.x + playerPos.x)* time/2;
        cameraPos.y = cameraPos.y +(-cameraPos.y + playerPos.y)*time/2;
        if (Math.abs(cameraPos.x - playerPos.x)<0.1){
          cameraPos.x = playerPos.x;
        }
        if (Math.abs(cameraPos.y - playerPos.y)<0.1){
          cameraPos.y = playerPos.y;
        }
        const limitedCameraPos = {
          x: logic.tilingLogic.tileMap[0].length - (ctx.canvas.width / tileSize)<= 0 ? (logic.tilingLogic.tileMap[0].length /2 - (ctx.canvas.width / tileSize) / 2) :  Math.min(Math.max(cameraPos.x, 0), Math.floor(logic.tilingLogic.tileMap[0].length - (ctx.canvas.width / tileSize))),
          y: logic.tilingLogic.tileMap.length - (ctx.canvas.height / tileSize)<= 0 ? (logic.tilingLogic.tileMap.length /2 - (ctx.canvas.height / tileSize) / 2) : Math.min(Math.max(cameraPos.y, 0), Math.floor(logic.tilingLogic.tileMap.length - (ctx.canvas.height / tileSize))),
        }
      //}
      logic.tilingLogic.tileMap.forEach((row, y) => {

        row.forEach((cell, x) => {
          const ani = logic.tilingLogic.tileTransitions[y][x];
          const colors = { w: 'rgb(137, 137, 137)', p: '#f22', e: '#0000', b: '#090', z: '#ff0', i: '#25c' };
          const images = { p: './supahero.png', ppl: './supahero.png', ppr: './supahero.png', pe: './supahero.png', pw: './supahero.png' ,w: './supawall.png', b: './supapcb.png', z: './supazonk.png', i: './supainf.png', zd: './supazonk.png', id: './supainf.png', m: './supamicro.png', '[': './supamicrostart.png', ']': './supamicroend.png', x: './supaexit.png', d: './supadisc.png', da: './supadisc.png', o: './expl1.png'};
          ctx.fillStyle = colors[cell as keyof typeof colors];
          const image = resources[images[cell as keyof typeof images]];
          const drawTile = (x: number, y: number, w = 1, h = 1, sheetOffset = 0, sheetWidth = 0)=>{
            if (image){
              //0, 0, w *image.width, h * image.height,
                ctx.drawImage(image, 
                  w == 1 ? 0 : (x % 1) *image.width, 
                  h == 1 ? 0 : (y % 1) *image.height, 
                  w *image.width, 
                  h * image.height, 
                  Math.floor((x - limitedCameraPos.x) * tileSize), Math.floor((y - limitedCameraPos.y) * tileSize), w * tileSize, h * tileSize);
              } else {
                ctx.fillRect(x * tileSize, y * tileSize, w * tileSize, h * tileSize);
                if (cell != 'e') {
                  ctx.strokeRect(x * tileSize, y * tileSize, w * tileSize, h * tileSize);
                }
              }
            }
          const drawTileAtlas = (x: number, y: number, w = 1, h = 1, sheetOffset = 0, sheetWidth = 0)=>{
            if (image){
              //0, 0, w *image.width, h * image.height,
                ctx.drawImage(image, 
                  w == 1 ? sheetOffset : (x % 1) *image.width + sheetOffset,
                  h == 1 ? 0 : (y % 1) *image.height,
                  w * sheetWidth,
                  h * image.height, 
                  Math.floor((x - limitedCameraPos.x) * tileSize), Math.floor((y - limitedCameraPos.y) * tileSize), w * tileSize, h * tileSize);
              } else {
                ctx.fillRect(x * tileSize, y * tileSize, w * tileSize, h * tileSize);
                if (cell != 'e') {
                  ctx.strokeRect(x * tileSize, y * tileSize, w * tileSize, h * tileSize);
                }
              }
            }
          if (ani) {
            const timeCut = (time: number, frames: number)=>{
              return Math.floor(time * frames)
            }
            if (ani.type == 'move'){
              if (cell == 'p'){
                drawTileAtlas((x + ani.x * time), (y + ani.y * time), 1, 1, 2+(2+32)* (ani.x < 0 ?(time<0.66 ? time<0.33 ? 0 : 1 : 2) : (time<0.66 ? time<0.33 ? 5 : 4 : 3)), 32);
              } else if (cell == 'ppl'){
                drawTileAtlas((x + ani.x * time), (y + ani.y * time), 1, 1, 2+(2+32)*11, 32);
              } else if (cell == 'ppr'){
                drawTileAtlas((x + ani.x * time), (y + ani.y * time), 1, 1, 2+(2+32)*12, 32);
              }  else {
                drawTile((x + ani.x * time), (y + ani.y * time));
              }
              //ctx.fillRect((x + ani.x * time) * tileSize, (y + ani.y * time) * tileSize, tileSize, tileSize);
              //ctx.strokeRect((x + ani.x * time) * tileSize, (y + ani.y * time) * tileSize, tileSize, tileSize);
            }
            if (ani.type == 'eat'){
              const shrinkX = Math.abs(ani.x) * time;
              const shrinkY = Math.abs(ani.y) * time;
              const w = (1 - shrinkX);
              const h = (1 - shrinkY);
              const renderX = (x + Math.max(0, ani.x) * time);
              const renderY = (y + Math.max(0, ani.y) * time);
              //ctx.fillRect(renderX, renderY, w, h);
              //ctx.strokeRect(renderX, renderY, w, h);
              drawTile(renderX, renderY, w, h);
            }
            if (ani.type == 'idle'){
              if (cell == 'o'){
                drawTileAtlas(x, y, 1, 1, 2+(2+32)* timeCut(time, 7), 32);
              }
              if (cell == 'pw'){
                drawTileAtlas(x, y, 1, 1, 2+(2+32)* (timeCut(time, 7)+32), 32);
              }
            }
          } else {
            if (cell == 'p'){
              drawTileAtlas(x, y, 1, 1, 2+(2+32)*14, 32);
            } else if (cell == 'pe'){
              drawTileAtlas(x, y, 1, 1, 2+(2+32)*14, 32);
            } else if (cell == 'ppl'){
              drawTileAtlas(x, y, 1, 1, 2+(2+32)*11, 32);
            } else if (cell == 'ppr'){
              drawTileAtlas(x, y, 1, 1, 2+(2+32)*12, 32);
            } else if (cell == 'pw'){
              
            } else {
              drawTile(x, y);
            }
          }
        })
      });
    }

    const ctx = canvasRef.current.getContext('2d');

    let rafId: number = null;
    const render = (time: number)=>{
      logic.inputKey(actualKeyRef.current);
      logic.tilingLogic.transitionTick(time);
      
      rafId = requestAnimationFrame((timestamp)=>{
        render(timestamp);
      })
    }
    render(0);

    return ()=>{
      cancelAnimationFrame(rafId);
    }
  }, [resources, levelHash]);

  return <div ref={appRef} className={style.app} onDragStart={(e) => { e.preventDefault() }}>
    <div ref={overlayRef} className={style.overlay}>
      {/* <CanvasTest></CanvasTest> */}
      {!resources && <div className={style.loading}>loading...</div>}
      <div className={style.loading}>Collected {collected.current}/{collected.target}</div>
      {failed && <div className={style.loading} onClick={()=>{setLevelHash(last=>last+1)}}>Restart</div>}
      {win && <div className={style.loading} onClick={()=>{setLevelHash(last=>last+1)}}>Win restart</div>}
      {resources && <canvas ref={canvasRef} width={800} height={600} className={style.canvas}></canvas>}
      <MobileStick onActualKey={(key)=>{actualKeyRef.current = key}}></MobileStick>
    </div>
  </div>
}