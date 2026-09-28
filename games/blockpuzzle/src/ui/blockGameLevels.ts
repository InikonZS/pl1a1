import type { IField } from "./blockGameTools";

export const levels: IField[] = [
        {
        field: new Array(5).fill(null).map(it => new Array(5).fill('1')),
        blocks: [
            {
                position: { x: 0, y: 0 },
                place: { x: 2, y: 3 },
                pattern: [
                    '110',
                    '011'
                ].map(it => it.split('')),
                id: '1'
            },
        ]
    },
    {
        field: new Array(5).fill(null).map(it => new Array(5).fill('1')),
        blocks: [
            {
                position: { x: 0, y: 0 },
                place: { x: 0, y: 1 },//{ x: 1, y: 2 }, //  place: { x: 2, y: 2 },
                pattern: [
                    '111',
                ].map(it => it.split('')),
                id: '1'
            },
            {
                position: { x: 0, y: 1 },
                place: { x: 0, y: 2 },//{ x: 2, y: 3 },
                pattern: [
                    '11',
                    '01'
                ].map(it => it.split('')),
                id: '2'
            },
        ]
    },

       {
        field: new Array(5).fill(null).map(it => new Array(5).fill('1')),
        blocks: [
            {
                position: { x: 0, y: 0 },
                place: { x: 1, y: 2 }, //  place: { x: 2, y: 2 },
                pattern: [
                    '111',
                ].map(it => it.split('')),
                id: '1'
            },
            {
                position: { x: 0, y: 1 },
                place: { x: 2, y: 3 },
                pattern: [
                    '11',
                    '01'
                ].map(it => it.split('')),
                id: '2'
            },
            {
                position: { x: 0, y: 3 },
                place: { x: 0, y: 0 },
                pattern: [
                    '1',
                    '1'
                ].map(it => it.split('')),
                id: '3'
            }
        ]
    },


    {
        field: new Array(5).fill(null).map(it => new Array(5).fill('1')),
        blocks: [
            {
                position: { x: 0, y: 0 },
                place: { x: 0, y: 1 },//{ x: 1, y: 2 }, //  place: { x: 2, y: 2 },
                pattern: [
                    '111',
                ].map(it => it.split('')),
                id: '1'
            },
            {
                position: { x: 0, y: 1 },
                place: { x: 0, y: 2 },//{ x: 2, y: 3 },
                pattern: [
                    '11',
                    '01'
                ].map(it => it.split('')),
                id: '2'
            },
            {
                position: { x: 0, y: 3 },
                place: { x: 3, y: 2 },//{ x: 0, y: 0 },
                pattern: [
                    '1',
                    '1'
                ].map(it => it.split('')),
                id: '3'
            }
        ]
    },

    {
        field: new Array(7).fill(null).map(it => new Array(7).fill('1')),
        blocks: [
            {
                position: { x: 0, y: 0 },
                place: { x: 1, y: 2 }, //  place: { x: 2, y: 2 },
                pattern: [
                    '111',
                ].map(it => it.split('')),
                id: '1'
            },
            {
                position: { x: 0, y: 1 },
                place: { x: 2, y: 3 },
                pattern: [
                    '11',
                    '01'
                ].map(it => it.split('')),
                id: '2'
            },
            {
                position: { x: 0, y: 3 },
                place: { x: 0, y: 0 },
                pattern: [
                    '1',
                    '1'
                ].map(it => it.split('')),
                id: '3'
            },
            {
                position: { x: 6, y: 3 },
                place: { x: 1, y: 4 },
                pattern: [
                    '1',
                    '1',
                    '1'
                ].map(it => it.split('')),
                id: '4'
            }
        ]
    },

    {
        field: new Array(7).fill(null).map(it => new Array(7).fill('1')),
        blocks: [
            {
                position: { x: 0, y: 0 },
                place: { x: 3, y: 1 },//{ x: 1, y: 2 }, //  place: { x: 2, y: 2 },
                pattern: [
                    '111',
                ].map(it => it.split('')),
                id: '1'
            },
            {
                position: { x: 0, y: 1 },
                place: { x: 2, y: 4 },//{ x: 2, y: 3 },
                pattern: [
                    '11',
                    '01'
                ].map(it => it.split('')),
                id: '2'
            },
            {
                position: { x: 0, y: 3 },
                place: { x: 5, y: 4 },//{ x: 0, y: 0 },
                pattern: [
                    '1',
                    '1'
                ].map(it => it.split('')),
                id: '3'
            },
            {
                position: { x: 6, y: 3 },
                place: { x: 1, y: 0 },//{ x: 1, y: 4 },
                pattern: [
                    '1',
                    '1',
                    '1'
                ].map(it => it.split('')),
                id: '4'
            }
        ]
    },

    {
        field: new Array(7).fill(null).map(it => new Array(7).fill('1')),
        blocks: [
            {
                position: { x: 0, y: 0 },
                place: { x: 1, y: 0 },
                pattern: [
                    '111',
                ].map(it => it.split('')),
                id: '1'
            },
            {
                position: { x: 0, y: 1 },
                place: { x: 2, y: 3 },
                pattern: [
                    '11',
                    '01'
                ].map(it => it.split('')),
                id: '2'
            },
            {
                position: { x: 0, y: 3 },
                place: { x: 5, y: 4 },
                pattern: [
                    '1',
                    '1'
                ].map(it => it.split('')),
                id: '3'
            },
            {
                position: { x: 3, y: 3 },
                place: { x: 1, y: 1 },
                pattern: [
                    '1111'
                ].map(it => it.split('')),
                id: '4'
            }
        ]
    }
]