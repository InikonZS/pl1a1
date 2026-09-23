import { useEffect, useRef, useState } from 'react';
import style from './actionPoint.module.css'
import type { Vector3Like } from 'three';

interface IActionPointProps {
    point: Vector3Like;
    onClick: ()=>void;
}

export const ActionPoint = ({point, onClick}: IActionPointProps) => {
    return <>
    {point.z > 0 && <div className={style.pointContainer} style={{left: `${point.x}px`, top: `${point.y}px`}}> 
      <div className={style.pointImage}></div>
      <div className={style.hint}>ACTIVATE</div>
      <div className={style.clickable} onClick={onClick}></div>
    </div>}
    </>
}