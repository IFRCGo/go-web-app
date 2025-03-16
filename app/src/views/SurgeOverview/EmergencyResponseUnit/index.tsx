import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Container,
    Grid,
    SelectInput,
} from '@ifrc-go/ui';
import { numericKeySelector } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import EmergencyResponseUnitTypeCard from './EmergencyResponseUnitTypeCard';
import NationalSocietyTypeCard from './NationalSocietyTypeCard';

import styles from './styles.module.css';

type GetEruReadinessResponse = GoApiResponse<'/api/v2/eru-readiness/'>;
type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type EruOwners = GoApiResponse<'/api/v2/eru_owner/mini/'>;
type EruOwnerOption = NonNullable<EruOwners['results']>[number];
type EruTypesOption = NonNullable<GlobalEnumsResponse['deployments_eru_type']>[number];
type EruReadinessListItem = NonNullable<GetEruReadinessResponse['results']>[number];

function eruOwnerKeySelector(option: EruOwnerOption) {
    return option.id;
}
function eruOwnerLabelSelector(option: EruOwnerOption) {
    return option.national_society_country_details.society_name ?? '';
}
const emergencyResponseUnitTypeKeySelector = (item: EruTypesOption) => item.key;
const emergencyResponseUnitTypeLabelSelector = (item: EruTypesOption) => item.value ?? '?';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        rawFilter,
        filtered,
        filter,
        setFilterField,
    } = useFilterState<{
        selectEruTypes? : EruTypesOption['key'],
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
        deployments_eru_type,
    } = useGlobalEnums();

    const [filterMode, setFilterMode] = useState<'eruType' | 'nationalSociety'>('nationalSociety');

    const eruOwnersOption = eruOwnersResponse?.results;

    const eruRendererParams = useCallback((_: number, item) => ({
        type: item.type,
        typeDisplay: item.type_display,
        nationalSocieties: item.national_societies,
        fundingReadiness: item.funding_readiness,
        equipmentReadiness: item.equipment_readiness,
        peopleReadiness: item.people_readiness,
        updatedAt: item.updated_at,
    }), []);

    const nsRendererParams = useCallback((_: number, item) => ({
        type: item.type,
        updatedAt: item.updated_at,
        societyName: item.society_name,
        eruTypes: item.er
    }), []);

    const uniqueEruReadinessData = useMemo(() => {
        const eruTypeMap = new Map<
    number,
    {
      type: number;
      type_display: string;
      national_societies: {
        name: string;
        ns_funding_readiness: number;
        ns_equipment_readiness: number;
        ns_people_readiness: number;
      }[];
      funding_readiness: number;
      equipment_readiness: number;
      people_readiness: number;
      updated_at: string;
    }
  >();

        eruReadinessResponse?.results?.forEach((item) => {
            item.eru_types.forEach((eruType) => {
                if (!eruTypeMap.has(eruType.type)) {
                    eruTypeMap.set(eruType.type, {
                        type: eruType.type,
                        type_display: eruType.type_display,
                        national_societies: [],
                        funding_readiness: Infinity,
                        equipment_readiness: Infinity,
                        people_readiness: Infinity,
                        updated_at: item.updated_at,
                    });
                }

                const entry = eruTypeMap.get(eruType.type)!;

                entry.funding_readiness = Math.min(
                    entry.funding_readiness,
                    eruType.funding_readiness,
                );
                entry.equipment_readiness = Math.min(
                    entry.equipment_readiness,
                    eruType.equipment_readiness,
                );
                entry.people_readiness = Math.min(
                    entry.people_readiness,
                    eruType.people_readiness,
                );

                const nsName = item.eru_owner_details
                    ?.national_society_country_details?.society_name;

                if (nsName) {
                    let nsEntry = entry.national_societies.find((ns) => ns.name === nsName);

                    if (!nsEntry) {
                        nsEntry = {
                            name: nsName,
                            ns_funding_readiness: eruType.funding_readiness,
                            ns_equipment_readiness: eruType.equipment_readiness,
                            ns_people_readiness: eruType.people_readiness,
                        };
                        entry.national_societies.push(nsEntry);
                    } else {
                        nsEntry.ns_funding_readiness = eruType.funding_readiness;
                        nsEntry.ns_equipment_readiness = eruType.equipment_readiness;
                        nsEntry.ns_people_readiness = eruType.people_readiness;
                    }
                }

                if (new Date(item.updated_at) > new Date(entry.updated_at)) {
                    entry.updated_at = item.updated_at;
                }
            });
        });

        return Array.from(eruTypeMap.values());
    }, [eruReadinessResponse]);

    const uniqueNationalSocietyData = useMemo(() => {
        const societyMap = new Map<number, {
        society_name: string | undefined | null;
        eru_types: {
            type: EruTypesOption;
            readiness: {
                equipment_readiness: number;
                people_readiness: number;
                funding_readiness: number;
            };
        }[];
        latest_updated_at: string;
    }>();

        eruReadinessResponse?.results?.forEach((item) => {
            item.eru_types.forEach((eruType) => {
                const owner = item.eru_owner_details;

                // If the societyMap does not have the owner yet, create a new entry
                if (!societyMap.has(owner.id)) {
                    societyMap.set(owner.id, {
                        society_name: owner?.national_society_country_details?.society_name,
                        eru_types: [
                            {
                                type: eruType, // Storing the entire eruType object
                            },
                        ],
                        latest_updated_at: item.updated_at,
                    });
                } else {
                    const entry = societyMap.get(owner.id);
                    if (entry) {
                    // Update the latest updated time if necessary
                        entry.latest_updated_at = entry.latest_updated_at > item.updated_at
                            ? entry.latest_updated_at
                            : item.updated_at;

                        // Check if the eru_type already exists, if not, add it
                        const existingEruType = entry.eru_types.find(
                            (typeEntry) => typeEntry.type.key === eruType.key,
                        );
                        if (!existingEruType) {
                        // If not found, add new entry for this eru_type
                            entry.eru_types.push({
                                type: eruType,
                                readiness: {
                                    equipment_readiness: eruType.equipment_readiness,
                                    people_readiness: eruType.people_readiness,
                                    funding_readiness: eruType.funding_readiness,
                                },
                            });
                        }
                    }
                }
            });
        });

        return Array.from(societyMap.values());
    }, [eruReadinessResponse]);

    console.info('ns', uniqueNationalSocietyData);

    return (
        <Container
            className={styles.emergencyResponseUnit}
            heading="ERU Capacity and Readiness"
            withHeaderBorder
            actions={(
                <Link
                    to="updateERUReadinessForm"
                    variant="primary"
                >
                    Update ERU Readiness
                </Link>
            )}
            contentViewType="vertical"
            filterActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={() => setFilterMode('eruType')}
                        variant="tertiary"
                    >
                        ERU Type
                    </Button>
                    <div className={styles.separator} />
                    <Button
                        name={undefined}
                        onClick={() => setFilterMode('nationalSociety')}
                        variant="tertiary"
                    >
                        National Society Type
                    </Button>
                </>
            )}
            filters={(
                <>

                    <SelectInput
                        placeholder="National Society"
                        name="selectEruOwner"
                        options={eruOwnersOption}
                        onChange={setFilterField}
                        value={rawFilter.selectEruOwner}
                        keySelector={eruOwnerKeySelector}
                        labelSelector={eruOwnerLabelSelector}
                    />
                    <SelectInput
                        placeholder="ERU Type"
                        name="selectEruTypes"
                        value={rawFilter.selectEruTypes}
                        onChange={setFilterField}
                        keySelector={emergencyResponseUnitTypeKeySelector}
                        labelSelector={emergencyResponseUnitTypeLabelSelector}
                        options={deployments_eru_type}
                    />
                </>
            )}
        >
            {filterMode === 'eruType' && (
                <Grid
                    numPreferredColumns={3}
                    data={uniqueEruReadinessData}
                    pending={eruReadinessPending}
                    errored={isDefined(eruReadinessError)}
                    filtered={filtered}
                    keySelector={numericKeySelector}
                    renderer={EmergencyResponseUnitTypeCard}
                    rendererParams={eruRendererParams}
                />
            )}
            {filterMode === 'nationalSociety' && (
                <Grid
                    numPreferredColumns={3}
                    data={uniqueNationalSocietyData}
                    pending={eruOwnersPending}
                    errored={isDefined(eruOwnersError)}
                    filtered={filtered}
                    keySelector={numericKeySelector}
                    renderer={NationalSocietyTypeCard}
                    rendererParams={nsRendererParams}
                />
            )}
        </Container>
    );
}

Component.displayName = 'EmergencyResponseUnit';
