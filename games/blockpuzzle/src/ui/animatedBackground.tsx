import { type ReactElement, useEffect, useRef, useState } from 'react';
import style from './animatedBackground.module.css'
import { BlockGameLobby } from './blockGameLobby';

const points = new Array(30).fill(null).map(it=>({x: Math.random(), y: Math.random(), scale: Math.random()}));
export const AnimatedBackground = () => {
    const bgItems = ()=>points.map(point=>{
        return <div className={style.backgroundItemWrap} style={{scale: `${point.scale+1}`, bottom: `${point.y * 100}%`, left: `${point.x * 100}%`}}>
            <div className={style.backgroundItem} style={{animationDuration: `${(point.scale *8+5)}s`}}></div>
        </div>
    });
    return <div className={style.background}>
      <div className={style.backgroundDirect}>
            {bgItems()}
      </div>
      <div className={style.backgroundMirror}>
            {bgItems()}
      </div>
    </div>
}