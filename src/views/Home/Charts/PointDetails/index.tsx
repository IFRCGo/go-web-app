import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Aggregate {
    count: number;
    amount_funded: string;
    beneficiaries: number;
    timespan: string;
}

interface Props {
    data?: {
        date: Date;
        dref?: Aggregate;
        emergencyAppeal?: Aggregate;
    }
    action?: React.ReactNode;
    className?: string;
    heading?: React.ReactNode;
}

function PointDetails(props: Props) {
    const {
        className,
        data,
        action,
        heading,
    } = props;
    const strings = useTranslation(i18n);

    return (
        <Container
            className={_cs(styles.pointDetails, className)}
            childrenContainerClassName={styles.content}
            heading={heading}
            headingLevel={4}
            withHeaderBorder
            actions={action}
        >
            {data && (
                <>
                    <div className={styles.emergencyAppealDetails}>
                        <TextOutput
                            icon={<div className={styles.emergencyAppealPointIcon} />}
                            label={strings.timelineChartEmergencyAppealLabel}
                            value={data.emergencyAppeal?.count ?? 0}
                            valueType="number"
                            strongValue
                            strongLabel
                        />
                        <TextOutput
                            label={strings.timelineChartAmountFundedLabel}
                            value={Math.round(
                                Number(data.emergencyAppeal?.amount_funded),
                            )}
                            valueType="number"
                            strongValue
                        />
                        <TextOutput
                            label={strings.timelineChartPeopleTargetedLabel}
                            value={data.emergencyAppeal?.beneficiaries}
                            valueType="number"
                            strongValue
                        />
                    </div>
                    <div className={styles.drefDetails}>
                        <TextOutput
                            icon={<div className={styles.drefPointIcon} />}
                            label={strings.timelineChartDrefLabel}
                            value={data.dref?.count ?? 0}
                            valueType="number"
                            strongValue
                            strongLabel
                        />
                        <TextOutput
                            label={strings.timelineChartAmountFundedLabel}
                            value={Math.round(
                                Number(data.dref?.amount_funded),
                            )}
                            valueType="number"
                            strongValue
                        />
                        <TextOutput
                            label={strings.timelineChartPeopleTargetedLabel}
                            value={Number(data.dref?.beneficiaries) ?? '-'}
                            valueType="number"
                            strongValue
                        />
                    </div>
                </>
            )}
        </Container>
    );
}

export default PointDetails;
