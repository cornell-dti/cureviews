import React, { useEffect, useState } from 'react';
import styles from '../Styles/Gauges.module.css';

import HappyFace from '/gauges/gauge_icon_positive.svg';
import MehFace from '/gauges/gauge_icon_neutral.svg';
import SadFace from '/gauges/gauge_icon_negative.svg';

import Green from '/gauges/green_full_star.svg';
import GreenHalf from '/gauges/green_half_star.svg';
import Yellow from '/gauges/yellow_full_star.svg';
import YellowHalf from '/gauges/yellow_half_star.svg';
import Red from '/gauges/red_full_star.svg';
import RedHalf from '/gauges/red_half_star.svg';
import Gray from '/gauges/gray_star.svg';

type GaugesProps = {
    overall: number | undefined;
    difficulty: number | undefined;
    workload: number | undefined;
}

const Gauges = ({overall, difficulty, workload}: GaugesProps) => {
    const [stars, setStars] = useState<any[]>([])
    const [difficultyEmote, setDifficultyEmote] = useState<any>();
    const [workloadEmote, setWorkloadEmote] = useState<any>();
    const [difficultyHover, setDifficultyHover] = useState<string>();
    const [workloadHover, setWorkloadHover] = useState<string>();
    const [difficultyColor, setDifficultyColor] = useState<string>('#ECECEC');
    const [workloadColor, setWorkloadColor] = useState<string>('#ECECEC');
    const [difficultyBars, setDifficultyBars] = useState<string[]>([]);
    const [workloadBars, setWorkloadBars] = useState<string[]>([]);

    const red = '#FF756C';
    const yellow = '#F8CC30';
    const green = '#5EB734';

    useEffect(() => {
        // Higher overall scores are more positive
        if (overall) {
            if (0 <= overall && overall < 3) {
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
                if (overall < 3.25) {
                    setStars([Yellow, Yellow, Yellow, Gray, Gray])
                } else {
                    setStars([Yellow, Yellow, Yellow, YellowHalf, Gray])
                }
            } else {
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

    useEffect(() => {
        // Higher difficulty scores are more negative
        if (difficulty) {
            if (0 <= difficulty && difficulty < 3) {
                setDifficultyEmote(HappyFace)
                setDifficultyHover('Super easy')
                setDifficultyColor(green)
            } else if (3 <= difficulty && difficulty < 3.8) {
                setDifficultyEmote(MehFace)
                setDifficultyHover('Doable')
                setDifficultyColor(yellow)
            } else {
                setDifficultyEmote(SadFace)
                setDifficultyHover('Challenging')
                setDifficultyColor(red)
            }
            setDifficultyBars([
                (Math.min(difficulty, 1) * 100).toFixed(0) + '%',
                (Math.min(difficulty - 1, 1) * 100).toFixed(0) + '%',
                (Math.min(difficulty - 2, 1) * 100).toFixed(0) + '%',
                (Math.min(difficulty - 3, 1) * 100).toFixed(0) + '%',
                (Math.min(difficulty - 4, 1) * 100).toFixed(0) + '%'
            ])
        } else {
            setDifficultyEmote(undefined)
            setDifficultyBars(['0%', '0%', '0%', '0%', '0%'])
            setDifficultyHover('')
        }
    }, [difficulty])

    useEffect(() => {
        // Higher workload scores are more negative
        if (workload) {
            if (0 <= workload && workload < 3) {
                setWorkloadEmote(HappyFace)
                setWorkloadHover('Super light')
                setWorkloadColor(green)
            } else if (3 <= workload && workload < 3.8) {
                setWorkloadEmote(MehFace)
                setWorkloadHover('Manageable')
                setWorkloadColor(yellow)
            } else {
                setWorkloadEmote(SadFace)
                setWorkloadHover('Lots of work')
                setWorkloadColor(red)
            }
            setWorkloadBars([
                (Math.min(workload, 1) * 100).toFixed(0) + '%',
                (Math.min(workload - 1, 1) * 100).toFixed(0) + '%',
                (Math.min(workload - 2, 1) * 100).toFixed(0) + '%',
                (Math.min(workload - 3, 1) * 100).toFixed(0) + '%',
                (Math.min(workload - 4, 1) * 100).toFixed(0) + '%'
            ])
        } else {
            setWorkloadEmote(undefined)
            setWorkloadBars(['0%', '0%', '0%', '0%', '0%'])
            setWorkloadHover('')
        }
    }, [workload])

    return (
        <div className={styles.container}>
            <div className={styles.overall}>
                <div className={styles.overallScore}>
                    {overall ? overall.toPrecision(2) : "--"}
                </div>
                <div className={styles.stars}>
                    {stars.map((star) => {
                        return <img src={star} className={styles.star} alt=''/>
                    })}
                </div>
                <div className={styles.centered}>
                    Overall Satisfaction
                </div>
            </div>
            <div className={styles.ratings}>
                <div className={styles.horizontal}>
                    <div className={styles.category}> Difficulty </div>
                    <div className={styles.bars}>
                        {difficultyBars.map((percent) => {
                            return <div className={styles.bar}
                                        style={{background: 'linear-gradient(to right, '+ difficultyColor +
                                                ' ' + percent + ', var(--clr-gray-200) 0%)'}}
                                    />
                        })}
                    </div>
                    <div className={styles.ratingNum}> {difficulty ? difficulty.toPrecision(2) : "-"} </div>
                    <img src={difficultyEmote}
                         className={styles.emote}
                         title={difficultyHover}
                         alt={difficultyHover}
                    />
                </div>
                <div className={styles.horizontal}>
                    <div className={styles.category}> Workload </div>
                    <div className={styles.bars}>
                        {workloadBars.map((percent) => {
                            return <div className={styles.bar}
                                        style={{background: 'linear-gradient(to right, '+ workloadColor +
                                                ' ' + percent + ', var(--clr-gray-200) 0%)'}}
                                    />
                        })}
                    </div>
                    <div className={styles.ratingNum}> {workload ? workload.toPrecision(2) : "-"} </div>
                    <img src={workloadEmote}
                         className={styles.emote}
                         title={workloadHover}
                         alt={workloadHover}
                    />
                </div>
            </div>
        </div>
    )
}

export default Gauges