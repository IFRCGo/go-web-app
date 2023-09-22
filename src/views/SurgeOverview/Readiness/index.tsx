import {
    useCallback,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import useFilterState from '#hooks/useFilterState';
import Button from '#components/Button';
import CheckList from '#components/Checklist';
import Grid from '#components/Grid';
import Pager from '#components/Pager';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { type components } from '#generated/types';

import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import EmergencyResponseUnitOwnerCard from './EmergencyResponseUnitOwnerCard';
import i18n from './i18n.json';
import styles from './styles.module.css';

type DeploymentsEruTypeEnum = components<'read'>['schemas']['DeploymentsEruTypeEnum'];

type GetERUOwnersResponse = GoApiResponse<'/api/v2/eru_owner/'>;
type ERUOwnerListItem = NonNullable<GetERUOwnersResponse['results']>[number];

const PAGE_SIZE = 10;

const eruOwnerKeySelector = (item: ERUOwnerListItem) => item.id;

const emergencyResponseUnitTypeKeySelector = (item: DeploymentsEruTypeEnum) => item.key;
const emergencyResponseUnitTypeLabelSelector = (item: DeploymentsEruTypeEnum) => item.value ?? '?';

function Readiness() {
    const strings = useTranslation(i18n);

    const {
        page,
        setPage,
        filter,
        setFilterField,
        setFilter,
        filtered,
        limit,
        offset,
    } = useFilterState<{ selectedERUTypes?: DeploymentsEruTypeEnum['key'][] }>({
        filter: {},
        pageSize: 10,
    });

    const {
        error: eruOwnersError,
        pending: eruOwnersPending,
        response: eruOwnersResponse,
    } = useRequest({
        url: '/api/v2/eru_owner/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            eru_type: filter.selectedERUTypes,
            available: isDefined(filter.selectedERUTypes) && filter.selectedERUTypes.length > 0
                ? true
                : undefined,
        },
    });

    const {
        deployments_eru_type,
    } = useGlobalEnums();

    const rendererParams = useCallback((_: number, eruOwner: ERUOwnerListItem) => ({
        data: eruOwner,
    }), []);

    const handleClearFilter = useCallback(() => {
        setFilter({});
    }, [setFilter]);

    return (
        <Container
            className={styles.eruOwnersTable}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={eruOwnersResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
            childrenContainerClassName={styles.content}
            filtersContainerClassName={styles.filters}
            filters={(
                <Container
                    heading={strings.eruOwnersTableFilterReady}
                    headingLevel={3}
                    childrenContainerClassName={styles.filterContainer}
                >
                    <CheckList
                        listContainerClassName={styles.checklistContainer}
                        name="selectedERUTypes"
                        options={deployments_eru_type}
                        value={filter.selectedERUTypes}
                        keySelector={emergencyResponseUnitTypeKeySelector}
                        labelSelector={emergencyResponseUnitTypeLabelSelector}
                        onChange={setFilterField}
                    />
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleClearFilter}
                        disabled={!filtered}
                    >
                        {strings.eruOwnersTableFilterClear}
                    </Button>
                </Container>
            )}
        >
            <Container
                heading={resolveToString(
                    strings.eruOwnersTableHeading,
                    { count: eruOwnersResponse?.count },
                )}
                headingLevel={3}
            >
                <Grid
                    numPreferredColumns={3}
                    data={eruOwnersResponse?.results}
                    pending={eruOwnersPending}
                    errored={isDefined(eruOwnersError)}
                    filtered={filtered}
                    keySelector={eruOwnerKeySelector}
                    renderer={EmergencyResponseUnitOwnerCard}
                    rendererParams={rendererParams}
                />
            </Container>
        </Container>
    );
}

export default Readiness;
