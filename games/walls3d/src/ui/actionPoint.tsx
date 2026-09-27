import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import style from './actionPoint.module.css'
import type { Vector3Like } from 'three';

interface IActionPointProps {
    point: Vector3Like;
    onClick: ()=>void;
    text: ReactNode;
}

export const ActionPoint = ({point, onClick, text = 'ACTIVATE'}: IActionPointProps) => {
    return <>
    {point.z > 0 && <div className={style.pointContainer} style={{left: `${point.x}px`, top: `${point.y}px`}}> 
      <div className={style.pointImage}></div>
      <div className={style.hint}>{text}</div>
      <div className={style.clickable} onClick={onClick}></div>
    </div>}
    </>
}