import { useOutletContext } from 'react-router-dom';
import {
    BlockLoading,
    Container,
    Message,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { REGION_ASIA } from '#utils/constants';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import CountryNsCapacityStrengthening from './CountryNsCapacityStrengthening';
import CountryNsOrganisationalCapacity from './CountryNsOrganisationalCapacity';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();

    const strings = useTranslation(i18n);

    const {
        pending: countryStatusPending,
        response: countryStatusResponse,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/per-process-status/',
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
            {countryResponse?.region === REGION_ASIA && (
                <CountryNsOrganisationalCapacity />
            )}
            <CountryNsCapacityStrengthening />
            {countryStatusPending && <BlockLoading className={styles.loading} />}
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
                            withInternalPadding
                            className={styles.perCycleItem}
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
                        >
                            <TextOutput
                                label={strings.perPhaseLabel}
                                value={perProcess.phase_display}
                            />
                            <TextOutput
                                label={strings.perAssessmentDateLabel}
                                value={perProcess.date_of_assessment}
                            />
                        </Container>
                    ),
                )}
            </Container>
        </Container>
    );
}

Component.displayName = 'CountryNsOverviewCapacity';
