import React, { useEffect, useState } from 'react';
import styles from '../Styles/Gauges.module.css';

import HappyFace from '../../../../public/gauges/gauge_icon_positive.svg';
import MehFace from '../../../../public/gauges/gauge_icon_neutral.svg';
import SadFace from '../../../../public/gauges/gauge_icon_negative.svg';

import Green from '../../../../public/gauges/green_full_star.svg';
import GreenHalf from '../../../../public/gauges/green_half_star.svg';
import Yellow from '../../../../public/gauges/yellow_full_star.svg';
import YellowHalf from '../../../../public/gauges/yellow_half_star.svg';
import Red from '../../../../public/gauges/red_full_star.svg';
import RedHalf from '../../../../public/gauges/red_half_star.svg';
import Gray from '../../../../public/gauges/gray_star.svg';

type GaugesProps = {
    overall: number | undefined;
    difficulty: number | undefined;
    workload: number | undefined;
}

const Gauges = ({overall, difficulty, workload}: GaugesProps) => {
    const [stars, setStars] = useState([])
    const [overallEmote, setOverallEmote] = useState();
    const [difficultyEmote, setDifficultyEmote] = useState();
    const [workloadEmote, setWorkloadEmote] = useState();

    useEffect(() => {
        if (overall) {
            if (0 <= overall && overall < 3) {
                setOverallEmote(SadFace)
                if (overall < 0.25) {
                    setStars([Gray, Gray, Gray, Gray, Gray])
                } else if (0.25 <= overall && overall < 0.8) {
                    setStars([RedHalf, Gray, Gray, Gray, Gray])
                } else if (0.8 <= overall && overall < 1.25) {
                    setStars([Red, Gray, Gray, Gray, Gray])
                } else if (1.25 <= overall && overall < 1.8) {
                    setStars([Red, RedHalf, Gray, Gray, Gray])
                } else if (1.8 <= overall && overall < 2.25) {
                    setStars([Red, Red, Gray, Gray, Gray])
                } else {
                    setStars([Red, Red, RedHalf, Gray, Gray])
                }
            } else if (3 <= overall && overall < 3.8) {
                setOverallEmote(MehFace)
                if (overall < 3.25) {
                    setStars([Yellow, Yellow, Yellow, Gray, Gray])
                } else {
                    setStars([Yellow, Yellow, Yellow, YellowHalf, Gray])
                }
            } else {
                setOverallEmote(HappyFace)
                if (overall < 4.25) {
                    setStars([Green, Green, Green, Green, Gray])
                } else if (overall < 4.8) {
                    setStars([Green, Green, Green, Green, GreenHalf])
                } else {
                    setStars([Green, Green, Green, Green, Green])
                }
            }
        } else {
            setStars([Gray, Gray, Gray, Gray, Gray])
        }
    }, [overall])

    return (
        <div className={styles.container}>
            <div className={styles.overall}>
                <div className={styles.overallScore}>
                    {overall ? overall.toPrecision(2) : "0.0"}
                    <img src={overallEmote}/>
                </div>
                <div className={styles.stars}>
                    {stars.map((star) => {
                        return <img src={star}></img>
                    })}
                </div>
                <div>
                    Overall Satisfaction
                </div>
            </div>
            <div className={styles.ratings}>
                <div className={styles.bars}>
                    <div> Difficulty </div>
                    <div>
                        Bars
                    </div>
                    <div> {difficulty ? difficulty.toPrecision(2) : "0.0"} </div>
                    <img src={difficultyEmote}/>
                </div>
                <div className={styles.bars}>
                    <div> Workload </div>
                    <div>
                        Bars
                    </div>
                    <div> {workload ? workload.toPrecision(2) : "0.0"} </div>
                    <img src={workloadEmote}/>
                </div>
            </div>
        </div>
    )
}

export default Gauges