import React from 'react';
import styles from './styles.module.css';

interface Props {
  ratings: number[];
  colors: string[];
}

function Sparkline({ ratings, colors }: Props) {
    const bars = ratings.map((rating, index) => {
        let val = Math.floor(rating) + 1;
        if (val > 5) val = 5;
        return (
            <div
                key={index}
                className={styles.sparklineBar}
                style={{
                    height: `${(rating + 2) * 12}%`,
                    backgroundColor: colors[index],
                }}
            />
        );
    });

    return (
        <div className={styles.sparklineContainer}>
            {bars}
        </div>
    );
};

export default Sparkline;
