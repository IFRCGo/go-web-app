import { ArrowRightUpLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';

import { CapacityItem } from '../../CountryNsCapacityStrengthening';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
            className={styles.capacityItem}
            heading={
                `${capacity.assessment_type_display.toUpperCase()}
                ${strings.capacityListItemAssessment}`
            }
            headingLevel={4}
            contentViewType="grid"
            numPreferredGridContentColumns={3}
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
            <TextOutput
                label={strings.capacityListItemDateOfAssessment}
                value={capacity?.submission_date}
                valueType="date"
                strongValue
            />
        </Container>
    );
}

export default OCACListItem;
