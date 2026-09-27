import style from './winScreen.module.css';

export const WinScreen = ({onNext}: {onNext: ()=>void}) => {
    return <div className={style.winScreen}>
        <div className={style.winScreenHead}>
            CONGRATULATIONS
        </div>
        <div className={style.winScreenBig}>
            YOU COMPLETED LEVEL
        </div>
        <div className={style.winScreenSmall}>
            WAS IT NOT ENOUGH HARD? SURE NEXT ONE IS REALLY CHALLENGING! TRY IT.
        </div>
        <div className={style.winScreenNext} onClick={onNext}>
            PLAY NEXT
        </div>
        <div className={style.winScreenEffect}>
            
        </div>
    </div>
}