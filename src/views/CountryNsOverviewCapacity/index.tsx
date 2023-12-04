import { useOutletContext } from 'react-router-dom';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import Message from '#components/Message';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { resolveToString } from '#utils/translation';

import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useOutletContext<CountryOutletContext>();

    const strings = useTranslation(i18n);

    const {
        // pending: countryStatusPending,
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
        <div className={styles.countryNsOverviewCapacity}>
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
                        Start PER Process
                    </Link>
                )}
            >
                {!hasPer && (
                    <Message
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
                                    urlParams={{ countryId }}
                                    variant="secondary"
                                >
                                    View
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
        </div>
    );
}

Component.displayName = 'CountryNsOverviewCapacity';
