import { useMemo } from 'react';
import { ChartPoint } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
  startDate: string;
  endDate: string;
}

function DateProgressBar(props: Props) {
    const {
        startDate,
        endDate,
    } = props;
    const strings = useTranslation(i18n);

    const {
        progress,
        isActive,
        startDateValue,
        endDateValue,
    } = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();

        const startTime = start.getTime();
        const endTime = end.getTime();
        const todayTime = today.getTime();

        const totalSpan = endTime - startTime;
        const val = totalSpan > 0 ? ((todayTime - startTime) / totalSpan) * 100 : 0;

        return {
            progress: Math.min(100, Math.max(0, val)),
            isActive: todayTime >= startTime && todayTime <= endTime,
            startDateValue: start.toLocaleDateString(),
            endDateValue: end.toLocaleDateString(),
        };
    }, [startDate, endDate]);

    const width = 200;
    const height = 20;
    const centerY = height / 2;
    const progressX = (progress / 100) * width;

    return (
        <div className={styles.container}>
            <div className={styles.timelineWrapper}>
                <div className={styles.titleStart}>
                    {strings.operationTimelineLabel}
                </div>
                <div className={styles.titleEnd}>
                    {strings.imminentDrefLabel}
                </div>
                <svg
                    className={styles.svg}
                    viewBox={`0 0 ${width} ${height}`}
                >
                    <line
                        className={styles.dashedSeparator}
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={height}
                    />
                    <line
                        className={styles.dashedSeparator}
                        x1={width}
                        y1={0}
                        x2={width}
                        y2={height}
                    />
                    <line
                        className={styles.track}
                        x1={0}
                        y1={centerY}
                        x2={width}
                        y2={centerY}
                    />
                    <line
                        className={styles.progress}
                        x1={0}
                        y1={centerY}
                        x2={progressX}
                        y2={centerY}
                    />
                    {isActive && (
                        <ChartPoint
                            className={styles.pointOutline}
                            x={progressX}
                            y={centerY}
                        />
                    )}
                </svg>
                <div className={styles.labelStart}>
                    <div className={styles.subLabel}>
                        {strings.startDateLabel}
                    </div>
                    <div className={styles.dateText}>
                        {startDateValue}
                    </div>
                </div>

                <div className={styles.labelEnd}>
                    <div className={styles.subLabel}>
                        {strings.endDateLabel}
                    </div>
                    <div className={styles.dateText}>
                        {endDateValue}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DateProgressBar;
