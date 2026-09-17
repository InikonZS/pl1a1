import { useEffect, useRef, useState } from 'react';
import style from './gameScreen.module.css'
import { CrystalOverlay } from './crystal';

interface IGameScreenProps {
    inventory: Array<string>
}

export const GameScreen = ({inventory}: IGameScreenProps) => {
    return <div className={style.screen}>
        <div className={style.top}>
            Find 3 crystals
        </div>
        <div className={style.bottom}>
            <div className={style.inventory}>
                {
                    inventory.map(item=>{
                        return <div className={style.inventoryItem}>
                            {item &&<CrystalOverlay variant={item as 'red' | 'green' | 'blue'}></CrystalOverlay>}
                        </div>
                    })
                }
            </div>
        </div>
    </div>
}