import { useEffect, useRef, useState } from 'react';
import style from './actionPoint.module.css'
import type { Vector3Like } from 'three';

interface IActionPointProps {
    point: Vector3Like;
}

export const ActionPoint = ({point}: IActionPointProps) => {
    return <>
    {point.z > 0 && <div className={style.pointContainer} style={{left: `${point.x}px`, top: `${point.y}px`}}> 
      {point.z}
    </div>}
    </>
}