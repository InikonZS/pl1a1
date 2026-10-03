import { useEffect, useRef, useState } from 'react';
import style from './mobileStick.module.css'

export const MobileStick = ({onActualKey}: {onActualKey: (key: string)=>void}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [actualKey, setActualKey] = useState<string>('idle');
    const [moveStart, setMoveStart] = useState<{
        clientPosition: { x: number, y: number },
        pointerId: number,
    }>(null);
    
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        if (!moveStart) {
            return;
        }
        const keyHolder: string[] = [];
        const pushHolder = (key: string) => {
            const index = keyHolder.findIndex(it => it == key);
            if (index == -1) {
                keyHolder.push(key);
                setActualKey(keyHolder[keyHolder.length-1] || 'idle');
            } 
        }
        const spliceHolder = (key: string) => {
            const index = keyHolder.findIndex(it => it == key);
            if (index != -1) {
                keyHolder.splice(index, 1);
                setActualKey(keyHolder[keyHolder.length-1] || 'idle');
            }
        }

        const bounds = containerRef.current.getBoundingClientRect();
        const containerCenter = {x: bounds.left + bounds.width/2, y: bounds.top + bounds.height/2}

        const getSegment = (cursorPos: {x: number, y: number})=>{
            const relativePos = { x: (cursorPos.x - containerCenter.x)/bounds.width*2, y: (cursorPos.y - containerCenter.y)/bounds.height*2 };
            const centerRadius = 0.2;
            if (Math.hypot(relativePos.x, relativePos.y)<centerRadius){
                return null;
            }
            const segmentAngle = Math.atan2(relativePos.x, relativePos.y);
            const segmentCount = 4;
            const segmentIndex = Math.floor(((segmentAngle + Math.PI + Math.PI / segmentCount) % (Math.PI * 2)) / (Math.PI * 2) * segmentCount)
            return segmentIndex;
        }

        const startSegment = getSegment(moveStart.clientPosition);
        //console.log('start segment', startSegment);
        const segmentMap = ['up', 'left', 'down', 'right'];
        //pushHolder(segmentMap[startSegment]);
        setActualKey(segmentMap[startSegment] || 'idle');
        //onKey(segmentMap[startSegment]);

        const moveHandler = (e: PointerEvent) => {
            //console.log('move')
            if (e.pointerId != moveStart.pointerId) {
                return;
            }
            const segment = getSegment({x: e.clientX, y: e.clientY})
            //console.log('move', segment, keyHolder);
            setActualKey((last)=>segmentMap[segment] || last);
            //pushHolder(segmentMap[segment]);
        }

        const upHandler = (e: PointerEvent) => {
            //console.log('up')
            if (e.pointerId != moveStart.pointerId) {
                return;
            }
            const segment = getSegment({x: e.clientX, y: e.clientY})
            //console.log('up', segment);
            setMoveStart(null);
            setActualKey('idle');
            //spliceHolder(segmentMap[segment]);
        }

        window.addEventListener('pointermove', moveHandler);
        window.addEventListener('pointerup', upHandler);
        window.addEventListener('pointercancel', upHandler);

        return () => {
            //console.log('remove')
            window.removeEventListener('pointermove', moveHandler);
            window.removeEventListener('pointerup', upHandler);
            window.removeEventListener('pointercancel', upHandler);
        }
    }, [moveStart]);

    useEffect(()=>{
        onActualKey(actualKey);
    }, [actualKey])

    return <div ref={containerRef} className={style.mobileJoystick} onContextMenu={(e)=>e.preventDefault()} onPointerDown={(e) => {
        setMoveStart({
            clientPosition: { x: e.clientX, y: e.clientY },
            pointerId: e.pointerId
        })
    }}>
        <div className={style.mobileButton}>up</div>
        <div className={style.mobileJoystickCenter}>
            <div className={style.mobileButton}>left</div>
            <div className={style.mobileButton}>alt</div>
            <div className={style.mobileButton}>right</div>
        </div>
        <div className={style.mobileButton}>down</div>
    </div>
}