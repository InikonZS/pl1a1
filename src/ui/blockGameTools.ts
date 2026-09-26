interface IBlock {
    position: { x: number, y: number },
    place: { x: number, y: number },
    pattern: Array<Array<string>>,
    id: string;
}

interface IField {
    blocks: IBlock[],
    field: string[][]
}

export const getFieldHash = (field: IField) => {
    const linear: Array<string | number> = [];
    field.blocks.forEach((it, i) => {
        if ((i + 1).toString() != it.id){
            console.log('id verify failed')
        }
        linear.push(it.position.x, it.position.y);
    });
    return linear.join('_');
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

const blockMove = (field: IField, selected: IBlock, moveDirection: { x: number, y: number }) => {
    const sweepMap: string[][] = field.field.map(row => row.map(it => it == '1' ? '0' : '1'));
    const { blocks } = field;
    blocks.forEach(block => {
        if (block.id == selected.id) {
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
        const currentBlock = selected;
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
    const moveResult = { x: moveDirection.x * offsetMultiplier, y: moveDirection.y * offsetMultiplier }

    const nextBlocks = [...field.blocks];
    const selectedBlockIndex = nextBlocks.findIndex(it => it.id == selected.id);
    nextBlocks[selectedBlockIndex] = { ...selected, position: { x: selected.position.x + moveResult.x, y: selected.position.y + moveResult.y } }

    const nextField = { ...field, blocks: nextBlocks };
    return nextField;
}

const iterateMoves = (field: IField, hashMap: Record<string, {gen: number, prev: string}>, prevHash: string, generation: number = 1) => {
    const moves = [
        {x: 1, y: 0},
        {x: -1, y: 0},
        {x: 0, y: 1},
        {x: 0, y: -1},
    ]
    const nextGenFields: IField[] = [];
    field.blocks.forEach(block => {
        moves.forEach(move=>{
            const moveState = blockMove(field, block, move);
            if (!moveState){
                console.log('skip no move');
                return;
            }
            const moveHash = getFieldHash(moveState);
            if (hashMap[moveHash] == undefined){
                nextGenFields.push(moveState);
                hashMap[moveHash] = {gen: generation, prev: prevHash};
            }
        })
    })
    return nextGenFields;
}

export const interateResursive = (field: IField, stopHash: string = '')=>{
    const hashMap: Record<string, {gen: number, prev: string}> = {[getFieldHash(field)]: {gen: 0, prev: ''}};
    let generationFields = [field];
    for (let i = 0; i<100; i++){
        const nextGenFields: IField[] = [];
        const foundByHash = generationFields.find(currentField=>{
            const currentHash = getFieldHash(currentField);
            if (currentHash == stopHash){
                return true;
            }
            const iteratedFields = iterateMoves(currentField, hashMap, currentHash, i+1);
            nextGenFields.push(...iteratedFields);
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
        generationFields = nextGenFields;
    }
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