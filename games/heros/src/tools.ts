const moves = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 },
    { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }];

export function indexateMap(cells: string[][], initialPoint: { x: number, y: number }) {
    const waveField = cells.map(it => {
        return it.map(jt => {
            return jt == '2' ? -1 : Number.MAX_SAFE_INTEGER
        })
    });

    const trace = (points: { x: number, y: number }[], currentGen: number) => {
        let nextGen: { x: number, y: number }[] = [];
        points.forEach(point => {
            moves.forEach(move => {
                let moved = { x: point.x + move.x, y: point.y + move.y };
                if (moved.y >= 0 && moved.x >= 0 && moved.y < waveField.length && moved.x < waveField[0].length) {
                    let cell = waveField[moved.y][moved.x];
                    const diagCheck = waveField[moved.y][point.x] != -1 && waveField[point.y][moved.x]!= -1;
                    if (cell != undefined && cell > currentGen && diagCheck) {
                        nextGen.push(moved);
                        waveField[moved.y][moved.x] = currentGen;
                    }
                }
            });
        });
        if (nextGen.length) {
            return trace(nextGen, currentGen + 1);
        } else {
            return waveField;
        }
    }

    //waveField[initialPoint.y][initialPoint.x] = 0;
    return trace([initialPoint], 0);
}

export const findPath = (waveField: number[][], endPoint: { x: number, y: number })=>{
    const path: {x: number, y: number}[] = [{...endPoint}];
    const currentPoint = {...endPoint};
    if (waveField[currentPoint.y]?.[currentPoint.x] == undefined || waveField[currentPoint.y][currentPoint.x] == Number.MAX_SAFE_INTEGER || waveField[currentPoint.y][currentPoint.x] == -1 ){
        return null;
    }
    let currentGen = waveField[currentPoint.y][currentPoint.x];
    for (let i = 0; i< 1000; i++){
        if (waveField[currentPoint.y][currentPoint.x] == 0){
            break;
        }
        for (let moveIndex = 0; moveIndex< moves.length; moveIndex++){
            const move = moves[moveIndex];
            const moved = { x: currentPoint.x + move.x, y: currentPoint.y + move.y };
            if (waveField[moved.y]?.[moved.x] == currentGen - 1){
                currentPoint.x = moved.x;
                currentPoint.y = moved.y;
                currentGen = currentGen-1;
                path.push(moved);
                break;
            }
        };
    }
    return path;
}