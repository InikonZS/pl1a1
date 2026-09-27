import { useEffect, useRef, useState } from 'react';
import style from './packshot.module.css'

interface IPackshotScreenProps {

}

export const PackshotScreen = ({}: IPackshotScreenProps) => {
    return <div className={style.screen}>
        <div className={[style.tobe].join(' ')}>to be continued...</div>
        <div className={[style.tobe, style.small].join(' ')}>interested to know what's behind the door?</div>
        <div className={[style.tobe, style.subscribe].join(' ')}>subscribe me at linkedin</div>
        <a className={[style.link].join(' ')} href='https://www.linkedin.com/in/inikon/' target='_blank'><div className={[style.tobe, style.inikon].join(' ')}>Inikon</div></a>
    </div>
}