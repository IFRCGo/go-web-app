import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { isDefined, isNotDefined, listToGroupList, mapToList, unique } from '@togglecorp/fujs';

import Container from '#components/Container';
import List from '#components/List';
import useTranslation from '#hooks/useTranslation';
import { components } from '#generated/types';
import { CountryOutletContext } from '#utils/outletContext';

import CapacityListItem from './CapacityListItem';

import i18n from './i18n.json';
import styles from './styles.module.css';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import { ArrowRightUpLineIcon } from '@ifrc-go/icons';

export type CapacityItem = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['capacity']>[number];
export type AssessmentTypeEnum = components<'read'>['schemas']['AssessmentTypeEnum'];

const TYPE_BOCA = 1 satisfies AssessmentTypeEnum;
const TYPE_OCAC = 0 satisfies AssessmentTypeEnum;

function capacityKeySelector(option: CapacityItem) {
    return option.id;
}

function CountryNsCapacityStrengthening() {
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const rendererParams = useCallback(
        (_: number, capacity: CapacityItem) => ({
            capacity,
        }),
        [],
    );

    const groupedBocaAssessmentByType = (
        listToGroupList(
            countryResponse?.capacity,
            (item) => item.assessment_type,
            (item) => item,
        )
    );

    const groupedBocaList = mapToList(
        groupedBocaAssessmentByType,
        (boca, bocaType) => ({ count: boca.length, bocaType }),
    );

    const bocaAssessmentCount = groupedBocaList?.map((i) => i.count);

    console.info('boca count', bocaAssessmentCount);
    // const capacityOCAC = countryResponse?.capacity?.map((i) => i.assessment_type);

    const ocacAssessments = countryResponse?.capacity?.filter(
        (item) => item.assessment_type === TYPE_OCAC
    );

    const bocaAssessments = countryResponse?.capacity?.filter(
        (item) => item.assessment_type === TYPE_BOCA
    ).length;

    const capacityAssessmentTypeDisplay = countryResponse?.capacity?.map((i) => i.assessment_type_display);

    return (
        <Container
            className={styles.countryNsCapacityStrengthening}
            heading={strings.countryNsCapacityStrengtheningHeading}
            headerDescription={strings.countryNsCapacityStrengtheningDescription}
            withHeaderBorder
        >
            {isDefined(ocacAssessments) && (
                <List
                    className={styles.capacityListContainer}
                    errored={false}
                    pending={false}
                    filtered={false}
                    data={ocacAssessments}
                    keySelector={capacityKeySelector}
                    renderer={CapacityListItem}
                    rendererParams={rendererParams}
                    compact
                />
            )}
            {/* {isNotDefined(bocaAssessments) && ( */}
                <Container
                    className={styles.capacityItem}
                    heading={
                        `${capacityAssessmentTypeDisplay}
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
                    <TextOutput
                        label={strings.capacityListItemBranchName}
                        value={bocaAssessments}
                        // valueType="text"
                        strongValue
                    />
                </Container>
            {/* )} */}
        </Container>
    );
}

export default CountryNsCapacityStrengthening;
