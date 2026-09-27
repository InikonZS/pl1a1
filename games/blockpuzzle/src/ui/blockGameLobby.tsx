import { useEffect, useRef, useState } from "react";
import style from "./blockGameLobby.module.css";
import { getFieldHash, getTargetHash, interateResursive, type IField } from "./blockGameTools";
import { BlockGame } from "./blockGame";
import { levels } from "./blockGameLevels";
import { AnimatedBackground } from "./animatedBackground";

export const BlockGameLobby = () => {
    const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(null);
    return <div className={style.blockGameLobbyScreen}>
        <AnimatedBackground ></AnimatedBackground>
        <div className={style.blockGameLobby}>
        
        {selectedLevelIndex == null && <div>
            <div className={style.blockGameLogo}>
                <div className={style.blockGameLogoSlip}>
                    SLIP
                </div>
                <div className={style.blockGameLogoArrow}>
                    <div className={style.blockGameLogoArrowEnd}>

                    </div>
                </div>
                <div className={style.blockGameLogoTiles}>
                    TILES
                </div>
            </div>
        </div>
        }
        {
            selectedLevelIndex == null && <div className={style.levelList}>
                <div className={style.levelListHead}>
                    SELECT LEVEL
                </div>
                <div className={style.levelListLevels}>
                {
                    levels.map((level, i)=><div className={style.levelButton} onClick={()=>setSelectedLevelIndex(i)}>
                        {i+1}
                    </div>)
                }
                </div>
            </div>
        }
        <div></div>
        {selectedLevelIndex != null && <BlockGame level={levels[selectedLevelIndex]} onExit={()=>{
            setSelectedLevelIndex(null);
        }} onNext={()=>{
            setSelectedLevelIndex((last)=>Math.min(last+1, levels.length-1));
        }}></BlockGame>}
    </div>
    </div>
}