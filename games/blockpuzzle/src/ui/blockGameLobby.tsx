import { useEffect, useRef, useState } from "react";
import style from "./blockGameLobby.module.css";
import { getFieldHash, getTargetHash, interateResursive, type IField } from "./blockGameTools";
import { BlockGame } from "./blockGame";
import { levels } from "./blockGameLevels";

export const BlockGameLobby = () => {
    const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(null);
    return <div className={style.blockGameLobby}>
        <div></div>
        {
            selectedLevelIndex == null && <div className={style.levelList}>
                {
                    levels.map((level, i)=><div className={style.levelButton} onClick={()=>setSelectedLevelIndex(i)}>
                        {i+1}
                    </div>)
                }
            </div>
        }
        <div></div>
        {selectedLevelIndex != null && <BlockGame level={levels[selectedLevelIndex]} onExit={()=>{
            setSelectedLevelIndex(null);
        }}></BlockGame>}
    </div>
}