import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    EpoaIcon,
    MoreTwoFillIcon,
    SettingsIcon,
    UploadTwoFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    DropdownMenu,
    InlineLayout,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
import { environment } from '#config';
import useAuth from '#hooks/domain/useAuth';
import usePermissions from '#hooks/domain/usePermissions';
import useFilterState from '#hooks/useFilterState';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import { type ManageResponse } from './common';
import ConfigureLocalUnitsModal from './ConfigureLocalUnitsModal';
import Filters, { type FilterValue } from './Filters';
import LocalUnitImportHistoryModal from './LocalUnitImportHistoryModal';
import LocalUnitImportModal from './LocalUnitImportModal';
import LocalUnitsFormModal from './LocalUnitsFormModal';
import LocalUnitsMap from './LocalUnitsMap';
import LocalUnitsTable from './LocalUnitsTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function NationalSocietyLocalUnits(props: Props) {
    const {
        className,
    } = props;

    const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');
    const { isAuthenticated } = useAuth();
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const {
        isSuperUser,
        isGuestUser,
        isLocalUnitGlobalValidator,
        isLocalUnitRegionValidator,
        isLocalUnitCountryValidator,
    } = usePermissions();

    // NOTE: key is used to refresh the page when local unit data is updated
    const [localUnitUpdateKey, setLocalUnitUpdateKey] = useState(0);

    const [showAddEditModal, {
        setTrue: setShowAddEditModalTrue,
        setFalse: setShowAddEditModalFalse,
    }] = useBooleanState(false);

    const [showBulkUploadModal, {
        setTrue: setShowBulkUploadModalTrue,
        setFalse: setShowBulkUploadModalFalse,
    }] = useBooleanState(false);

    const [showManageLocalUnitModal, {
        setTrue: setShowManageLocalUnitModalTrue,
        setFalse: setShowManageLocalUnitModalFalse,
    }] = useBooleanState(false);

    const [showUploadHistoryModal, {
        setTrue: setShowUploadHistoryModalTrue,
        setFalse: setShowUploadHistoryModalFalse,
    }] = useBooleanState(false);

    const {
        filter,
        rawFilter,
        setFilterField,
        filtered,
        resetFilter,
    } = useFilterState<FilterValue>({
        filter: {},
        pageSize: 9999,
    });

    const {
        response: localUnitsOptions,
        pending: localUnitsOptionsPending,
    } = useRequest({
        url: '/api/v2/local-units-options/',
    });

    const {
        trigger: manageLocalUnits,
        response: manageLocalUnitsResponse,
        pending: manageLocalUnitsPending,
    } = useLazyRequest({
        url: '/api/v2/externally-managed-local-unit/',
        query: {
            country__id: countryResponse?.id,
        },
    });

    const manageResponse: ManageResponse = useMemo(() => {
        if (isDefined(manageLocalUnitsResponse)) {
            if (manageLocalUnitsResponse.results.length === 0) {
                return undefined;
            }
            return listToMap(
                manageLocalUnitsResponse?.results,
                (res) => res.local_unit_type_details.id,
                (res) => ({ enabled: res.enabled, externallyManagedId: res.id }),
            );
        }
        return undefined;
    }, [manageLocalUnitsResponse]);

    const pending = localUnitsOptionsPending || manageLocalUnitsPending;

    const handleLocalUnitsUpdate = useCallback(
        () => {
            manageLocalUnits({});
        },
        [manageLocalUnits],
    );

    const handleBulkUploadModalOpen = useCallback(
        () => {
            handleLocalUnitsUpdate();
            setShowBulkUploadModalTrue();
        },
        [handleLocalUnitsUpdate, setShowBulkUploadModalTrue],
    );

    const handleLocalUnitAddEditModalOpen = useCallback(
        () => {
            handleLocalUnitsUpdate();
            setShowAddEditModalTrue();
        },
        [handleLocalUnitsUpdate, setShowAddEditModalTrue],
    );

    const handleManageLocalUnitsModalOpen = useCallback(
        () => {
            handleLocalUnitsUpdate();
            setShowManageLocalUnitModalTrue();
        },
        [handleLocalUnitsUpdate, setShowManageLocalUnitModalTrue],
    );

    const handleLocalUnitFormModalClose = useCallback(
        () => {
            setShowAddEditModalFalse();
            setLocalUnitUpdateKey(new Date().getTime());
        },
        [setShowAddEditModalFalse],
    );

    const handleTabChanges = useCallback(
        (name: 'map' | 'table') => {
            handleLocalUnitsUpdate();
            setActiveTab(name);
        },
        [handleLocalUnitsUpdate],
    );

    const strings = useTranslation(i18n);

    const isValidator = isSuperUser
        || isLocalUnitGlobalValidator()
        || isLocalUnitCountryValidator(countryResponse?.id)
        || isLocalUnitRegionValidator(countryResponse?.region ?? undefined);

    const canSeeMoreOptions = isSuperUser || isValidator;

    return (
        <Tabs
            onChange={handleTabChanges}
            value={activeTab}
            styleVariant="nav"
        >
            <Container
                pending={false}
                errored={false}
                empty={false}
                filtered={false}
                className={_cs(styles.nationalSocietyLocalUnits, className)}
                heading={strings.localUnitsTitle}
                withHeaderBorder
                headerActions={isAuthenticated && (environment !== 'production') && (
                    <>
                        <Button
                            name={undefined}
                            onClick={handleLocalUnitAddEditModalOpen}
                        >
                            {strings.addLocalUnitLabel}
                        </Button>
                        {canSeeMoreOptions && (
                            <DropdownMenu
                                withoutDropdownIcon
                                labelStyleVariant="action"
                                label={<MoreTwoFillIcon className={styles.icon} />}
                                // label="More options"
                                persistent
                            >
                                {isSuperUser && (
                                    <DropdownMenuItem
                                        type="button"
                                        name={undefined}
                                        onClick={handleManageLocalUnitsModalOpen}
                                        before={<SettingsIcon className={styles.icon} />}
                                    >
                                        {strings.configureDropdownLabel}
                                    </DropdownMenuItem>
                                )}
                                {isValidator && (
                                    <>
                                        <DropdownMenuItem
                                            type="button"
                                            name={undefined}
                                            onClick={handleBulkUploadModalOpen}
                                            before={<UploadTwoFillIcon className={styles.icon} />}
                                        >
                                            {strings.importDropdownLabel}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            type="button"
                                            name={undefined}
                                            onClick={setShowUploadHistoryModalTrue}
                                            before={<EpoaIcon className={styles.icon} />}
                                        >
                                            {strings.viewPreviousImportsDropdownLabel}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenu>
                        )}
                    </>
                )}
                filters={(
                    <Filters
                        value={rawFilter}
                        setFieldValue={setFilterField}
                        options={localUnitsOptions}
                        resetFilter={resetFilter}
                        filtered={filtered}
                    />
                )}
            >
                {isAuthenticated && !isGuestUser && (
                    <InlineLayout
                        after={(
                            <TabList>
                                <Tab name="map">{strings.localUnitsMapView}</Tab>
                                <Tab name="table">{strings.localUnitsListView}</Tab>
                            </TabList>
                        )}
                    />
                )}
                <TabPanel name="map">
                    <LocalUnitsMap
                        key={localUnitUpdateKey}
                        filter={filter}
                        localUnitsOptions={localUnitsOptions}
                    />
                </TabPanel>
                <TabPanel name="table">
                    <LocalUnitsTable
                        manageResponse={manageResponse}
                        key={localUnitUpdateKey}
                        filter={filter}
                        filtered={filtered}
                    />
                </TabPanel>
                {showAddEditModal && (
                    <LocalUnitsFormModal
                        onClose={handleLocalUnitFormModalClose}
                    />
                )}
                {showBulkUploadModal && (
                    <LocalUnitImportModal
                        manageResponse={manageResponse}
                        onClose={setShowBulkUploadModalFalse}
                    />
                )}
                {showUploadHistoryModal && isDefined(countryResponse?.name) && (
                    <LocalUnitImportHistoryModal
                        onClose={setShowUploadHistoryModalFalse}
                        country={countryResponse.name}
                        countryId={countryResponse.id}
                    />
                )}
                {showManageLocalUnitModal && (
                    <ConfigureLocalUnitsModal
                        onClose={setShowManageLocalUnitModalFalse}
                        pending={pending}
                        onUpdate={handleLocalUnitsUpdate}
                        manageResponse={manageResponse}
                    />
                )}
            </Container>
        </Tabs>
    );
}

export default NationalSocietyLocalUnits;
