import { ArrowRightUpLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';

import { CapacityItem } from '../../CountryNsCapacityStrengthening';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    capacity: CapacityItem;
}

function BOCAListItem(props: Props) {
    const {
        capacity,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Container
            className={styles.capacityItem}
            heading={
                `${capacity.assessment_type_display}
                ${strings.capacityListItemAssessment}`
            }
            headingLevel={4}
            contentViewType="grid"
            numPreferredGridContentColumns={3}
            withInternalPadding
            actions={(
                <Link
                    href={undefined}
                    variant="primary"
                    actions={<ArrowRightUpLineIcon />}
                    external
                >
                    {strings.capacityListItemViewDetails}
                </Link>
            )}
        >
            {/* <TextOutput
                label={strings.capacityListItemBranchName}
                value={bocaAssessments}
                // valueType="text"
                strongValue
            /> */}
        </Container>
    );
}

export default BOCAListItem;
