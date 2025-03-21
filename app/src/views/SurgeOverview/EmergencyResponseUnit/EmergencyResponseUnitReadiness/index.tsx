import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    Grid,
    SelectInput,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import {
    maxSafe,
    minSafe,
    numericIdSelector,
    stringKeySelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import { joinStrings } from '#utils/common';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import EmergencyResponseUnitCard, { type ReadinessList } from './EmergencyResponseUnitCard';
import NationalSocietyCard from './NationalSocietyCard';

type EruReadinessResponse = GoApiResponse<'/api/v2/eru-readiness/'>;
type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type EruOwners = GoApiResponse<'/api/v2/eru_owner/mini/'>;
type EruOwnerOption = NonNullable<EruOwners['results']>[number];
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
    const {
        rawFilter,
        filtered,
        filter,
        setFilterField,
    } = useFilterState<{
        selectEruTypes? : EruTypeOption['key'],
        selectEruOwner? : EruOwnerOption['id'],
    }>({
        filter: {},
    });

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
            eru_type: filter.selectEruTypes,
            eru_owner: filter.selectEruOwner,
        },
    });

    const {
        deployments_eru_type: deploymentEruType,
    } = useGlobalEnums();

    const [activeTab, setActiveTab] = useState<'eruType' | 'nationalSociety'>('eruType');

    const groupedByEruType = useMemo(() => {
        const eruData = eruReadinessResponse?.results?.flatMap((readiness) => (
            [...(readiness.eru_types.map((eruType) => (
                {
                    ...eruType,
                    eruOwner: readiness.eru_owner_details,
                    updatedAt: readiness.updated_at,
                }
            )))]
        ));
        return (
            mapToList(
                listToGroupList(
                    eruData,
                    (eru) => eru.type,
                ),
                (readinessList, eruType) => ({ key: eruType, readinessList }),
            )
        );
    }, [eruReadinessResponse?.results]);

    const eruRendererParams = useCallback((_: string, item: {
        key: string;
        readinessList: ReadinessList;
    }) => ({
        typeDisplay: item.readinessList[0].type_display,
        nationalSocieties: joinStrings(
            item.readinessList.map((v) => (
                v.eruOwner.national_society_country_details.society_name
            )).filter(isDefined),
        ),
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
            variant="tertiary"
        >
            <Container
                heading={`ERU Capacity and Readiness (${eruReadinessResponse?.count})`}
                withHeaderBorder
                actions={(
                    <Link
                        to="eruReadinessForm"
                        variant="primary"
                    >
                        Update ERU Readiness
                    </Link>
                )}
                contentViewType="vertical"
                filters={(
                    <>

                        <SelectInput
                            placeholder="National Society"
                            name="selectEruOwner"
                            options={eruOwnersResponse?.results}
                            onChange={setFilterField}
                            value={rawFilter.selectEruOwner}
                            keySelector={eruOwnerKeySelector}
                            labelSelector={eruOwnerLabelSelector}
                            error={isDefined(eruOwnersError)}
                            disabled={eruOwnersPending}
                        />
                        <SelectInput
                            placeholder="ERU Type"
                            name="selectEruTypes"
                            value={rawFilter.selectEruTypes}
                            onChange={setFilterField}
                            keySelector={emergencyResponseUnitTypeKeySelector}
                            labelSelector={emergencyResponseUnitTypeLabelSelector}
                            options={deploymentEruType}
                        />
                    </>
                )}
                filterActions={(
                    <TabList>
                        <Tab name="eruType">ERU Type</Tab>
                        <Tab name="nationalSociety">National Society</Tab>
                    </TabList>
                )}
            >
                <TabPanel name="eruType">
                    <Grid
                        numPreferredColumns={3}
                        data={groupedByEruType}
                        pending={eruReadinessPending}
                        errored={isDefined(eruReadinessError)}
                        filtered={filtered}
                        keySelector={stringKeySelector}
                        renderer={EmergencyResponseUnitCard}
                        rendererParams={eruRendererParams}
                    />
                </TabPanel>
                <TabPanel name="nationalSociety">
                    <Grid
                        numPreferredColumns={3}
                        data={eruReadinessResponse?.results}
                        pending={eruReadinessPending}
                        errored={isDefined(eruReadinessError)}
                        filtered={filtered}
                        keySelector={numericIdSelector}
                        renderer={NationalSocietyCard}
                        rendererParams={nsRendererParams}
                    />
                </TabPanel>
            </Container>
        </Tabs>
    );
}

export default EmergencyResponseUnitReadiness;
