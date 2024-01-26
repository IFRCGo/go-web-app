import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowRightUpLineIcon } from '@ifrc-go/icons';
import {
    Container,
    KeyFigure,
    RawList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    unique,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { components } from '#generated/types';
import { CountryOutletContext } from '#utils/outletContext';

import OCACListItem from './OCACListItem';

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

    const ocacAssessments = countryResponse?.capacity?.filter(
        (item) => item.assessment_type === TYPE_OCAC,
    );

    const bocaAssessments = countryResponse?.capacity?.filter(
        (item) => item.assessment_type === TYPE_BOCA,
    );

    const uniqueLocalUnits = unique(
        bocaAssessments?.map(
            (bocaAsssement) => bocaAsssement.branch_name,
        ).filter(isDefined) ?? [],
    );

    const fdrsLink = countryResponse?.fdrs;

    return (
        <Container
            childrenContainerClassName={styles.countryNsCapacityStrengthening}
            heading={strings.countryNsCapacityStrengtheningHeading}
            headerDescription={strings.countryNsCapacityStrengtheningDescription}
            contentViewType="grid"
            numPreferredGridContentColumns={3}
            withHeaderBorder
        >
            {isDefined(ocacAssessments) && ocacAssessments.length > 0 && (
                <RawList
                    data={ocacAssessments}
                    keySelector={capacityKeySelector}
                    renderer={OCACListItem}
                    rendererParams={ocacRendererParams}
                />
            )}
            {isDefined(bocaAssessments) && bocaAssessments.length > 0 && (
                <Container
                    className={styles.capacityItem}
                    heading={strings.bocaAssessment}
                    headingLevel={4}
                    withInternalPadding
                    actions={(
                        <Link
                            href={`https://data.ifrc.org/en/BOCA/Form?donCode=${fdrsLink}`}
                            variant="primary"
                            actions={<ArrowRightUpLineIcon />}
                            external
                        >
                            {strings.viewDetails}
                        </Link>
                    )}
                >
                    <KeyFigure
                        className={styles.figure}
                        value={uniqueLocalUnits.length}
                        label={strings.localUnits}
                        compactValue
                    />
                </Container>
            )}
        </Container>
    );
}

export default CountryNsCapacityStrengthening;
