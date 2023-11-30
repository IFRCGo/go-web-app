import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { compareNumber, isDefined, isNotDefined } from '@togglecorp/fujs';

import PieChart from '#components/PieChart';
import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import InfoPopup from '#components/InfoPopup';

import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { useRequest } from '#utils/restRequest';
import { type GoApiResponse } from '#utils/restRequest';
import { CountryOutletContext } from '#utils/outletContext';
import { sumSafe } from '#utils/common';
import {
    numericCountSelector,
    stringTitleSelector,
} from '#utils/selectors';

import { type FilterValue } from '#views/EmergencyActivities/Filters';
import useEmergencyProjectStats from '#views/EmergencyActivities/useEmergencyProjectStats';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EmergencyProjectResponse = GoApiResponse<'/api/v2/emergency-project/'>;
type EmergencyProject = NonNullable<EmergencyProjectResponse['results']>[number];

type ProjectKey = 'reporting_ns' | 'deployed_eru' | 'status' | 'country' | 'districts';
type FilterKey = ProjectKey | 'sector';
const ITEM_PER_PAGE = 10;
const MAX_ITEMS = 4;

const primaryRedColorShades = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-60)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

function filterEmergencyProjects(
    emergencyProjectList: EmergencyProject[],
    filters: Partial<Record<FilterKey, (number | string)[]>>,
) {
    return emergencyProjectList.filter((emergencyProject) => (
        Object.entries(filters).every(([filterKey, filterValue]) => {
            if (isNotDefined(filterValue) || filterValue.length === 0) {
                return true;
            }
            if (filterKey === 'sector') {
                const projectValue = emergencyProject.activities
                    ?.map((activity) => activity.sector) ?? undefined;
                return projectValue?.some((v) => filterValue.includes(v));
            }
            const projectValue = emergencyProject[filterKey as ProjectKey];

            if (isNotDefined(projectValue)) {
                return false;
            }

            if (Array.isArray(projectValue)) {
                return projectValue.some((v) => filterValue.includes(v));
            }

            return filterValue.includes(projectValue);
        })
    ));
}

function getAggregatedValues(values: { title: string, count: number }[]) {
    const sortedValues = [...values].sort((a, b) => compareNumber(b.count, a.count));

    if (sortedValues.length <= MAX_ITEMS) {
        return sortedValues;
    }

    const remains = sortedValues.splice(
        MAX_ITEMS - 1,
        sortedValues.length - (MAX_ITEMS - 1),
    );
    const otherCount = sumSafe(remains.map((d) => d.count));
    if (isDefined(otherCount) && otherCount > 0) {
        sortedValues.push({
            title: 'Others',
            count: otherCount,
        });
    }

    return sortedValues;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useOutletContext<CountryOutletContext>();
    const strings = useTranslation(i18n);

    const {
        filter: filters,
    } = useFilterState<FilterValue>({
        filter: {
            reporting_ns: [],
            deployed_eru: [],
            sector: [],
            status: [],
            country: [],
            districts: [],
        },
        pageSize: ITEM_PER_PAGE,
    });

    const {
        response: emergencyProjectListResponse,
        pending: emergencyProjectListResponsePending,
    } = useRequest({
        url: '/api/v2/emergency-project/',
        preserveResponse: true,
        skip: (isNotDefined(countryId)),
        query: isDefined(countryId) ? {
            country: [Number(countryId)],
            limit: 9999,
        } : undefined,
    });

    const filteredProjectList = filterEmergencyProjects(
        emergencyProjectListResponse?.results ?? [],
        filters,
    );

    const {
        emergencyProjectCountListBySector,
        emergencyProjectCountListByStatus,
        peopleReached,
        uniqueEruCount,
        uniqueNsCount,
        uniqueSectorCount,
    } = useEmergencyProjectStats(
        emergencyProjectListResponse?.results,
        filteredProjectList,
    );

    const aggreatedProjectCountListBySector = useMemo(() => (
        getAggregatedValues(emergencyProjectCountListBySector)
    ), [emergencyProjectCountListBySector]);

    const aggreatedProjectCountListByStatus = useMemo(() => (
        getAggregatedValues(emergencyProjectCountListByStatus)
    ), [emergencyProjectCountListByStatus]);

    return (
        <div className={styles.threewActivities}>
            <Container>
                {emergencyProjectListResponsePending && <BlockLoading />}
                {!emergencyProjectListResponsePending && (
                    <div className={styles.keyFigureCardList}>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={(uniqueNsCount + uniqueEruCount)}
                                label={strings.uniqueEruAndNationalSocietyCount}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                value={peopleReached}
                                label={strings.peopleInNeedReached}
                                info={(
                                    <InfoPopup
                                        description={strings.peopleReachedTooltip}
                                    />
                                )}
                                compactValue
                            />
                        </div>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={uniqueSectorCount}
                                label={strings.uniqueSectorCount}
                            />
                            <PieChart
                                className={styles.pieChart}
                                data={aggreatedProjectCountListBySector}
                                valueSelector={numericCountSelector}
                                labelSelector={stringTitleSelector}
                                keySelector={stringTitleSelector}
                                colors={primaryRedColorShades}
                                pieRadius={40}
                                chartPadding={10}
                            />
                        </div>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={emergencyProjectListResponse?.count}
                                label={strings.totalActivities}
                            />
                            <PieChart
                                className={styles.pieChart}
                                data={aggreatedProjectCountListByStatus}
                                valueSelector={numericCountSelector}
                                labelSelector={stringTitleSelector}
                                keySelector={stringTitleSelector}
                                colors={primaryRedColorShades}
                                pieRadius={40}
                                chartPadding={10}
                            />
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}

Component.displayName = 'CountryOngoingActivitiesThreeWActivities';
