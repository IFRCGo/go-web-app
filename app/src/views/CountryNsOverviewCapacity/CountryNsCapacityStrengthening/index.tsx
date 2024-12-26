import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    KeyFigure,
    RawList,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    unique,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type components } from '#generated/types';
import { type CountryOutletContext } from '#utils/outletContext';

import OCACListItem from './OCACListItem';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CapacityItem = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['capacity']>[number];
type AssessmentTypeEnum = components<'read'>['schemas']['AssessmentTypeEnum'];

const TYPE_BOCA = 1 satisfies AssessmentTypeEnum;
const TYPE_OCAC = 0 satisfies AssessmentTypeEnum;

function capacityKeySelector(option: CapacityItem) {
    return option.id;
}

function CountryNsCapacityStrengthening() {
    const strings = useTranslation(i18n);

    const { countryResponse, countryResponsePending } = useOutletContext<CountryOutletContext>();

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
            (bocaAssessment) => bocaAssessment.branch_name,
        ).filter(isDefined) ?? [],
    );

    const hasOcacAssessments = isDefined(ocacAssessments) && ocacAssessments.length > 0;
    const hasBocaAssessments = isDefined(bocaAssessments) && bocaAssessments.length > 0;

    const isEmpty = !hasOcacAssessments && !hasBocaAssessments;

    return (
        <Container
            childrenContainerClassName={styles.countryNsCapacityStrengthening}
            heading={strings.countryNsCapacityStrengtheningHeading}
            headerDescription={strings.countryNsCapacityStrengtheningDescription}
            contentViewType="grid"
            numPreferredGridContentColumns={3}
            withHeaderBorder
            footerActions={!isEmpty && (
                <TextOutput
                    label={strings.moreDetailsLabel}
                    value={(
                        <Link
                            variant="tertiary"
                            href="https://data.ifrc.org/en/ocac"
                            external
                            withUnderline
                        >
                            {strings.globalOCAC}
                        </Link>
                    )}
                />
            )}
            pending={countryResponsePending}
            empty={isEmpty}
        >
            <RawList
                data={ocacAssessments}
                keySelector={capacityKeySelector}
                renderer={OCACListItem}
                rendererParams={ocacRendererParams}
            />
            {hasBocaAssessments && (
                <Container
                    className={styles.capacityItem}
                    heading={strings.bocaAssessment}
                    headingLevel={4}
                    withInternalPadding
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
