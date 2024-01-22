import { ArrowRightUpLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import DateOutput from '#components/DateOutput';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type CapacityItem = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['capacity']>[number];

interface Props {
    capacity: CapacityItem;
}

function OCACListItem(props: Props) {
    const {
        capacity,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Container
            className={styles.ocacListItem}
            heading={
                `${capacity.assessment_type_display.toUpperCase()}
                ${strings.capacityListItemAssessment}`
            }
            headingLevel={4}
            withInternalPadding
            actions={(
                <Link
                    href={capacity?.url}
                    variant="primary"
                    actions={<ArrowRightUpLineIcon />}
                    external
                >
                    {strings.capacityListItemViewDetails}
                </Link>
            )}
        >
            <div className={styles.ocacDetail}>
                <DateOutput
                    className={styles.date}
                    format="MMM yyyy"
                    value={capacity.submission_date}
                />
                <div className={styles.label}>
                    {strings.capacityListItemDateOfAssessment}
                </div>
            </div>
        </Container>
    );
}

export default OCACListItem;
