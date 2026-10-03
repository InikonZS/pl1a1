import { useEffect, useState } from "react";

export const useSize = (wrapper: HTMLElement) => {
    const [scale, setScale] = useState(0);
    useEffect(() => {
        //console.log('wrapper', wrapper);
        if (!wrapper){
            return;
        }
        const resize = () => {
            const width = wrapper.parentElement.getBoundingClientRect().width;
            const height = wrapper.parentElement.getBoundingClientRect().height;
            //console.log(width, height);
            let w = 350;
            let h = 580;
            const aspect = h / w;
            const size = Math.min(height / aspect, width);
            setScale(size / w);
        }
        window.addEventListener('resize', resize);
        resize();
        return () => {
            window.removeEventListener('resize', resize);
        }
    }, [wrapper]);

    useEffect(() => {
        const parent = wrapper;
        if (!parent) {
            return;
        }
        parent.style.setProperty('--base', scale.toString() + 'px');
    }, [scale, wrapper]);

    return scale;
}