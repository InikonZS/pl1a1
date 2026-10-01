import { useEffect, useRef } from "react";

export const CanvasTest = () => {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!ref.current) {
            return;
        }
        const ctx = ref.current.getContext('2d');
        const tiles = new Array(320).fill(null).map(it => new Array(320).fill(null).map(jt => Math.random() < 0.5 ? '1' : '2'));

        const tileSize = 8;

        const img1 = new Image();
        const img2 = new Image();

        const img1Load = () => {
            img1.src = './star1.png';
            return new Promise<void>(resolve => {
                img1.onload = () => {
                    resolve();
                }
            })
        }
        const img2Load = () => {
            img2.src = './star2.png';
            return new Promise<void>(resolve => {
                img2.onload = () => {
                    resolve();
                }
            })
        }

        Promise.all([img1Load(), img2Load()]).then(() => {
            const pattern1 = ctx.createPattern(img1, "repeat");
            pattern1.setTransform(new DOMMatrix().scale(tileSize / img1.naturalWidth, tileSize / img1.naturalHeight));
            const pattern2 = ctx.createPattern(img2, "repeat");
            pattern2.setTransform(new DOMMatrix().scale(tileSize / img1.naturalWidth, tileSize / img1.naturalHeight));

            const renderC = () => {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.fillStyle = pattern1;
                ctx.beginPath();
                tiles.forEach((row, y) => row.forEach((cell, x) => {
                    if (cell != '1') {
                        return;
                    }
                    ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize);
                }));
                ctx.fill();

                ctx.fillStyle = pattern2;
                ctx.beginPath();
                tiles.forEach((row, y) => row.forEach((cell, x) => {
                    if (cell != '2') {
                        return;
                    }
                    ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize);
                }));
                ctx.fill();
            }

            for (let i = 0; i < 20; i++) {
                let time = performance.now();
                renderC();
                console.log('frameTime C', performance.now() - time);
            }
        })


        const renderB = () => {
            tiles.forEach((row, y) => row.forEach((cell, x) => {
                ctx.fillStyle = cell == '1' ? '#f00' : '#ff0';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }));
        }

        const renderA = () => {
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            tiles.forEach((row, y) => row.forEach((cell, x) => {
                if (cell != '1') {
                    return;
                }
                ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize);
            }));
            ctx.fill();

            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            tiles.forEach((row, y) => row.forEach((cell, x) => {
                if (cell != '2') {
                    return;
                }
                ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize);
            }));
            ctx.fill();
        }

        /*for (let i = 0; i<20; i++){
            let time = performance.now();
            renderA();
            console.log('frameTime A', performance.now() - time);
        }*/
        /*for (let i = 0; i<20; i++){
            let time = performance.now();
            renderB();
            console.log('frameTime B', performance.now() - time);
        }*/
    }, []);
    return <div>
        <canvas ref={ref} width={1800} height={1600} style={{ width: 800, height: 600 }}></canvas>
    </div>
}