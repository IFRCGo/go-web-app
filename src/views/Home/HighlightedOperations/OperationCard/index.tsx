import { _cs, sum } from '@togglecorp/fujs';
import Header from '#components/Header';
import Button from '#components/Button';
import DateOutput from '#components/DateOutput';
import NumberOutput from '#components/NumberOutput';
import KeyFigure from '#components/KeyFigure';
import { Emergency } from '#types/emergency';
import useTranslation from '#hooks/useTranslation';
import commonStrings from '#strings/common';
import { resolveToComponent } from '#utils/translation';

import SeverityIndicator from './SeverityIndicator';
import styles from './styles.module.css';

interface Props {
    className?: string;
    data: Emergency;
}

function OperationCard(props: Props) {
    const {
        className,
        data: {
            name,
            ifrc_severity_level,
            updated_at,
            appeals,
        },
    } = props;

    const strings = useTranslation('common', commonStrings);
    const targetedPopulation = sum(appeals.map((appeal) => appeal.num_beneficiaries));
    const amountRequested = sum(appeals.map((appeal) => +appeal.amount_requested));
    const amountFunded = sum(appeals.map((appeal) => +appeal.amount_funded));

    const coverage = 100 * amountFunded / amountRequested;
    const fundingCoverageDescription = resolveToComponent(
        strings.operationCardFundingCoverage,
        { coverage: <NumberOutput value={coverage} /> },
    );

    return (
        <div className={_cs(styles.operationCard, className)}>
            <Header
                className={styles.header}
                icons={(
                    <SeverityIndicator
                        level={ifrc_severity_level}
                    />
                )}
                heading={name}
                headingLevel={4}
                actions={(
                    <Button name={undefined}>
                        Follow
                    </Button>
                )}
            />
            <div className={styles.lastUpdated}>
                <div className={styles.label}>
                    {strings.operationCardLastUpdated}
                </div>
                <DateOutput
                    value={updated_at}
                />
            </div>
            <div className={styles.divider} />
            <div className={styles.figures}>
                <KeyFigure
                    className={styles.figure}
                    value={targetedPopulation}
                    description={strings.operationCardTargetedPopulation}
                    normalize
                />
                <div className={styles.separator} />
                <KeyFigure
                    className={styles.figure}
                    value={amountRequested}
                    description={strings.operationCardFunding}
                    normalize
                    progress={100 * amountFunded / amountRequested}
                    progressDescription={fundingCoverageDescription}
                />
            </div>
        </div>
    );
}

export default OperationCard;
