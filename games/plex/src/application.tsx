import { type ReactElement, useEffect, useRef, useState } from 'react';
import style from './application.module.css'
import { levels } from './levels';
import { GameLogic } from './tilingLogic';

export const App = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [actualKey, setActualKey] = useState('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const actualKeyRef = useRef('idle');
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
    console.log(actualKey)
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
    if (!canvasRef.current){
      return;
    }
    const logic = new GameLogic(levels[0]);
    logic.onTransitionTick = (time) => {
      const tileSize = 20;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      logic.tilingLogic.tileMap.forEach((row, y) => {

        row.forEach((cell, x) => {
          const ani = logic.tilingLogic.tileTransitions[y][x];
          ctx.fillStyle = { w: 'rgb(137, 137, 137)', p: '#f22', e: '#0000', b: '#090', z: '#ff0', i: '#25c' }[cell];
          if (ani) {
            if (ani.type == 'move'){
              ctx.fillRect((x + ani.x * time) * tileSize, (y + ani.y * time) * tileSize, tileSize, tileSize);
              ctx.strokeRect((x + ani.x * time) * tileSize, (y + ani.y * time) * tileSize, tileSize, tileSize);
            }
            if (ani.type == 'eat'){
              const shrinkX = Math.abs(ani.x) * time;
              const shrinkY = Math.abs(ani.y) * time;
              const w = tileSize * (1 - shrinkX);
              const h = tileSize * (1 - shrinkY);
              const renderX = (x + Math.max(0, ani.x) * time) * tileSize;
              const renderY = (y + Math.max(0, ani.y) * time) * tileSize;
              ctx.fillRect(renderX, renderY, w, h);
              ctx.strokeRect(renderX, renderY, w, h);
            }
          } else {
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
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
  }, []);

  return <div ref={appRef} className={style.app} onDragStart={(e) => { e.preventDefault() }}>
    <div ref={overlayRef} className={style.overlay}>
    <canvas ref={canvasRef} width={800} height={600}></canvas>
    </div>
  </div>
}