export class TilingLogic{
    tileMap: string[][];
    tileMapNext: string[][];
    tileTransitions: ({x: number, y: number, type: string} | null)[][];
    lastTimeStamp: number = 0;
    mainTickTime = 16*8;
    transitionTimeCounter = 0;
    onTransitionTick: (transitionTime: number)=>void;
    onMainTick: ()=>void;

    constructor(tileMapTemplate: Array<Array<string>>){
        this.tileMap = tileMapTemplate.map(row=>row.map(cell=>cell));
        this.tileMapNext = tileMapTemplate.map(row=>row.map(cell=>cell));
        this.tileTransitions = tileMapTemplate.map(row=>row.map(cell=>(null as any)));
    }

    applyNextMap(){
        this.tileMapNext.forEach((row, y)=>{row.forEach((cell, x)=>{
            this.tileMap[y][x] = this.tileMapNext[y][x];
            this.tileTransitions[y][x] = null;
        })})
    }

    checkCell(tileTypes: string[], x: number, y: number){
        return tileTypes.includes(this.tileMap[y]?.[x]) && tileTypes.includes(this.tileMapNext[y]?.[x]) && (this.tileTransitions[y]?.[x] == null);
    }

    mainTick(){
        this.applyNextMap();
        this.onMainTick?.();
    }

    transitionTick(timestamp: number){
        const delta = timestamp - this.lastTimeStamp;
        this.transitionTimeCounter += Math.min(delta, 16*4);
        this.lastTimeStamp = timestamp;
        const transitionTime = Math.max(Math.min((this.transitionTimeCounter / this.mainTickTime), 1), 0);
        //console.log('rt', this.transitionTimeCounter, timestamp);
        this.onTransitionTick?.(transitionTime);
        if (this.transitionTimeCounter >= this.mainTickTime){
            this.transitionTimeCounter = 0;
            this.mainTick();
        }
    }
}

export class GameLogic{
    tilingLogic: TilingLogic;
    key: string;
    onTransitionTick: (transitionTime: number)=>void;
    onMainTick: ()=>void;
    appliedKey: string;
    collected: number = 0;
    failed: boolean;

    constructor(tileMapTemplate: Array<Array<string>>){
        this.tilingLogic =  new TilingLogic(tileMapTemplate);
        this.tilingLogic.onTransitionTick = this.handleTransitionTick;
        this.tilingLogic.onMainTick = this.handleMainTick;
    }

    inputKey(key: string){
        if(this.appliedKey =='idle' && key == 'idle' && this.key != 'idle'){
            return;
        }
        this.key = key;
    }

    handleTransitionTick = (transitionTime: number)=>{
        this.onTransitionTick?.(transitionTime);
    }

    handleMainTick = ()=>{
        //console.log('tick');
        this.appliedKey = this.key;
        const directions = {
            'left': {x: -1, y: 0},
            'right': {x: 1, y: 0},
            'up': {x: 0, y: -1},
            'down': {x: 0, y: 1},
        }
        this.tilingLogic.tileMap.forEach((row,y)=>{
            row.forEach((cell,x)=>{
                if (['o'].includes(cell)){
                    this.tilingLogic.tileTransitions[y][x] = {x: 0, y:0, type: 'idle'};
                    this.tilingLogic.tileMapNext[y][x] = 'e';
                }
                if (['ppl', 'ppr'].includes(cell) && this.key == 'idle'){
                    this.tilingLogic.tileMapNext[y][x] = 'p';
                }
                if (cell == 'p'){
                    const direction = directions[this.key as keyof typeof directions];
                    if (direction){ 
                        const isInfotron = this.tilingLogic.checkCell(['i'], x + direction.x, y+ direction.y);
                        if (isInfotron){
                            this.collected++;
                        }
                        const isEatable = this.tilingLogic.checkCell(['b', 'e', 'i'], x + direction.x, y+ direction.y);
                        if (isEatable){
                            this.tilingLogic.tileMapNext[y+direction.y][x+direction.x] = 'p';
                            this.tilingLogic.tileMapNext[y][x] = 'e';
                            this.tilingLogic.tileTransitions[y][x] = {x: direction.x, y: direction.y, type: 'move'};
                            this.tilingLogic.tileTransitions[y+direction.y][x+direction.x] = {x: direction.x, y: direction.y, type: 'eat'};
                        }
                    }
                }
                if (['d'].includes(cell)){
                    const down = directions['down'];
                    const canFall = this.tilingLogic.checkCell(['e'], x + down.x, y+ down.y);
                    if (canFall){
                        const direction = down;
                        this.tilingLogic.tileMapNext[y+direction.y][x+direction.x] = 'da';
                        this.tilingLogic.tileMapNext[y][x] = 'e';
                        this.tilingLogic.tileTransitions[y][x] = {x: direction.x, y: direction.y, type: 'move'};
                    }
                }
                if (['da'].includes(cell)){
                    const down = directions['down'];
                    const canFall = this.tilingLogic.checkCell(['e'], x + down.x, y+ down.y);
                    if (canFall){
                        const direction = down;
                        this.tilingLogic.tileMapNext[y+direction.y][x+direction.x] = cell;
                        this.tilingLogic.tileMapNext[y][x] = 'e';
                        this.tilingLogic.tileTransitions[y][x] = {x: direction.x, y: direction.y, type: 'move'};
                    } else {
                        for (let i = -1; i<=1; i++){
                            for (let j = -1; j<=1; j++){
                                if (!['w'].includes(this.tilingLogic.tileMap[y+i][x+j])){
                                    this.tilingLogic.tileMapNext[y+i][x+j] = 'o';
                                    //this.tilingLogic.tileTransitions[y+i][x+j] = {x: 0, y:0, type: 'idle'};
                                }
                            }
                        }
                    }
                }
                if (['z', 'zd', 'i', 'id'].includes(cell)){
                    const down = directions['down'];
                    const canFall = this.tilingLogic.checkCell(['e'], x + down.x, y+ down.y);
                    if (canFall){
                        const direction = down;
                        if (['z', 'i'].includes(cell)) {
                            this.tilingLogic.tileMapNext[y+direction.y][x+direction.x] = cell + 'd';
                        } else {
                            this.tilingLogic.tileMapNext[y+direction.y][x+direction.x] = cell;
                        }
                        this.tilingLogic.tileMapNext[y][x] = 'e';
                        this.tilingLogic.tileTransitions[y][x] = {x: direction.x, y: direction.y, type: 'move'};
                    } else {
                        if (['zd', 'id'].includes(cell)) {
                            this.tilingLogic.tileMapNext[y][x] = cell[0];
                            if (this.tilingLogic.checkCell(['p'], x + down.x, y+ down.y)){
                                //console.log('fail')
                                for (let i = -1; i<=1; i++){
                                    for (let j = -1; j<=1; j++){
                                        if (!['w'].includes(this.tilingLogic.tileMap[y+ down.y+i][x+ down.x+j])){
                                            this.tilingLogic.tileMapNext[y+ down.y+i][x+ down.x+j] = 'o';
                                            //this.tilingLogic.tileTransitions[y+ down.y+i][x+ down.x+j] = {x: 0, y:0, type: 'idle'};
                                        }
                                    }
                                }
                            }
                        }
                    }
                    const left = directions['left'];
                    const right = directions['right'];

                    const canLeftFall = this.tilingLogic.checkCell(['e'], x + left.x, y+ left.y) && this.tilingLogic.checkCell(['z', 'i', 'm', '[', ']'], x + down.x, y+ down.y) && this.tilingLogic.checkCell(['e'], x + down.x + left.x, y+ down.y + left.y);
                    const canRightFall = this.tilingLogic.checkCell(['e'], x + right.x, y+ right.y) && this.tilingLogic.checkCell(['z', 'i', 'm', '[', ']'], x + down.x, y+ down.y) && this.tilingLogic.checkCell(['e'], x + down.x + right.x, y+ down.y + right.y);
                    let side = null;
                    if (canLeftFall){
                        side = left;
                    } else if (canRightFall) {
                        side = right;
                    }
                    if (side){
                        const direction = side;
                        this.tilingLogic.tileMapNext[y+direction.y][x+direction.x] = cell;
                        this.tilingLogic.tileMapNext[y][x] = 'e';
                        this.tilingLogic.tileTransitions[y][x] = {x: direction.x, y: direction.y, type: 'move'};
                    }
                }
            })
        })
        this.tilingLogic.tileMap.forEach((row,y)=>{
            row.forEach((cell,x)=>{
                if (cell == 'p'){
                    const direction = directions[this.key as keyof typeof directions];
                    if (direction){ 
                        const isZonk = this.tilingLogic.checkCell(['z', 'd'], x + direction.x, y+ direction.y) &&
                        this.tilingLogic.checkCell(['e'], x + direction.x * 2, y+ direction.y * 2) && direction.y == 0 && this.tilingLogic.tileTransitions[y + direction.y][x + direction.x] == null;
                        if (isZonk){
                            //console.log('zonk push');
                            this.tilingLogic.tileMapNext[y][x] = direction.x < 0 ? 'ppl': 'ppr';
                        }
                    }
                }
                if (['ppl', 'ppr'].includes(cell)){
                    const direction = directions[this.key as keyof typeof directions];
                    if (direction){ 
                        const isZonk = this.tilingLogic.checkCell(['z','d'], x + direction.x, y+ direction.y) &&
                        this.tilingLogic.checkCell(['e'], x + direction.x * 2, y+ direction.y * 2) && direction.y == 0 && this.tilingLogic.tileTransitions[y + direction.y][x + direction.x] == null;
                        if (isZonk){
                            //console.log('zonk push');
                            this.tilingLogic.tileMapNext[y+direction.y][x+direction.x] = 'p';
                            this.tilingLogic.tileMapNext[y+direction.y*2][x+direction.x*2] = this.tilingLogic.tileMap[y+direction.y][x+direction.x];
                            this.tilingLogic.tileMapNext[y][x] = 'e';
                            this.tilingLogic.tileTransitions[y][x] = {x: direction.x, y: direction.y, type: 'move'};
                            this.tilingLogic.tileTransitions[y+direction.y][x+direction.x] = {x: direction.x, y: direction.y, type: 'move'};
                        }
                    }
                }
            })
        })
        this.onMainTick?.();
    }
} 