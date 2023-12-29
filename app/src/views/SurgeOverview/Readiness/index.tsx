import { useCallback } from 'react';
import {
    Button,
    Checklist,
    Container,
    Grid,
    Pager,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

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
        rawFilter,
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
            heading={resolveToString(
                strings.readinessTitle,
                { count: eruOwnersResponse?.count ?? '--' },
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={eruOwnersResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
            childrenContainerClassName={styles.content}
            actions={(
                <Button
                    name={undefined}
                    variant="secondary"
                    onClick={handleClearFilter}
                    disabled={!filtered}
                >
                    {strings.eruOwnersTableFilterClear}
                </Button>
            )}
            withGridViewInFilter
            filters={(
                <Checklist
                    className={styles.checklist}
                    listContainerClassName={styles.checklistContainer}
                    name="selectedERUTypes"
                    options={deployments_eru_type}
                    value={rawFilter.selectedERUTypes}
                    keySelector={emergencyResponseUnitTypeKeySelector}
                    labelSelector={emergencyResponseUnitTypeLabelSelector}
                    onChange={setFilterField}
                />
            )}
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
    );
}

export default Readiness;
