import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowRightUpLineIcon } from '@ifrc-go/icons';
import {
    isDefined,
    listToGroupList,
    mapToList,
    unique,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import List from '#components/List';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { components } from '#generated/types';
import { CountryOutletContext } from '#utils/outletContext';

import OCACListItem from './OCACListItem';
import BOCAListItem from './BOCAListItem';

import i18n from './i18n.json';
import styles from './styles.module.css';

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

    const ocacRendererParams = useCallback(
        (_: number, capacity: CapacityItem) => ({
            capacity,
        }),
        [],
    );

    const bocaRendererParams = useCallback(
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

    const ocacAssessments = countryResponse?.capacity?.filter(
        (item) => item.assessment_type === TYPE_OCAC,
    );

    const bocaAssessments = countryResponse?.capacity?.filter(
        (item) => item.assessment_type === TYPE_BOCA,
    );

    const uniqueBocaItem = unique(bocaAssessments?.map((i) => i.branch_name));

    const bocaAssessmentsTitle = countryResponse?.capacity.map((i) => i.assessment_type_display);
    const uniqueBocaTitle = unique(bocaAssessmentsTitle);

    const fdrsLink = countryResponse?.fdrs;

    return (
        <Container
            childrenContainerClassName={styles.countryNsCapacityStrengthening}
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
                    renderer={OCACListItem}
                    rendererParams={ocacRendererParams}
                    compact
                />
            )}
            {isDefined(bocaAssessments) && (
                <Container
                    className={styles.capacityItem}
                    heading={
                        `${uniqueBocaTitle}
                    ${strings.capacityListItemAssessment}`
                    }
                    headingLevel={4}
                    contentViewType="grid"
                    withInternalPadding
                    actions={(
                        <Link
                            href={`https://data.ifrc.org/en/BOCA/Form?donCode=${fdrsLink}`}
                            variant="primary"
                            actions={<ArrowRightUpLineIcon />}
                            external
                        >
                            View Details
                        </Link>
                    )}
                >
                    <TextOutput
                        label="Branch"
                        value={uniqueBocaItem.length}
                        valueType="text"
                        strongValue
                    />
                </Container>
            )}
        </Container>
    );
}

export default CountryNsCapacityStrengthening;
