import { useOutletContext } from 'react-router-dom';
import { ArrowRightUpLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import Link from '#components/Link';
import TextOutput from '#components/TextOutput';
import { type components } from '#generated/types';
import useTranslation from '#hooks/useTranslation';
import { CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

type TypeOfAssessmentEnum = components<'read'>['schemas']['AssessmentTypeEnum'];
type AssessmentTypeEnum = components<'read'>['schemas']['AssessmentTypeEnum'];

const TYPE_OCAC = 0 satisfies AssessmentTypeEnum;
const TYPE_BOCA = 1 satisfies AssessmentTypeEnum;

function CountryNSCapacityStrengthening() {
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    return (
        <div className={styles.countryNsCapacityStrengthening}>
            <Container
                heading={strings.countryNsCapacityStrengtheningHeading}
                headerDescription={strings.countryNsCapacityStrengtheningDescription}
                withHeaderBorder
                contentViewType="grid"
                numPreferredGridContentColumns={3}
            >
                {countryResponse?.capacity.map((capacity) => (
                    <Container
                        heading={`${capacity.assessment_type_display.toUpperCase()}
                        ${strings.countryNsCapacityAssessment}`}
                        headingLevel={4}
                        withInternalPadding
                        className={styles.capacityItem}
                        actions={(
                            <Link
                                href={capacity?.url}
                                variant="primary"
                                actions={<ArrowRightUpLineIcon />}
                                external
                            >
                                {strings.countryNsCapacityViewDetails}
                            </Link>
                        )}
                    >
                        {capacity?.assessment_type === TYPE_OCAC && (
                            <TextOutput
                                label={strings.countryNsCapacityDateOfAssessment}
                                value={capacity?.submission_date}
                                valueType="date"
                                strongValue
                            />
                        )}
                        {capacity?.assessment_type === TYPE_BOCA && (
                            <TextOutput
                                label={strings.countryNsCapacityBranchName}
                                value={capacity?.branch_name}
                                valueType="text"
                                strongValue
                            />
                        )}
                    </Container>
                ))}
            </Container>
        </div>
    );
}

export default CountryNSCapacityStrengthening;
