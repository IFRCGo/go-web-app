import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    CloseLineIcon,
    EpoaIcon,
    MoreTwoFillIcon,
    SettingsIcon,
    UploadTwoFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    DropdownMenu,
    IconButton,
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
    isNotDefined,
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
    const containerRef = useRef<HTMLDivElement>(null);

    // NOTE: key is used to refresh the page when local unit data is updated
    const [localUnitUpdateKey, setLocalUnitUpdateKey] = useState(0);

    const [
        presentationMode,
        setFullScreenMode,
    ] = useState(false);

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

    const handleFullScreenChange = useCallback(() => {
        setFullScreenMode(isDefined(document.fullscreenElement));
    }, [setFullScreenMode]);

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

    const handleFullScreenToggleClick = useCallback(() => {
        if (isNotDefined(containerRef.current)) {
            return;
        }
        const { current: viewerContainer } = containerRef;
        if (!presentationMode && isDefined(viewerContainer?.requestFullscreen)) {
            viewerContainer?.requestFullscreen();
        } else if (presentationMode && isDefined(document.exitFullscreen)) {
            document.exitFullscreen();
        }
    }, [presentationMode]);

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

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return (() => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        });
    }, [handleFullScreenChange]);

    return (
        <Tabs
            onChange={handleTabChanges}
            value={activeTab}
            variant="tertiary"
        >
            <Container
                className={_cs(styles.nationalSocietyLocalUnits, className)}
                heading={strings.localUnitsTitle}
                childrenContainerClassName={styles.content}
                withHeaderBorder
                filterActions={isAuthenticated && !isGuestUser && (
                    <TabList>
                        <Tab name="map">{strings.localUnitsMapView}</Tab>
                        <Tab name="table">{strings.localUnitsListView}</Tab>
                    </TabList>
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
                actions={isAuthenticated && (environment !== 'production') && (
                    <>
                        <Button
                            name={undefined}
                            variant="secondary"
                            onClick={handleLocalUnitAddEditModalOpen}
                        >
                            {strings.addLocalUnitLabel}
                        </Button>
                        {canSeeMoreOptions && (
                            <DropdownMenu
                                variant="tertiary"
                                withoutDropdownIcon
                                label={<MoreTwoFillIcon className={styles.icon} />}
                                // label="More options"
                                persistent
                            >
                                {isSuperUser && (
                                    <DropdownMenuItem
                                        type="button"
                                        name={undefined}
                                        onClick={handleManageLocalUnitsModalOpen}
                                        icons={<SettingsIcon className={styles.icon} />}
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
                                            icons={<UploadTwoFillIcon className={styles.icon} />}
                                        >
                                            {strings.importDropdownLabel}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            type="button"
                                            name={undefined}
                                            onClick={setShowUploadHistoryModalTrue}
                                            icons={<EpoaIcon className={styles.icon} />}
                                        >
                                            {strings.viewPreviousImportsDropdownLabel}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenu>
                        )}
                    </>
                )}
            >
                <TabPanel name="map">
                    <Container
                        className={_cs(presentationMode && styles.presentationMode)}
                        containerRef={containerRef}
                        actions={presentationMode && (
                            <IconButton
                                name={undefined}
                                onClick={handleFullScreenToggleClick}
                                title={strings.closePresentationLabel}
                                variant="secondary"
                                ariaLabel={strings.closePresentationLabel}
                            >
                                <CloseLineIcon />
                            </IconButton>
                        )}
                    >
                        <LocalUnitsMap
                            key={localUnitUpdateKey}
                            onPresentationModeButtonClick={handleFullScreenToggleClick}
                            presentationMode={presentationMode}
                            filter={filter}
                            localUnitsOptions={localUnitsOptions}
                        />
                    </Container>
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
