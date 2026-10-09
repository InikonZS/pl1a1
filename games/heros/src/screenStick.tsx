import { useEffect, useRef, useState } from 'react';
import style from './screenStick.module.css'

export interface IPointer{
    start: {x: number, y: number},
    end: {x: number, y: number},
    result: {x: number, y: number},
    id: number
}

interface IScreenStickProps {
    onInput: (data: IPointer)=>void
}

export const ScreenStick = ({onInput}: IScreenStickProps) => {
    const layerRef = useRef<HTMLDivElement>(null);
    const [pointer, setPointer] = useState<{
        start: {x: number, y: number},
        end: {x: number, y: number},
        result: {x: number, y: number},
        id: number
    }>(null);

    useEffect(()=>{
        if (!layerRef.current){
            return;
        }
        let pointerId: number = null;
        let pointerStart: {x: number, y: number} = null;
        let pointerEnd: {x: number, y: number} = null;
        
        const updatePointer = ()=>{
            setPointer(()=>{
                if (!pointerStart || !pointerEnd || pointerId == null){
                    return null;
                }
                const length = Math.hypot(pointerEnd.x - pointerStart.x, pointerEnd.y - pointerStart.y);
                const divisor = Math.max(length, 50);
                return {
                    start: pointerStart,
                    end: pointerEnd,
                    result: {
                        x: (pointerEnd.x - pointerStart.x) / divisor,
                        y: (pointerEnd.y - pointerStart.y) / divisor
                    },
                    id: pointerId
                }
            })
        }

        layerRef.current.onpointerdown = (e)=>{
            //console.log('down', e.pointerId);
            e.preventDefault();
            if (pointerId != null){
                return;
            }
            pointerId = e.pointerId;
            pointerStart = {x: e.clientX, y: e.clientY};
            pointerEnd = {x: e.clientX, y: e.clientY};

            updatePointer();
        }

        const handleMove = (e: PointerEvent)=>{
            e.preventDefault();
            //console.log('move', pointerId);
            if (pointerId == null || e.pointerId != pointerId){
                return;
            }
            pointerEnd = {x: e.clientX, y: e.clientY};

            updatePointer();
        }

        const handleUp = (e: PointerEvent)=>{
            //console.log('up', pointerId, e.pointerId);
            if (pointerId == null || e.pointerId != pointerId){
                return;
            }
            pointerId = null;
            pointerStart = null;
            pointerEnd = null;

            updatePointer();
        }

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointercancel', handleUp);

        return ()=>{
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
        }
    }, []);

    useEffect(()=>{
        onInput(pointer);
    }, [pointer]);

    return <div ref={layerRef} className={style.layer}>
        {
            pointer && <div className={style.area} style={{left: `${pointer.start.x}px`, top: `${pointer.start.y}px`}}>
                <div className={style.stick} style={{left: `${(pointer.result.x + 1) * 50}%`, top: `${(pointer.result.y + 1) * 50}%`}}>
                
                </div>
            </div>
        }
    </div>
}