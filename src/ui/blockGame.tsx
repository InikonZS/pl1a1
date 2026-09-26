import { useEffect, useState } from "react";
import style from "./blockGame.module.css";
import { getFieldHash, getTargetHash, interateResursive } from "./blockGameTools";

interface IBlock {
    position: {x: number, y: number},
    place: {x: number, y: number},
    pattern: Array<Array<string>>,
    id: string;
}

const BlockPattern = ({pattern, className = '', onStartMove}: {pattern: Array<Array<string>>, className?: string , onStartMove?: (event: React.PointerEvent)=>void})=>{
    return <>
        {
            pattern.map((row, y)=>row.map((cell, x)=>(cell != '0') ? <div className={[style.blockPart, className].join(' ')} style={{left: `${x * 20}px`, top: `${y * 20}px`}} onPointerDown={(e)=>{
                onStartMove?.(e);
            }}>
                </div> : undefined
            ))
        }
    </>
}

export const BlockGame = ()=>{
    const [moveStart, setMoveStart] = useState<{
        clientPosition: {x: number, y: number},
        pointerId: number,
        block: IBlock
    }>(null);
    /*const field = new Array(5).fill(null).map(it=>new Array(5).fill('1'));
    const [blocks, setBlocks] = useState<IBlock[]>([
        {
            position: { x: 0, y: 0 },
            place: { x: 0, y: 1 },//{ x: 1, y: 2 }, //  place: { x: 2, y: 2 },
            pattern: [
                '111',
            ].map(it=>it.split('')),
            id: '1'
        },
        {
            position: { x: 0, y: 1 },
            place: {x: 0, y:2},//{ x: 2, y: 3 },
            pattern: [
                '11',
                '01'
            ].map(it=>it.split('')),
            id: '2'
        },
        {
            position: { x: 0, y: 3 },
            place: {x: 3, y: 2},//{ x: 0, y: 0 },
            pattern: [
                '1',
                '1'
            ].map(it=>it.split('')),
            id: '3'
        }
    ]);*/
    const field = new Array(7).fill(null).map(it=>new Array(7).fill('1'));
    const [blocks, setBlocks] = useState<IBlock[]>([
        {
            position: { x: 0, y: 0 },
            place: {x: 3, y:1},//{ x: 1, y: 2 }, //  place: { x: 2, y: 2 },
            pattern: [
                '111',
            ].map(it=>it.split('')),
            id: '1'
        },
        {
            position: { x: 0, y: 1 },
            place: {x: 2, y:4},//{ x: 2, y: 3 },
            pattern: [
                '11',
                '01'
            ].map(it=>it.split('')),
            id: '2'
        },
        {
            position: { x: 0, y: 3 },
            place: {x: 5, y: 4},//{ x: 0, y: 0 },
            pattern: [
                '1',
                '1'
            ].map(it=>it.split('')),
            id: '3'
        },
        {
            position: { x: 6, y: 3 },
            place: {x: 1, y: 0},//{ x: 1, y: 4 },
            pattern: [
                '1',
                '1',
                '1'
            ].map(it=>it.split('')),
            id: '4'
        }
    ]);

  /*  [
    {
        "position": {
            "x": 1,
            "y": 0
        },
        "place": {
            "x": 1,
            "y": 2
        },
        "pattern": [
            [
                "1",
                "1",
                "1"
            ]
        ],
        "id": "1"
    },
    {
        "position": {
            "x": 2,
            "y": 3
        },
        "place": {
            "x": 2,
            "y": 3
        },
        "pattern": [
            [
                "1",
                "1"
            ],
            [
                "0",
                "1"
            ]
        ],
        "id": "2"
    },
    {
        "position": {
            "x": 5,
            "y": 4
        },
        "place": {
            "x": 0,
            "y": 0
        },
        "pattern": [
            [
                "1"
            ],
            [
                "1"
            ]
        ],
        "id": "3"
    },
    {
        "position": {
            "x": 1,
            "y": 1
        },
        "place": {
            "x": 1,
            "y": 5
        },
        "pattern": [
            [
                "1",
                "1",
                "1",
                "1"
            ]
        ],
        "id": "4"
    }
]*/
    /*const field = new Array(7).fill(null).map(it=>new Array(7).fill('1'));
    const [blocks, setBlocks] = useState<IBlock[]>([
        {
            position: { x: 0, y: 0 },
            place: { x: 1, y: 0 },
            pattern: [
                '111',
            ].map(it=>it.split('')),
            id: '1'
        },
        {
            position: { x: 0, y: 1 },
            place: { x: 2, y: 3 },
            pattern: [
                '11',
                '01'
            ].map(it=>it.split('')),
            id: '2'
        },
        {
            position: { x: 0, y: 3 },
            place: { x: 5, y: 4 },
            pattern: [
                '1',
                '1'
            ].map(it=>it.split('')),
            id: '3'
        },
        {
            position: { x: 3, y: 3 },
            place: { x: 1, y: 1 },
            pattern: [
                '1111'
            ].map(it=>it.split('')),
            id: '4'
        }
    ]);*/
    //const [field, setField] = useState<Array<Array<string>>>([[]]);

    useEffect(()=>{
        if (!moveStart){
            return;
        }

        let moveResult: {x: number, y: number} = null;

        const moveHandler = (e: PointerEvent)=>{
            moveResult = null;
            if (e.pointerId != moveStart.pointerId){
                return;
            }
            const offset = {x: e.clientX - moveStart.clientPosition.x, y: e.clientY - moveStart.clientPosition.y};
            let moveDirection = {x: 0, y: 0};
            if (Math.hypot(offset.x, offset.y) > 5){
                const xmore = Math.abs(offset.x) > Math.abs(offset.y);
                if (xmore){
                    moveDirection.x = Math.sign(offset.x);
                } else {
                    moveDirection.y = Math.sign(offset.y);
                }
            }
            if (moveDirection.x == 0 && moveDirection.y == 0){
                return;
            }
            const sweepMap: string[][] = field.map(row=>row.map(it=> it=='1'? '0': '1'));
            blocks.forEach(block=>{
                if (block.id == moveStart.block.id){
                    return;
                }
                block.pattern.forEach((row, y)=>row.forEach((cell, x)=>{
                    if (cell == '1'){
                        sweepMap[y+block.position.y][x+block.position.x] = '1'
                    }
                }));
            });

            let found = 0;
            for(let i=1; i<100;i++){
                if (found){
                    break;
                }
                const currentBlock = moveStart.block;
                currentBlock.pattern.some((row, y)=>row.some((cell, x)=>{
                    if (cell == '0'){
                        return false;
                    }
                    const cellValue = sweepMap[y+currentBlock.position.y + moveDirection.y * i]?.[x+currentBlock.position.x+ moveDirection.x * i]
                    if (cellValue == '1' || cellValue == undefined){
                        found = i;
                        return true;
                    }
                    return false;
                }));
            }
            if (found == 0){
                return;
            }
            const offsetMultiplier = found - 1;
            moveResult = {x: moveDirection.x * offsetMultiplier, y: moveDirection.y * offsetMultiplier}
        }

        const upHandler = (e: PointerEvent)=>{
            if (!moveResult){
                return;
            }
            setBlocks((last)=>{
                const next=[...last];
                const selectedBlockIndex = next.findIndex(it=>it.id == moveStart.block.id);
                next[selectedBlockIndex] = {...moveStart.block, position: {x: moveStart.block.position.x + moveResult.x, y: moveStart.block.position.y + moveResult.y}}
                return next;
            });
            setMoveStart(null);
        }

        window.addEventListener('pointermove', moveHandler);
        window.addEventListener('pointerup', upHandler);
        window.addEventListener('pointercancel', upHandler);

        return ()=>{
            window.removeEventListener('pointermove', moveHandler);
            window.removeEventListener('pointerup', upHandler);
            window.removeEventListener('pointercancel', upHandler);
        }
    }, [moveStart]);

    return <div className={style.blockGame}>
        { <button onClick={()=>{interateResursive({blocks, field})}}>generate</button> }
        { <button onClick={()=>{interateResursive({blocks, field}, getTargetHash({blocks, field}))}}>hint</button> }
        <div className={style.blockGame}>
        <div className={style.blockBg}>
            <BlockPattern pattern={field}></BlockPattern>
        </div>
        <div className={style.blocks}>
            {
                blocks.map(block=>{
                    return <div className={style.blockContainer} style={{'--blockColor': {1:'rgb(208, 62, 62)', 2: 'rgb(232, 232, 50)', 3: '#2a2', 4: '#27a'}[block.id], opacity: 0.25, pointerEvents: 'none', left: `${block.place.x * 20}px`, top: `${block.place.y * 20}px`} as any}>
                        <BlockPattern pattern={block.pattern}></BlockPattern>
                    </div>
                })
            }
            {
                blocks.map(block=>{
                    return <div className={style.blockContainer} style={{'--blockColor': {1:'rgb(208, 62, 62)', 2: 'rgb(232, 232, 50)', 3: '#2a2', 4: '#27a'}[block.id], left: `${block.position.x * 20}px`, top: `${block.position.y * 20}px`} as any}>
                        <BlockPattern pattern={block.pattern} onStartMove={(e)=>{
                            setMoveStart({
                                clientPosition: {x: e.clientX, y:e.clientY},
                                pointerId: e.pointerId,
                                block: block
                            });
                        }}></BlockPattern>
                    </div>
                })
            }
            {
                blocks.map(block=>{
                    const blockIntersection = block.pattern.map((row, y)=>row.map((cell, x)=>{
                        const targetCell = block.pattern[y + block.place.y - block.position.y]?.[x + block.place.x - block.position.x];
                        return (targetCell == '1' && cell == '1') ? '1': '0';
                    }));
                    return <div className={style.blockContainer} style={{'--blockColor': {1:'rgb(254, 80, 80)', 2: 'rgb(255, 255, 89)', 3: 'rgb(63, 234, 63)', 4: 'rgb(46, 160, 231)'}[block.id], pointerEvents: 'none', left: `${block.place.x * 20}px`, top: `${block.place.y * 20}px`} as any}>
                        <BlockPattern pattern={blockIntersection} className={style.blockOver}></BlockPattern>
                    </div>
                })
            }
        </div>
    </div>
    </div>
}