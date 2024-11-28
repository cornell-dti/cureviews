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
    const [stars, setStars] = useState<any[]>([])
    const [overallEmote, setOverallEmote] = useState<any>();
    const [difficultyEmote, setDifficultyEmote] = useState<any>();
    const [workloadEmote, setWorkloadEmote] = useState<any>();

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
            setOverallEmote(undefined)
        }
    }, [overall])

    useEffect(() => {
        if (difficulty) {
            if (0 <= difficulty && difficulty < 3) {
                setDifficultyEmote(SadFace)
            } else if (3 <= difficulty && difficulty < 3.8) {
                setDifficultyEmote(MehFace)
            } else {
                setDifficultyEmote(HappyFace)
            }
        } else {
            setDifficultyEmote(undefined)
        }
    }, [difficulty])

    useEffect(() => {
        if (workload) {
            if (0 <= workload && workload < 3) {
                setWorkloadEmote(SadFace)
            } else if (3 <= workload && workload < 3.8) {
                setWorkloadEmote(MehFace)
            } else {
                setWorkloadEmote(HappyFace)
            }
        } else {
            setWorkloadEmote(undefined)
        }
    }, [workload])

    return (
        <div className={styles.container}>
            <div className={styles.overall}>
                <div className={styles.overallScore}>
                    {overall ? overall.toPrecision(2) : "--"}
                    <img
                        src={overallEmote}
                        alt='overall-rating-emote'
                    />
                </div>
                <div className={styles.stars}>
                    {stars.map((star) => {
                        return <img 
                                src={star}
                                alt="rating-star"
                                />
                    })}
                </div>
                <div>
                    Overall Satisfaction
                </div>
            </div>
            <div className={styles.ratings}>
                <div className={styles.horizontal}>
                    <div className={styles.category}> Difficulty </div>
                    <div className={styles.bars}>
                        <div className={styles.bar}/>
                        <div className={styles.bar}/>
                        <div className={styles.bar}/>
                        <div className={styles.bar}/>
                        <div className={styles.bar}/>
                    </div>
                    <div className={styles.ratingNum}> {difficulty ? difficulty.toPrecision(2) : "-"} </div>
                    <img
                        src={difficultyEmote}
                        alt="difficulty-rating-emote"
                    />
                </div>
                <div className={styles.horizontal}>
                    <div className={styles.category}> Workload </div>
                    <div className={styles.bars}>
                        <span className={styles.bar}/>
                        <span className={styles.bar}/>
                        <span className={styles.bar}/>
                        <span className={styles.bar}/>
                        <span className={styles.bar}/>
                    </div>
                    <div className={styles.ratingNum}> {workload ? workload.toPrecision(2) : "-"} </div>
                    <img
                        src={workloadEmote}
                        alt="workload-rating-emote"
                    />
                </div>
            </div>
        </div>
    )
}

export default Gauges