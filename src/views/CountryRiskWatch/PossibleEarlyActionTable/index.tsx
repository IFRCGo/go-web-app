import { useMemo } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import Table from '#components/Table';
import { createStringColumn } from '#components/Table/ColumnShortcuts';
import Container from '#components/Container';
import Pager from '#components/Pager';
import SelectInput from '#components/SelectInput';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { useRiskRequest } from '#utils/restRequest';
import type { GoApiResponse, RiskApiResponse } from '#utils/restRequest';
import {
    numericIdSelector,
    stringKeySelector,
    stringNameSelector,
    stringValueSelector,
} from '#utils/selectors';
import type { components as riskApiComponents } from '#generated/riskTypes';

import i18n from './i18n.json';
import styles from './styles.module.css';

type HazardType = riskApiComponents['schemas']['HazardTypeEnum'];

type PossibleEarlyActionsResponse = RiskApiResponse<'/api/v1/early-actions/'>;
type ResponseItem = NonNullable<PossibleEarlyActionsResponse['results']>[number];
type CountryResponse = GoApiResponse<'/api/v2/country/{id}/'>;

interface Props {
    countryId: number;
    countryResponse: CountryResponse | undefined;
}

function PossibleEarlyActionTable(props: Props) {
    const {
        countryId,
        countryResponse,
    } = props;
    const strings = useTranslation(i18n);
    const {
        page,
        setPage,
        filter,
        filtered,
        setFilterField,
        limit,
        offset,
    } = useFilterState<{
        // FIXME hazardType should be HazardType
        // hazardType?: HazardType,
        hazardType?: string,
        sector?: string,
    }>(
        {},
        undefined,
        1,
        5,
    );

    const columns = useMemo(
        () => ([
            createStringColumn<ResponseItem, number>(
                'hazard_type_display',
                strings.earlyActionTableHazardTitle,
                (item) => item?.hazard_type_display,
            ),
            createStringColumn<ResponseItem, number>(
                'early_actions',
                strings.earlyActionTablePossibleActionTitle,
                (item) => item?.early_actions,
            ),
            createStringColumn<ResponseItem, number>(
                'location',
                strings.earlyActionTableLocationTitle,
                (item) => item?.location,
            ),
            createStringColumn<ResponseItem, number>(
                'sector',
                strings.earlyActionTableSectorTitle,
                (item) => item?.sectors_details?.map((d) => d.name).join(', '),
            ),
            createStringColumn<ResponseItem, number>(
                'intended_purpose',
                strings.earlyActionTablePurposeTitle,
                (item) => item?.intended_purpose,
            ),
            createStringColumn<ResponseItem, number>(
                'organization',
                strings.earlyActionTableOrganisationTitle,
                (item) => item?.organization,
            ),
            createStringColumn<ResponseItem, number>(
                'implementation_date_raw',
                strings.earlyActionTableDateTitle,
                (item) => item?.implementation_date_raw,
            ),
            createStringColumn<ResponseItem, number>(
                'impact_actions',
                strings.earlyActionTableImpactTitle,
                (item) => item?.impact_action,
            ),
            createStringColumn<ResponseItem, number>(
                'evidence_of_success',
                strings.earlyActionTableEvidenceTitle,
                (item) => item?.evidence_of_sucess,
            ),
        ]),
        [strings],
    );

    const {
        response: earlyActionsOptionsResponse,
    } = useRiskRequest({
        apiType: 'risk',
        url: '/api/v1/early-actions/options/',
    });

    const {
        pending: pendingPossibleEarlyAction,
        response: possibleEarlyActionResponse,
    } = useRiskRequest({
        skip: isNotDefined(countryId),
        apiType: 'risk',
        url: '/api/v1/early-actions/',
        query: {
            limit,
            offset,
            iso3: countryResponse?.iso3 ?? undefined,
            hazard_type: isDefined(filter.hazardType)
                ? [filter.hazardType] as HazardType[]
                : undefined,
            sectors: filter.sector,
        },
    });

    return (
        <Container
            className={styles.possibleEarlyActionTable}
            heading={strings.earlyActionTableHeading}
            filtersContainerClassName={styles.filters}
            withHeaderBorder
            filters={(
                <>
                    <SelectInput
                        placeholder={strings.earlyActionTableFilterHazardTypePlaceholder}
                        name="hazardType"
                        options={earlyActionsOptionsResponse?.hazard_type}
                        keySelector={stringKeySelector}
                        labelSelector={stringValueSelector}
                        value={filter.hazardType}
                        onChange={setFilterField}
                    />
                    <SelectInput
                        placeholder={strings.earlyActionTableFilterSectorPlaceholder}
                        name="sector"
                        options={earlyActionsOptionsResponse?.sectors}
                        keySelector={stringNameSelector}
                        labelSelector={stringNameSelector}
                        value={filter.sector}
                        onChange={setFilterField}
                    />
                </>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={possibleEarlyActionResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                className={styles.table}
                pending={pendingPossibleEarlyAction}
                filtered={filtered}
                data={possibleEarlyActionResponse?.results}
                columns={columns}
                keySelector={numericIdSelector}
                cellClassName={styles.cell}
            />
        </Container>
    );
}

export default PossibleEarlyActionTable;
