import { useOutletContext } from 'react-router-dom';
import {
    BlockLoading,
    Container,
    Message,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import CountryNsCapacityStrengthening from './CountryNsCapacityStrengthening';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useOutletContext<CountryOutletContext>();

    const strings = useTranslation(i18n);

    const {
        pending: countryStatusPending,
        response: countryStatusResponse,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/public-per-process-status/',
        query: {
            country: isDefined(countryId) ? [Number(countryId)] : undefined,
            limit: 9999,
        },
    });

    const hasPer = isDefined(countryStatusResponse)
        && isDefined(countryStatusResponse.results)
        && countryStatusResponse.results.length > 0;

    return (
        <Container
            className={styles.nsOverviewCapacity}
            childrenContainerClassName={styles.countryNsOverviewCapacity}
            headerDescription={strings.nSOverviewCapacityDescription}
            headerDescriptionContainerClassName={styles.nsOverviewCapacityDescription}
            actions={(
                <Link
                    href="https://www.ifrc.org/evaluations/"
                    external
                    withLinkIcon
                    variant="primary"
                >
                    {strings.nsOverviewCapacityLink}
                </Link>
            )}
        >
            {/* Data is currently under review, it will be include in the next version */}
            {/* Hide this section */}
            {/* {countryResponse?.region === REGION_ASIA && (
                <CountryNsOrganisationalCapacity />
            )} */}
            <CountryNsCapacityStrengthening />
            {countryStatusPending && <BlockLoading />}
            <Container
                heading={strings.nsPreparednessHeading}
                headerDescription={strings.nsPreparednessDescription}
                withHeaderBorder
                contentViewType="grid"
                numPreferredGridContentColumns={3}
                actions={(
                    <Link
                        to="newPerOverviewForm"
                        variant="primary"
                    >
                        {strings.perStartPerProcess}
                    </Link>
                )}
            >
                {!hasPer && (
                    <Message
                        className={styles.emptyMessage}
                        // TODO: add appropriate message
                        title="Data not available!"
                    />
                )}
                {hasPer && countryStatusResponse?.results?.map(
                    (perProcess) => (
                        <Container
                            key={perProcess.id}
                            heading={
                                resolveToString(
                                    strings.perCycleHeading,
                                    {
                                        cycle: perProcess.assessment_number,
                                        countryName: perProcess.country_details.name,
                                    },
                                )
                            }
                            headingLevel={4}
                            headerDescription={
                                resolveToString(
                                    strings.perCycleHeadingDescription,
                                    {
                                        updatedDate: formatDate(perProcess.updated_at),
                                    },
                                )
                            }
                            withHeaderBorder
                            withInternalPadding
                            className={styles.perCycleItem}
                            childrenContainerClassName={styles.figures}
                            footerContentClassName={styles.footerFigures}
                            actions={(
                                <Link
                                    to="countryPreparedness"
                                    urlParams={{
                                        countryId,
                                        perId: perProcess.id,
                                    }}
                                    variant="secondary"
                                >
                                    {strings.perViewLink}
                                </Link>
                            )}
                            footerContent={(
                                <>
                                    <div className={styles.separator} />
                                    <TextOutput
                                        label={strings.perTypeOfAssessmentLabel}
                                        value={perProcess.type_of_assessment_details.name}
                                    />
                                    <TextOutput
                                        label={strings.perFocalPointLabel}
                                        value={`${perProcess.ns_focal_point_name
                                            ? perProcess.ns_focal_point_name
                                            : '-'} | ${
                                            perProcess.ns_focal_point_email
                                                ? perProcess.ns_focal_point_email
                                                : '-'}`}
                                    />
                                </>
                            )}

                        >
                            <div className={styles.phaseAssessmentDateSection}>
                                <div className={styles.phaseAssessmentValue}>
                                    {perProcess.phase_display}
                                </div>
                                <div className={styles.phaseAssessmentLabel}>
                                    {strings.perPhaseLabel}
                                </div>
                            </div>
                            <div className={styles.verticalSeparator} />
                            <div className={styles.phaseAssessmentDateSection}>
                                <div className={styles.phaseAssessmentValue}>
                                    {perProcess.date_of_assessment}
                                </div>
                                <div className={styles.phaseAssessmentLabel}>
                                    {strings.perAssessmentDateLabel}
                                </div>
                            </div>
                        </Container>
                    ),
                )}
            </Container>
        </Container>
    );
}

Component.displayName = 'CountryNsOverviewCapacity';
