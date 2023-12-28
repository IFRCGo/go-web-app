import { ArrowRightUpLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import { components } from '#generated/types';
import { CountryOutletContext } from '#utils/outletContext';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CapacityItem = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['capacity']>[number];
type AssessmentTypeEnum = components<'read'>['schemas']['AssessmentTypeEnum'];

const TYPE_OCAC = 0 satisfies AssessmentTypeEnum;
const TYPE_BOCA = 1 satisfies AssessmentTypeEnum;

interface Props {
    capacity: CapacityItem;
}

function CapacityListItem(props: Props) {
    const {
        capacity,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Container
            key={capacity.id}
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
            {capacity?.assessment_type === TYPE_OCAC && (
                <TextOutput
                    label={strings.capacityListItemDateOfAssessment}
                    value={capacity?.submission_date}
                    valueType="date"
                    strongValue
                />
            )}
            {capacity?.assessment_type === TYPE_BOCA && (
                <TextOutput
                    label={strings.capacityListItemBranchName}
                    value={capacity?.branch_name}
                    valueType="text"
                    strongValue
                />
            )}
        </Container>
    );
}

export default CapacityListItem;
