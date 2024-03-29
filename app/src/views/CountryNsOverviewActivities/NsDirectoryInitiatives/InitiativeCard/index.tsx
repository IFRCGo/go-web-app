import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';

import { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountryResponse = NonNullable<GoApiResponse<'/api/v2/country/{id}/'>>
interface Props {
    className?: string;
    initiative: NonNullable<CountryResponse['initiatives']>[number];
}

function InitiativeCard(props: Props) {
    const {
        className,
        initiative,
    } = props;

    const strings = useTranslation(i18n);
    const categories = initiative.categories?.join(', ');

    return (
        <Container
            className={_cs(styles.initiativeCard, className)}
            childrenContainerClassName={styles.figures}
            headingLevel={4}
            withHeaderBorder
            heading={strings.initiativeFundNameTitle}
            headerDescription={resolveToString(
                strings.initiativeFund,
                {
                    fundType: initiative.fund_type,
                },
            )}
            footerContent={(
                <div className={styles.footerContent}>
                    <div className={styles.separator} />
                    <TextOutput
                        label={strings.initiativeTitle}
                        value={initiative.title}
                        valueType="text"
                        strongValue
                    />
                    <TextOutput
                        label={strings.initiativeCategoriesTitle}
                        value={categories}
                        valueType="text"
                        strongValue
                    />
                </div>
            )}
        >
            <div className={styles.yearAllocationSection}>
                <div className={styles.yearAllocationValue}>
                    {resolveToString(
                        strings.initiativeYearApprovedAndDuraton,
                        {
                            yearApproved: initiative.year,
                            duration: initiative.funding_period,
                        },
                    )}
                </div>
                <div className={styles.yearAllocationLabel}>
                    {strings.initiativeYearApprovedTitle}
                </div>
            </div>
            <div className={styles.verticalSeparator} />
            <div className={styles.yearAllocationSection}>
                <div className={styles.yearAllocationValue}>
                    {initiative.allocation}
                </div>
                <div className={styles.yearAllocationLabel}>
                    {strings.initiativeAllocationTitle}
                </div>
            </div>
        </Container>
    );
}

export default InitiativeCard;
