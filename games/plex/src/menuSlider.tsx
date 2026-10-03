import { useEffect, useRef, useState } from 'react';
import style from './menuSlider.module.css'
import { useSize } from './useSize';

const bs = (size: number)=>{
    return `calc(var(--base) * ${size})`;
}
const LineConnection = ({from, to}:{from: {x: number, y: number}, to: {x: number, y: number}})=>{
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return <div style={{
        position: 'absolute',
        left: bs(from.x),
        top: bs(from.y),
        width: bs(length),
        height: '0px',
        borderTop: bs(2) + ' solid red',
        transformOrigin: '0 0',
        transform: `rotate(${angle}deg)`,
        pointerEvents: 'none'
    }}></div>
}

export const MenuSlider = ({onSelect}: {onSelect: (level:string)=>void}) => {
    const [fix, setFix] = useState(0);
    const sizerRef = useRef<HTMLDivElement>(null);
    const size = useSize(sizerRef.current);
    console.log(sizerRef.current);
    useEffect(()=>{
        if (sizerRef.current){
            setFix(1);
        }
    }, []);
    const graph: Record<string, {position: {x: number, y: number}, description: string, relations: string[]}> = {
        '0': {
            position: {x:0, y: -220},
            relations: ['1'],
            description: 'Welcome'
        },
        '1': {
            position: {x:0, y: -100},
            relations: ['2', '3', '4', '5'],
            description: 'First steps'
        },
        '2': {
            position: {x:50, y: -20},
            relations: [],
            description: 'Challenging?'
        },
        '3': {
            position: {x:70, y: -150},
            relations: [],
            description: 'Look out'
        },
        '4': {
            position: {x:-60, y: -130},
            relations: [],
            description: 'Still alive?'
        },

        '5': {
            position: {x:0, y: 130},
            relations: ['6', '7', '8'],
            description: 'Growing up'
        },
        '6': {
            position: {x:80, y: 150},
            relations: [],
            description: 'Collect them all'
        },
        '7': {
            position: {x:-70, y: 120},
            relations: [],
            description: 'Amazing'
        },
        '8': {
            position: {x:-60, y: 190},
            relations: [],
            description: 'Season end'
        },
    }

    return <div ref={sizerRef} className={style.menuWrapper}>
        {fix == 1 && <div className={style.menuSizer}>
            <div className={style.logo}>
                MINIPLEX
            </div>
            <div className={style.menuSlider}>
                <div className={style.menuSliderAnchor}>
                    {Object.keys(graph).map(itemKey=>{
                        return <div className={style.menuItemAbs}>
                                { 
                                    graph[itemKey].relations.map(connection=>{
                                        return <LineConnection from={graph[itemKey].position} to={graph[connection].position}></LineConnection>
                                    })
                                }
                                <div className={style.menuItemInner} style={{
                                    left: bs(graph[itemKey].position.x),
                                    top: bs(graph[itemKey].position.y)
                                }} onClick={()=>{
                                    onSelect(itemKey);
                                }}>
                                    <div>{itemKey}</div>
                                    <div className={style.menuItemDescription}>{graph[itemKey].description}</div>
                                </div>
                        </div>
                    })}
                </div>
            </div>
        </div>}
    </div>
}

export const MenuSlider1 = ({}: {}) => {
    return <div className={style.menuWrapper}>
        <div className={style.menuSlider}>
            <div className={style.menuLine}>
                <div className={style.menuItem}>
                1.1
                </div>
                <div className={style.menuConnectionH}></div>
                <div className={style.menuItem}>
                1
                </div>
                <div className={style.menuConnectionH}></div>
                <div className={style.menuItem}>
                1.2
                </div>
            </div>
            <div className={style.menuConnection}></div>
            <div className={style.menuLine}>
                <div className={style.menuItem}>
                2.1
                </div>
                <div className={style.menuConnectionH}></div>
                <div className={style.menuItem}>
                2
                </div>
                <div className={style.menuConnectionH}></div>
                <div className={style.menuItem}>
                2.2
                </div>
            </div>
            <div className={style.menuConnection}></div>
            <div className={style.menuLine}>
                <div className={style.menuItem}>
                3.1
                </div>
                <div className={style.menuConnectionH}></div>
                <div className={style.menuItem}>
                3
                </div>
                <div className={style.menuConnectionH}></div>
                <div className={style.menuItem}>
                3.2
                </div>
            </div>
        </div>
    </div>
}