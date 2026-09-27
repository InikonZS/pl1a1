import { useEffect, useRef, useState } from "react";
import style from "./blockGame.module.css";
import { applyHash, getFieldHash, getTargetHash, interateResursive, type IField } from "./blockGameTools";

interface IBlock {
    position: { x: number, y: number },
    place: { x: number, y: number },
    pattern: Array<Array<string>>,
    id: string;
}

const BlockPattern = ({ pattern, className = '', onStartMove }: { pattern: Array<Array<string>>, className?: string, onStartMove?: (event: React.PointerEvent) => void }) => {
    const getNeibhorStyle = (x: number, y: number) => {
        const moves = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
        ];
        const neibhorStyles: string[] = [];
        moves.forEach((move, i) => {
            if (pattern[y + move.y]?.[x + move.x] == '1') {
                neibhorStyles.push(style[`blockPart_${['r', 'l', 'b', 't'][i]}`]);
            }
        });
        return neibhorStyles.join(' ');
    }

    return <>
        {
            pattern.map((row, y) => row.map((cell, x) => (cell != '0') ? <div className={[style.blockPart, getNeibhorStyle(x, y), className].join(' ')}
                //style={{left: `${x * 20}px`, top: `${y * 20}px`}} 
                style={{ left: `calc(var(--blockWidth) * ${x})`, top: `calc(var(--blockHeight) * ${y})` }}
                onPointerDown={(e) => {
                    onStartMove?.(e);
                }}>
            </div> : undefined
            ))
        }
    </>
}

export const BlockGame = ({ level, onExit}: { level: IField, onExit: ()=>void }) => {
    const [moveStart, setMoveStart] = useState<{
        clientPosition: { x: number, y: number },
        pointerId: number,
        block: IBlock
    }>(null);

    const [field, setField] = useState<string[][]>(null);
    const [blocks, setBlocks] = useState<IBlock[]>(null);
    const [moveStack, setMoveStack] = useState<string[]>([]);
    const [containerAnimated, setContainerAnimated] = useState<boolean>(true);

    useEffect(()=>{
        if (moveStart == null){
            const timerId = setTimeout(()=>{
                setContainerAnimated(true);
            }, 250);
            return ()=>{clearTimeout(timerId)}
        } else {
            setContainerAnimated(false);
        }
        
    }, [moveStart]),

    useEffect(() => {
        setField(level.field.map(row => row.map(cell => cell)));
        setBlocks(level.blocks.map(block => ({ ...block, position: { ...block.position } })));
    }, [level]);

    useEffect(() => {
        if (!moveStart) {
            return;
        }

        let moveResult: { x: number, y: number } = null;

        const moveHandler = (e: PointerEvent) => {
            moveResult = null;
            if (e.pointerId != moveStart.pointerId) {
                return;
            }
            const offset = { x: e.clientX - moveStart.clientPosition.x, y: e.clientY - moveStart.clientPosition.y };
            let moveDirection = { x: 0, y: 0 };
            if (Math.hypot(offset.x, offset.y) > 5) {
                const xmore = Math.abs(offset.x) > Math.abs(offset.y);
                if (xmore) {
                    moveDirection.x = Math.sign(offset.x);
                } else {
                    moveDirection.y = Math.sign(offset.y);
                }
            }
            if (moveDirection.x == 0 && moveDirection.y == 0) {
                return;
            }
            const sweepMap: string[][] = field.map(row => row.map(it => it == '1' ? '0' : '1'));
            blocks.forEach(block => {
                if (block.id == moveStart.block.id) {
                    return;
                }
                block.pattern.forEach((row, y) => row.forEach((cell, x) => {
                    if (cell == '1') {
                        sweepMap[y + block.position.y][x + block.position.x] = '1'
                    }
                }));
            });

            let found = 0;
            for (let i = 1; i < 100; i++) {
                if (found) {
                    break;
                }
                const currentBlock = moveStart.block;
                currentBlock.pattern.some((row, y) => row.some((cell, x) => {
                    if (cell == '0') {
                        return false;
                    }
                    const cellValue = sweepMap[y + currentBlock.position.y + moveDirection.y * i]?.[x + currentBlock.position.x + moveDirection.x * i]
                    if (cellValue == '1' || cellValue == undefined) {
                        found = i;
                        return true;
                    }
                    return false;
                }));
            }
            if (found == 0) {
                return;
            }
            const offsetMultiplier = found - 1;
            moveResult = { x: moveDirection.x * offsetMultiplier, y: moveDirection.y * offsetMultiplier }
        }

        const upHandler = (e: PointerEvent) => {
            if (!moveResult) {
                return;
            }
            setMoveStack(last=>[...last, getFieldHash({field, blocks})]);
            setBlocks((last) => {
                const next = [...last];
                const selectedBlockIndex = next.findIndex(it => it.id == moveStart.block.id);
                next[selectedBlockIndex] = { ...moveStart.block, position: { x: moveStart.block.position.x + moveResult.x, y: moveStart.block.position.y + moveResult.y } }
                return next;
            });
            setMoveStart(null);
        }

        window.addEventListener('pointermove', moveHandler);
        window.addEventListener('pointerup', upHandler);
        window.addEventListener('pointercancel', upHandler);

        return () => {
            window.removeEventListener('pointermove', moveHandler);
            window.removeEventListener('pointerup', upHandler);
            window.removeEventListener('pointercancel', upHandler);
        }
    }, [moveStart]);

    const fieldRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        console.log('eff')
        const resizeHandler = () => {
            if (!fieldRef.current) {
                return;
            }
            const bounds = fieldRef.current.getBoundingClientRect();
            //console.log((fieldRef.current.style.setProperty as any));
            fieldRef.current.style.setProperty('--blockWidth', Math.min(Math.min(bounds.width, bounds.height) / field[0].length, 50) + 'px');
            fieldRef.current.style.setProperty('--blockHeight', Math.min(Math.min(bounds.width, bounds.height) / field.length, 50) + 'px');
            //(fieldRef.current.style as any)['--blockHeight'] = bounds.height / field.length + 'px';
        }
        resizeHandler();
        window.addEventListener('resize', resizeHandler);
        return () => {
            window.removeEventListener('resize', resizeHandler);
        }
    }, [field]);

    const lastHash = moveStack[moveStack.length - 1];

    return <div className={style.blockGameScreen}>
        <div className={style.blockGameTop}>
            <div className={style.blockGameExit} onClick={()=>{onExit()}}>Menu</div>
            <div className={style.blockGameMoves}>Moves: {moveStack.length}</div>
            <div className={style.blockGameBack} onClick={()=>{
                if (!lastHash){
                    return;
                }
                setMoveStack(last=>last.slice(0, last.length-1))
                setBlocks(last=>{
                    return applyHash({field, blocks: last}, lastHash).blocks;
                })
            }}>Undo</div>
            {/* {<button onClick={() => { interateResursive({ blocks, field }) }}>generate</button>} 
            {<button onClick={() => { interateResursive({ blocks, field }, getTargetHash({ blocks, field })) }}>hint</button>}  */}
        </div>
        {(field && blocks ) && <div ref={fieldRef} className={style.blockGame} style={{ '--blockWidth': `${100 / field[0].length}px`, '--blockHeight': `${100 / field.length}px` } as any}>
            <div className={style.blockGameCenter} style={{ width: `calc(var(--blockWidth) * ${field[0].length})`, height: `calc(var(--blockHeight) * ${field.length})` } as any}>
                <div className={style.blockBg}>
                    <BlockPattern pattern={field} className={style.blockGrid}></BlockPattern>
                </div>
                <div className={style.blocks}>
                    {
                        blocks.map(block => {
                            return <div className={[style.blockContainer, style.blockContainer_notrans].join(' ')} style={{
                                '--blockColor': { 1: 'rgb(208, 62, 62)', 2: 'rgb(232, 232, 50)', 3: '#2a2', 4: '#27a' }[block.id], opacity: 0.25, pointerEvents: 'none',
                                //left: `${block.place.x * 20}px`, top: `${block.place.y * 20}px`} as any}>
                                left: `calc(var(--blockWidth) * ${block.place.x})`, top: `calc(var(--blockHeight) * ${block.place.y})`
                            } as any}>
                                <BlockPattern pattern={block.pattern}></BlockPattern>
                            </div>
                        })
                    }
                    {
                        blocks.map(block => {
                            return <div className={[style.blockContainer, containerAnimated && style.blockContainer_notrans].join(' ')} style={{
                                '--blockColor': { 1: 'rgb(208, 62, 62)', 2: 'rgb(232, 232, 50)', 3: '#2a2', 4: '#27a' }[block.id],
                                //left: `${block.position.x * 20}px`, top: `${block.position.y * 20}px`} as any}>
                                left: `calc(var(--blockWidth) * ${block.position.x})`, top: `calc(var(--blockHeight) * ${block.position.y})`
                            } as any}>
                                <BlockPattern pattern={block.pattern} onStartMove={(e) => {
                                    setMoveStart({
                                        clientPosition: { x: e.clientX, y: e.clientY },
                                        pointerId: e.pointerId,
                                        block: block
                                    });
                                }}></BlockPattern>
                            </div>
                        })
                    }
                    {
                        blocks.map(block => {
                            const blockIntersection = block.pattern.map((row, y) => row.map((cell, x) => {
                                const targetCell = block.pattern[y + block.place.y - block.position.y]?.[x + block.place.x - block.position.x];
                                return (targetCell == '1' && cell == '1') ? '1' : '0';
                            }));
                            return <div className={[style.blockContainer, style.blockContainer_notrans].join(' ')} style={{
                                '--blockColor': { 1: 'rgb(254, 80, 80)', 2: 'rgb(255, 255, 89)', 3: 'rgb(63, 234, 63)', 4: 'rgb(46, 160, 231)' }[block.id], pointerEvents: 'none',
                                //left: `${block.place.x * 20}px`, top: `${block.place.y * 20}px`} as any}>
                                left: `calc(var(--blockWidth) * ${block.place.x})`, top: `calc(var(--blockHeight) * ${block.place.y})`
                            } as any}>

                                <BlockPattern pattern={blockIntersection} className={style.blockOver}></BlockPattern>
                            </div>
                        })
                    }
                </div>
            </div>
           {blocks.every(it=>{return it.position.x == it.place.x && it.position.y == it.place.y}) && <div className={style.win}>Win</div>} 
        </div>
        }
    </div>
}