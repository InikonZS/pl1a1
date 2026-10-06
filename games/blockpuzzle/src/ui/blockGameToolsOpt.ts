export interface IBlock {
    position: { x: number, y: number },
    place: { x: number, y: number },
    pattern: Array<Array<string>>,
    id: string;
}

export interface IField {
    blocks: IBlock[],
    field: string[][]
}

export const getFieldHashText = (field: IField) => {
    const linear: Array<string | number> = [];
    field.blocks.forEach((it, i) => {
        //if ((i + 1).toString() != it.id){
          //  console.log('id verify failed')
        //}
        linear.push(it.position.x, it.position.y);
    });
    return linear.join('_');
}

export const getFieldHash = (blocks: {x: number, y: number}[]) => {
    let hs=0;//linear: Array<string | number> = [];
    blocks.forEach((it, i) => {
        //if ((i + 1).toString() != it.id){
          //  console.log('id verify failed')
        //}
        //linear.push(it.position.x, it.position.y);
        hs+= (20**(i*2))*it.x + (20**(i*2+1))*it.y;
    });
    return hs;//linear.join('_');
}

export const getFieldHashMoved = (blocks: {x: number, y: number}[], id: number, px: number, py: number) => {
    let hs=0;//linear: Array<string | number> = [];
    blocks.forEach((it, i) => {
        if (i==id){
            hs+= (20**(i*2))*px + (20**(i*2+1))*py;
            return;
        }
        //if ((i + 1).toString() != it.id){
          //  console.log('id verify failed')
        //}
        //linear.push(it.position.x, it.position.y);
        hs+= (20**(i*2))*it.x + (20**(i*2+1))*it.y;
    });
    return hs;//linear.join('_');
}

export const getTargetHash = (field: IField) => {
    const linear: Array<string | number> = [];
    field.blocks.forEach((it, i) => {
        if ((i + 1).toString() != it.id){
            console.log('id verify failed')
        }
        linear.push(it.place.x, it.place.y);
    });
    return linear.join('_');
}

export const applyHash = (field: IField, hash: string) => {
    const splitedHash = hash.split('_').map(it=>Number(it));
    const nextBlocks = field.blocks.map((block, i) => {
        if ((i + 1).toString() != block.id){
            console.log('id verify failed')
        }
        return {...block, position: {x: splitedHash[i*2], y: splitedHash[i*2+1]}}
    });

    const nextField = { ...field, blocks: nextBlocks };
    return nextField;
}

const blockMove = (field: IField, selected: IBlock, selectedIndex: number, moveDirection: { x: number, y: number }, cachedSweepMap: string[][], hashMap: any) => {
    const sweepMap: string[][] = cachedSweepMap;//field.field.map(row => row.map(it => it == '1' ? '0' : '1'));
    /*const { blocks } = field;
    blocks.forEach(block => {
        if (block.id == selected.id) {
            return;
        }
        block.pattern.forEach((row, y) => row.forEach((cell, x) => {
            if (cell == '1') {
                sweepMap[y + block.position.y][x + block.position.x] = '1'
            }
        }));
    });*/

    let found = 0;
    for (let i = 1; i < 100; i++) {
        if (found) {
            break;
        }
        const currentBlock = selected;
        const cmy = currentBlock.position.y + moveDirection.y * i;
        const cmx = currentBlock.position.x + moveDirection.x * i;
        for (let y = 0; y < currentBlock.pattern.length; y++){
            const row = currentBlock.pattern[y];
            const mapRow = sweepMap[y + cmy];
            if (!mapRow){
                found = i;
                break;
            }
            let breakInside = false;
            for (let x = 0; x < row.length; x++){
                const cell = row[x];
                if (cell == '0') {
                    continue;
                }
                //const cellValue = sweepMap[y + currentBlock.position.y + moveDirection.y * i]?.[x + currentBlock.position.x + moveDirection.x * i]
                const cellValue = mapRow[x + cmx]
                
                if ((cellValue != '0') && (cellValue != (selectedIndex + 1) ) || cellValue == undefined) {
                    found = i;
                    breakInside = true;
                    break;
                }
            }
            if (breakInside){
                break;
            }
        }
        /*currentBlock.pattern.some((row, y) => {
            const mapRow = sweepMap[y + cmy];
            if (!mapRow){
                found = i;
                return true;
            }
            return row.some((cell, x) => {
            if (cell == '0') {
                return false;
            }
            //const cellValue = sweepMap[y + currentBlock.position.y + moveDirection.y * i]?.[x + currentBlock.position.x + moveDirection.x * i]
            const cellValue = mapRow[x + cmx]
            
            if (cellValue == '1' || cellValue == undefined) {
                found = i;
                return true;
            }
            return false;
        })});*/
    }
    if (found == 0) {
        return;
    }
    const offsetMultiplier = found - 1;
    if (hashMap[getFieldHashMoved(field, selectedIndex, selected.position.x + moveDirection.x * offsetMultiplier, selected.position.y + moveDirection.y * offsetMultiplier)]){
        return;
    }
    //const moveResult = { x: moveDirection.x * offsetMultiplier, y: moveDirection.y * offsetMultiplier }

    const nextBlocks = field.blocks.slice();//[...field.blocks];
    //const selectedBlockIndex = nextBlocks.findIndex(it => it.id == selected.id);
    //nextBlocks[selectedBlockIndex] = { ...selected, position: { x: selected.position.x + moveResult.x, y: selected.position.y + moveResult.y } }
    nextBlocks[selectedIndex] = { ...selected, position: { x: selected.position.x + moveDirection.x * offsetMultiplier, y: selected.position.y + moveDirection.y * offsetMultiplier } }

    const nextField = { ...field, blocks: nextBlocks };
    return nextField;
}
    const moves = [
        {x: 1, y: 0},
        {x: -1, y: 0},
        {x: 0, y: 1},
        {x: 0, y: -1},
    ]
const iterateMoves = (field: IField['field'], blocks: {x: number, y: number}[], patterns: IField['blocks'], hashMap: Record<string, {gen: number, prev: string}>, prevHash: string, generation: number = 1, nextGenFields:any[], sweepMapStatic: any[][]) => {

    //const nextGenFields: IField[] = [];
    //const sweepMapStatic = field.field.map(row => row.map(it => it == '1' ? '0' : '1'));
    //const sweepMap = field.field.map(row => row.map(it => it == '1' ? '0' : '1'));
        const sweepMap = sweepMapStatic;
        for (let y = 0; y < field.length; y++){
            const row = field[y]
            for (let x = 0; x < row.length; x++){
                const cell = row[x];
                sweepMap[y][x] = cell == '1' ? 0 : 1
            }
        }
        //field.field.forEach((row, y) => row.forEach((it, x) => sweepMap[y][x] = it == '1' ? '0' : '1'));
        //const sweepMap = sweepMapStatic.map(row => row.map(it => it));
        //const { blocks } = field;
        //blocks.forEach((block_, blockIndex) => {
            /*if (block_.id == block.id) {
                return;
            }*/
            /*patterns[blockIndex].pattern.forEach((row, y) => row.forEach((cell, x) => {
                if (cell == '1') {
                    sweepMap[y + block_.y][x + block_.x] = blockIndex + 1; //'1'
                }
            }));*/
        for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++){
            const block_ = blocks[blockIndex];
            for (let y = 0; y < patterns[blockIndex].pattern.length; y++){
                const row = patterns[blockIndex].pattern[y]
                for (let x = 0; x < row.length; x++){
                    const cell = row[x];
                    if (cell == '1') {
                        sweepMap[y + block_.y][x + block_.x] = blockIndex + 1; //'1'
                    }
                }
            }
        }
        //});
    //field.blocks.forEach((block, blockIndex) => {
     for (let blockIndex = 0; blockIndex< blocks.length; blockIndex++){
        const block =blocks[blockIndex];
        for (let moveIndex = 0; moveIndex< moves.length; moveIndex++){
            const move = moves[moveIndex];


            //move
            let found = 0;
            for (let i = 1; i < 100; i++) {
                if (found) {
                    break;
                }
                const currentBlock = block;
                const cmy = currentBlock.y + move.y * i;
                const cmx = currentBlock.x + move.x * i;
                for (let y = 0; y < patterns[blockIndex].pattern.length; y++){
                    const row = patterns[blockIndex].pattern[y];
                    const mapRow = sweepMap[y + cmy];
                    if (!mapRow){
                        found = i;
                        break;
                    }
                    let breakInside = false;
                    for (let x = 0; x < row.length; x++){
                        //const cell = row[x];
                        if (row[x] == '0') {
                            continue;
                        }
                        //const cellValue = sweepMap[y + currentBlock.position.y + moveDirection.y * i]?.[x + currentBlock.position.x + moveDirection.x * i]
                        const cellValue = mapRow[x + cmx]
                        
                        if ((cellValue != 0) && (cellValue != (blockIndex + 1) ) || cellValue == undefined) {
                            found = i;
                            breakInside = true;
                            break;
                        }
                    }
                    if (breakInside){
                        break;
                    }
                }
            }
            if (found == 0) {
                //return;
                continue;
            }
            const offsetMultiplier = found - 1;
            const nextHash = getFieldHashMoved(blocks, blockIndex, block.x + move.x * offsetMultiplier, block.y + move.y * offsetMultiplier);
            if (hashMap[nextHash]){
                //return;
                continue;
            }

            const nextBlocks = blocks.slice();
            nextBlocks[blockIndex] = { x: block.x + move.x * offsetMultiplier, y: block.y + move.y * offsetMultiplier }

            //const moveState = { ...field, blocks: nextBlocks };


       // moves.forEach(move=>{
            //const moveState = blockMove(field, block, blockIndex, move, sweepMap, hashMap);
            //if (!moveState){
                //console.log('skip no move');
                //return;
             //   continue;
            //}
            const moveHash = nextHash;//getFieldHash(moveState);
            if (hashMap[moveHash] == undefined){
                nextGenFields.push(nextBlocks);
                hashMap[moveHash] = {gen: generation, prev: prevHash};
            }
        //})
        }
     }
    //})
    //return nextGenFields;
}

export const interateResursive = (field: IField, stopHash: string = '')=>{
    const perfTime = performance.now();
    const hashMap: Record<string, {gen: number, prev: string}> = {[getFieldHash(field.blocks.map(it=>it.position))]: {gen: 0, prev: ''}};
    let generationFields = [field.blocks.map(it=>it.position)];
    const sweepMapStatic = field.field.map(row => row.map(it => it == '1' ? 0 : 1));
    for (let i = 0; i<100; i++){
        const nextGenFields: ({x: number, y: number}[])[] = [];
        const foundByHash = generationFields.find(currentField=>{
            const currentHash = getFieldHash(currentField);
            if (currentHash == stopHash){
                return true;
            }
            const iteratedFields = iterateMoves(field.field, currentField, field.blocks, hashMap, currentHash, i+1, nextGenFields, sweepMapStatic);
            //iteratedFields.forEach(it=>nextGenFields.push(it));
            //nextGenFields.push(...iteratedFields);
        });
        if (foundByHash){
            console.log('stopped by hash');
            console.log(traceMap(hashMap, getFieldHash(foundByHash)));
            console.log(hashMap);
            break;
        }
        if (!nextGenFields.length){
            console.log('iteration', i, 'total', Object.keys(hashMap).length, generationFields[0], getFieldHash(generationFields[0]));
            console.log(traceMap(hashMap, getFieldHash(generationFields[0])));
            console.log(hashMap);
            break;
        }
        console.log('generation count', nextGenFields.length);
        generationFields = nextGenFields;
    }
    console.log('perfTime', performance.now() - perfTime)
}

const traceMap = (hashMap: Record<string, {gen: number, prev: string}>, finalHash: string)=>{
    let currentHash = finalHash;
    const trace: Array<string> = [];
    for (let i=0; i< 100; i++){
        trace.push(currentHash);
        currentHash = hashMap[currentHash].prev;
        if (!currentHash){
            break;
        }
    }
    return trace;
}