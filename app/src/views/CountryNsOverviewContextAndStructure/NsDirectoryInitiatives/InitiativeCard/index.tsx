import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
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
            // TODO: Verify Fund Name and and Fund Type
            headerDescription={(
                <TextOutput
                    label={strings.initiativeFundNameTitle}
                    value={initiative.fund_type}
                    valueType="text"
                    strongValue
                />
            )}
            footerContent={(
                <div className={styles.footerContent}>
                    <div className={styles.separator} />
                    <TextOutput
                        label={strings.initiativeAllocationTitle}
                        value={initiative.allocation}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.initiativeFundingPeriodTitle}
                        value={`${initiative.funding_period} ${strings.initiativeMonthsSuffix}`}
                        valueType="text"
                        strongValue
                    />
                </div>
            )}
        >
            <TextOutput
                label={strings.initiativeYearApprovedTitle}
                value={initiative.year}
                valueType="text"
                strongValue
            />
            <TextOutput
                label={strings.initiativeTitle}
                value={initiative.title}
                valueType="text"
                strongValue
            />
            <TextOutput
                label={strings.initiativeFundingTypeTitle}
                value={initiative.fund_type}
                valueType="text"
                strongValue
            />
            <TextOutput
                label={strings.initiativeCategoriesTitle}
                value={categories}
                valueType="text"
                strongValue
            />
        </Container>
    );
}

export default InitiativeCard;
