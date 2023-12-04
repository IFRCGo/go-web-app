import { useOutletContext } from 'react-router-dom';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';

import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';
import TextOutput from '#components/TextOutput';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        countryId,
        countryResponse,
    } = useOutletContext<CountryOutletContext>();
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

    return (
        <div className={styles.countryNsOverviewCapacity}>
            {isDefined(countryStatusResponse)
                && isDefined(countryStatusResponse.results)
                && countryStatusResponse.results.length > 0
                && (
                    <Container
                        heading={strings.nsPreparednessHeading}
                        headerDescription={strings.nsPreparednessDescription}
                        withHeaderBorder
                        contentViewType="grid"
                        numPreferredGridContentColumns={3}
                    >
                        {countryStatusResponse.results.map(
                            (perProcess) => (
                                <Container
                                    key={perProcess.id}
                                    heading={`Cycle ${perProcess.assessment_number}: ${countryResponse?.name} PER process`}
                                    headingLevel={4}
                                    withInternalPadding
                                >
                                    <TextOutput
                                        label="PER phase"
                                        value={perProcess.phase_display}
                                    />
                                    <TextOutput
                                        label="Assessment date"
                                        value={perProcess.date_of_assessment}
                                    />
                                    <TextOutput
                                        label="Type of Assessment"
                                        value="-"
                                    />
                                    <TextOutput
                                        label="PER focal point"
                                        value="-"
                                    />
                                </Container>
                            ),
                        )}
                    </Container>
                )}
        </div>
    );
}

Component.displayName = 'CountryNsOverviewCapacity';
