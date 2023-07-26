import { useMemo, useState } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import Table from '#components/Table';
import { createStringColumn } from '#components/Table/ColumnShortcuts';
import Container from '#components/Container';
import Pager from '#components/Pager';
import SelectInput from '#components/SelectInput';
import useInputState from '#hooks/useInputState';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
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

const ITEM_PER_PAGE = 5;

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
    const [page, setPage] = useState(1);

    const [hazardType, setHazardType] = useInputState<string | undefined>(undefined);
    const [sector, setSector] = useInputState<string | undefined>(undefined);

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
    } = useRequest({
        apiType: 'risk',
        url: '/api/v1/early-actions/options/',
    });

    const {
        pending: pendingPossibleEarlyAction,
        response: possibleEarlyActionResponse,
    } = useRequest({
        skip: isNotDefined(countryId),
        apiType: 'risk',
        url: '/api/v1/early-actions/',
        query: {
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (page - 1),
            iso3: countryResponse?.iso3 ?? undefined,
            hazard_type: [hazardType] as HazardType[],
            sectors: sector,
        },
    });

    const filtered = isDefined(hazardType) || isDefined(sector);

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
                        name={undefined}
                        options={earlyActionsOptionsResponse?.hazard_type}
                        keySelector={stringKeySelector}
                        labelSelector={stringValueSelector}
                        value={hazardType}
                        onChange={setHazardType}
                    />
                    <SelectInput
                        placeholder={strings.earlyActionTableFilterSectorPlaceholder}
                        name="sector"
                        options={earlyActionsOptionsResponse?.sectors}
                        keySelector={stringNameSelector}
                        labelSelector={stringNameSelector}
                        value={sector}
                        onChange={setSector}
                    />
                    <div />
                </>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={possibleEarlyActionResponse?.count ?? 0}
                    maxItemsPerPage={ITEM_PER_PAGE}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                pending={pendingPossibleEarlyAction}
                filtered={filtered}
                data={possibleEarlyActionResponse?.results}
                columns={columns}
                keySelector={numericIdSelector}
            />
        </Container>
    );
}

export default PossibleEarlyActionTable;
