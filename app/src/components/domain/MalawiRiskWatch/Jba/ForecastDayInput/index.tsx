import {
    Container,
    RawButton,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    formatNumber,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import { type JbaForecastDay } from '../utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props<NAME> {
    className?: string;
    name: NAME;
    days: JbaForecastDay[];
    value: number;
    onChange: (value: number, name: NAME) => void;
}

function ForecastDayInput<NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        days,
        value,
        onChange,
    } = props;

    const strings = useTranslation(i18n);

    const activeDay = days.find((day) => day.leadTimeDays === value);
    const maxImpact = Math.max(...days.map((day) => day.populationImpacted));

    return (
        <Container
            className={_cs(styles.forecastDayInput, className)}
            heading={isDefined(activeDay) && resolveToString(
                strings.jbaForecastDaySummary,
                {
                    day: activeDay.leadTimeDays,
                    date: formatDate(activeDay.targetDate) ?? '',
                },
            )}
            headingLevel={6}
            headerActions={isDefined(activeDay) && activeDay.populationImpacted > 0 && (
                <span className={styles.impact}>
                    {resolveToString(
                        strings.jbaForecastDayPeopleImpacted,
                        { count: formatNumber(Math.round(activeDay.populationImpacted)) },
                    )}
                </span>
            )}
            spacing="sm"
            withBorder
            withPadding
        >
            <div className={styles.bars}>
                {days.map((day) => {
                    const ratio = maxImpact > 0 ? day.populationImpacted / maxImpact : 0;
                    return (
                        <RawButton
                            key={day.leadTimeDays}
                            className={_cs(
                                styles.day,
                                day.leadTimeDays === value && styles.active,
                            )}
                            name={day.leadTimeDays}
                            onClick={(dayValue) => onChange(dayValue, name)}
                            title={formatNumber(Math.round(day.populationImpacted))}
                        >
                            <div className={styles.barTrack}>
                                <div
                                    className={styles.bar}
                                    style={{ height: `${Math.max(ratio * 100, 4)}%` }}
                                />
                            </div>
                            <div>
                                {resolveToString(
                                    strings.jbaForecastDayLead,
                                    { days: day.leadTimeDays },
                                )}
                            </div>
                        </RawButton>
                    );
                })}
            </div>
        </Container>
    );
}

export default ForecastDayInput;
