import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    ListView,
    RawList,
    SelectInput,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    maxSafe,
    minSafe,
    numericIdSelector,
    resolveToString,
    stringKeySelector,
} from '@ifrc-go/ui/utils';
import {
    compareString,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
    unique,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { api } from '#config';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import { joinStrings } from '#utils/common';
import { NS_CONTRIBUTION_HOLDS_ERU } from '#utils/constants';
import { resolveUrl } from '#utils/resolveUrl';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import EmergencyResponseUnitCard, { type ReadinessList } from './EmergencyResponseUnitCard';
import NationalSocietyCard from './NationalSocietyCard';

import i18n from './i18n.json';

type EruReadinessResponse = GoApiResponse<'/api/v2/eru-readiness/'>;
type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type EruOwnersResponse = GoApiResponse<'/api/v2/eru_owner/mini/'>;
type EruOwnerOption = NonNullable<EruOwnersResponse['results']>[number];
type EruTypeOption = NonNullable<GlobalEnumsResponse['deployments_eru_type']>[number];
type EruReadiness = NonNullable<EruReadinessResponse['results']>[0];

function eruOwnerKeySelector(option: EruOwnerOption) {
    return option.id;
}
function eruOwnerLabelSelector(option: EruOwnerOption) {
    return option.national_society_country_details.society_name ?? '';
}
const emergencyResponseUnitTypeKeySelector = (item: EruTypeOption) => item.key;
const emergencyResponseUnitTypeLabelSelector = (item: EruTypeOption) => item.value ?? '?';

function EmergencyResponseUnitReadiness() {
    const strings = useTranslation(i18n);
    const {
        rawFilter,
        filtered,
        filter,
        setFilterField,
    } = useFilterState<{
        selectEruTypes? : number,
        selectEruOwner? : number,
    }>({
        filter: {},
    });

    const alert = useAlert();

    const {
        error: eruOwnersError,
        response: eruOwnersResponse,
        pending: eruOwnersPending,
    } = useRequest({
        url: '/api/v2/eru_owner/mini/',
        preserveResponse: true,
    });

    const {
        error: eruReadinessError,
        response: eruReadinessResponse,
        pending: eruReadinessPending,
    } = useRequest({
        url: '/api/v2/eru-readiness/',
        preserveResponse: true,
        query: {
            ordering: '-updated-at',
            eru_type: filter.selectEruTypes,
            eru_owner: filter.selectEruOwner,
        },
        onFailure: () => {
            alert.show(
                strings.fetchEruReadinessFailed,
                { variant: 'danger' },
            );
        },
    });

    const {
        error: eruReadinessTypeError,
        response: eruReadinessTypeResponse,
        pending: eruReadinessTypePending,
    } = useRequest({
        url: '/api/v2/eru-readiness-type/',
        preserveResponse: true,
        query: {
            ordering: '-updated-at',
            type: filter.selectEruTypes,
            eru_owner: filter.selectEruOwner,
        },
        onFailure: () => {
            alert.show(
                strings.fetchEruReadinessFailed,
                { variant: 'danger' },
            );
        },
    });

    const {
        deployments_eru_type: deploymentEruType,
    } = useGlobalEnums();

    const [activeTab, setActiveTab] = useState<'eruType' | 'nationalSociety'>('eruType');

    const groupedByEruType = useMemo(() => {
        const eruData = eruReadinessTypeResponse?.results?.map((d) => ({
            ...d,
            eruOwner: d.eru_readiness?.[0]?.eru_owner_details,
            updatedAt: d.eru_readiness?.[0]?.updated_at,
        }));
        return (
            mapToList(
                listToGroupList(
                    eruData,
                    (eru) => eru.type,
                ),
                (readinessList, eruType) => ({
                    key: eruType,
                    readinessList,
                    eruType: readinessList[0]!.type_display,
                }),
            )?.sort((a, b) => (compareString(a.eruType, b.eruType)))
        );
    }, [eruReadinessTypeResponse?.results]);

    const eruRendererParams = useCallback((_: string, item: {
        key: string;
        readinessList: ReadinessList;
        updatedAt: number | undefined;
    }) => ({
        typeDisplay: item.readinessList[0]!.type_display,
        nationalSocieties: joinStrings(unique(
            item.readinessList
                .filter((v) => v.ns_contribution === NS_CONTRIBUTION_HOLDS_ERU)
                .map((v) => v.eruOwner.national_society_country_details.society_name),
        ).filter(isDefined)),
        fundingReadiness: minSafe(item.readinessList.map((v) => v.funding_readiness)),
        equipmentReadiness: minSafe(item.readinessList.map((v) => v.equipment_readiness)),
        peopleReadiness: minSafe(item.readinessList.map((v) => v.people_readiness)),
        updatedAt: maxSafe(item.readinessList.map((v) => (new Date(v.updatedAt).getTime()))),
        readinessList: item.readinessList,
    }), []);

    const nsRendererParams = useCallback((_: number, item: EruReadiness) => ({
        eruData: item,
    }), []);

    return (
        <Tabs
            onChange={setActiveTab}
            value={activeTab}
            styleVariant="nav"
        >
            <Container
                heading={resolveToString(
                    strings.eruReadinessCount,
                    {
                        count: (
                            activeTab === 'eruType' ? groupedByEruType?.length
                                : eruReadinessResponse?.count) ?? '-',
                    },
                )}
                withHeaderBorder
                headerActions={(
                    <>
                        <Link
                            href={resolveUrl(api, 'api/v2/export-eru-readiness')}
                            colorVariant="primary"
                            styleVariant="outline"
                            withLinkIcon
                            external
                        >
                            {strings.exportEruReadiness}
                        </Link>
                        <Link
                            to="eruReadinessForm"
                            colorVariant="primary"
                            styleVariant="outline"
                            withLinkIcon
                        >
                            {strings.eruReadinessUpdateButton}
                        </Link>
                    </>
                )}
                filters={(
                    <>
                        <SelectInput
                            placeholder={strings.eruNationalSociety}
                            name="selectEruOwner"
                            options={eruOwnersResponse?.results}
                            onChange={setFilterField}
                            value={rawFilter.selectEruOwner}
                            keySelector={eruOwnerKeySelector}
                            labelSelector={eruOwnerLabelSelector}
                            optionsErrored={isDefined(eruOwnersError)}
                            disabled={eruOwnersPending}
                        />
                        <SelectInput
                            placeholder={strings.eruType}
                            name="selectEruTypes"
                            value={rawFilter.selectEruTypes}
                            onChange={setFilterField}
                            keySelector={emergencyResponseUnitTypeKeySelector}
                            labelSelector={emergencyResponseUnitTypeLabelSelector}
                            options={deploymentEruType}
                        />
                    </>
                )}
                headerDescription={(
                    <TabList>
                        <Tab name="eruType">{strings.eruType}</Tab>
                        <Tab name="nationalSociety">{strings.eruNationalSociety}</Tab>
                    </TabList>
                )}
            >
                <TabPanel name="eruType">
                    <Container
                        pending={eruReadinessTypePending}
                        errored={isDefined(eruReadinessTypeError)}
                        filtered={filtered}
                    >
                        <ListView
                            layout="grid"
                            numPreferredGridColumns={3}
                            minGridColumnSize="20rem"
                        >
                            <RawList
                                data={groupedByEruType}
                                keySelector={stringKeySelector}
                                renderer={EmergencyResponseUnitCard}
                                rendererParams={eruRendererParams}
                            />
                        </ListView>
                    </Container>
                </TabPanel>
                <TabPanel name="nationalSociety">
                    <Container
                        pending={eruReadinessPending}
                        errored={isDefined(eruReadinessError)}
                        filtered={filtered}
                        empty={isNotDefined(eruReadinessResponse?.results)
                            || eruReadinessResponse.results.length === 0}
                    >
                        <ListView
                            layout="grid"
                            numPreferredGridColumns={3}
                            minGridColumnSize="20rem"
                        >
                            <RawList
                                data={eruReadinessResponse?.results}
                                keySelector={numericIdSelector}
                                renderer={NationalSocietyCard}
                                rendererParams={nsRendererParams}
                            />
                        </ListView>
                    </Container>
                </TabPanel>
            </Container>
        </Tabs>
    );
}

export default EmergencyResponseUnitReadiness;
