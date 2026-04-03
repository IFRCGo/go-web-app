import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    getNumberOfDays,
} from '@ifrc-go/ui/utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    imminentStartDate: string | Date;
    operationEndDate: string | Date;
    forecastDate: string | Date;
    heading: string;
}

function TimelineBar(props: Props) {
    const {
        imminentStartDate,
        operationEndDate,
        forecastDate,
        heading,
    } = props;

    const strings = useTranslation(i18n);
    const start = new Date(imminentStartDate);
    const end = new Date(operationEndDate);
    const fDate = new Date(forecastDate);
    const today = new Date();

    const totalDuration = getNumberOfDays(start, end) || 1;

    const getPosition = (targetDate: Date) => {
        const daysFromStart = getNumberOfDays(start, targetDate) ?? 0;
        const percentage = (daysFromStart / totalDuration) * 100;
        return Math.min(Math.max(percentage, 0), 100);
    };

    return (
        <Container
            heading={heading}
            withHeaderBorder
        >
            <div className={styles.timelineContainer}>
                <div className={styles.mainLine} />
                <div
                    className={styles.todayIndicator}
                    style={{ left: `${getPosition(today)}%` }}
                >
                    <span className={styles.todayLabel}>
                        {strings.todayLabel}
                    </span>
                </div>

                <div
                    className={styles.startMilestone}
                    style={{ left: '1%' }}
                >
                    <TextOutput
                        labelClassName={styles.redLabel}
                        label={strings.startDateLabel}
                        value={formatDate(start)}
                        withoutLabelColon
                        strongLabel
                    />
                    <div className={styles.markerTop} />
                </div>

                <div
                    className={styles.forecastMilestone}
                    style={{ left: `${getPosition(fDate)}%` }}
                >
                    <div className={styles.markerBottom} />
                    <TextOutput
                        label={strings.forecastLabel}
                        value={formatDate(fDate)}
                        withoutLabelColon
                        strongLabel
                    />
                </div>

                <div
                    className={styles.endMilestone}
                    style={{ right: '1%' }}
                >
                    <TextOutput
                        labelClassName={styles.redLabel}
                        label={strings.operationEnd}
                        value={formatDate(end)}
                        withoutLabelColon
                        strongLabel
                    />
                    <div className={styles.markerTop} />
                </div>
            </div>
        </Container>
    );
}

export default TimelineBar;
