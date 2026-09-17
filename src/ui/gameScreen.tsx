import { useEffect, useRef, useState } from 'react';
import style from './gameScreen.module.css'

interface IGameScreenProps {

}

export const GameScreen = ({}: IGameScreenProps) => {
    const [inventory, setInventory] = useState<Array<string>>(new Array(5).fill(null)); 
    return <div className={style.screen}>
        <div className={style.top}>
            Find 3 crystals
        </div>
        <div className={style.bottom}>
            <div className={style.inventory}>
                {
                    inventory.map(item=>{
                        return <div className={style.inventoryItem}></div>
                    })
                }
            </div>
        </div>
    </div>
}