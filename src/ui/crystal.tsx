import { useEffect, useRef, useState } from 'react';
import style from './crystal.module.css'

interface ICrystalProps {
    variant: 'red' | 'green' | 'blue';
}

export const CrystalOverlay = ({variant}: ICrystalProps) => {
    return <div className={[style.crystalContainer, 
        {
            'red': style.red,
            'green': style.green,
            'blue': style.blue,
        }[variant]].join(' ')}>
        <div className={style.glow}>

        </div>
        <div className={style.crystal}>

        </div>
    </div>
}