import {
    Container,
    NumberOutput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

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
            childrenContainerClassName={styles.content}
            headingLevel={4}
            withHeaderBorder
            heading={initiative.title}
            headerDescription={resolveToString(
                strings.initiativeFund,
                {
                    fundType: initiative.fund_type,
                },
            )}
            footerClassName={styles.footer}
            footerContent={(
                <TextOutput
                    label={strings.initiativeCategoriesTitle}
                    value={categories}
                    valueType="text"
                    strongValue
                    withoutLabelColon
                />
            )}
        >
            <TextOutput
                className={styles.textOutput}
                value={resolveToString(
                    strings.initiativeYearApprovedAndDuration,
                    {
                        yearApproved: initiative.year,
                        duration: initiative.funding_period,
                    },
                )}
                description={strings.initiativeYearApprovedTitle}
                strongValue
                withoutLabelColon
            />
            <div className={styles.verticalSeparator} />
            <TextOutput
                className={styles.textOutput}
                value={(
                    <NumberOutput
                        value={initiative.allocation}
                    />
                )}
                description={strings.initiativeAllocationTitle}
                strongValue
                withoutLabelColon
            />
        </Container>
    );
}

export default InitiativeCard;
