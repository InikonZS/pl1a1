const levelHard1 = {
    field: [
        '0111101111',
        '1111111111',
        '1111101111',
        '1111101111',
    ].map(row => row.split('')),
    blocks: [
        {
            position: { x: 2, y: 0 },
            place: { x: 6, y: 3 },
            pattern: [
                '111',
            ].map(it => it.split('')),
            id: '1'
        },
    ]
};

const levelHard2 = {
    field: [
        '0111101111',
        '1111111111',
        '1111111111',
        '1111101111',
    ].map(row => row.split('')),
    blocks: [
        {
            position: { x: 2, y: 0 },
            place: { x: 6, y: 3 }, //  place: { x: 2, y: 2 },
            pattern: [
                '111',
            ].map(it => it.split('')),
            id: '1'
        },
        {
            position: { x: 6, y: 2 },
            place: { x: 1, y: 2 }, //  place: { x: 2, y: 2 },
            pattern: [
                '111',
                '001'
            ].map(it => it.split('')),
            id: '2'
        },
    ]
};

export const levelsHard = [levelHard1, levelHard2];