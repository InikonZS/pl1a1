import { type ReactElement, useEffect, useRef, useState } from 'react';
import style from './application.module.css'
import { BlockGameLobby } from './blockGameLobby';

export const App = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  return <div ref={appRef} className={style.app} onDragStart={(e)=>{e.preventDefault()}}>
      <div ref={overlayRef} className={style.overlay}>
        <BlockGameLobby></BlockGameLobby>
      </div>
    </div>
}