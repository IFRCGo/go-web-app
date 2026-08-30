import {
    useCallback,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    DownloadTwoLineIcon,
    EpoaIcon,
    MoreTwoFillIcon,
    SettingsIcon,
    UploadLineIcon,
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
} from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
import useAuth from '#hooks/domain/useAuth';
import usePermissions from '#hooks/domain/usePermissions';
import useFilterState from '#hooks/useFilterState';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import ConfigureLocalUnitsModal from './ConfigureLocalUnitsModal';
import Filters, { type FilterValue } from './Filters';
import LocalUnitImportHistoryModal from './LocalUnitImportHistoryModal';
import LocalUnitImportModal from './LocalUnitImportModal';
import LocalUnitsExportModal from './LocalUnitsExportModal';
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

    const [showAddLocalUnitModal, {
        setTrue: setShowAddLocalUnitModalTrue,
        setFalse: setShowAdLocalUnitModalFalse,
    }] = useBooleanState(false);

    const [showExportLocalUnitsModal, {
        setTrue: setShowExportLocalUnitsModalTrue,
        setFalse: setShowExportLocalUnitsModalFalse,
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

    const { response: localUnitsOptions } = useRequest({
        url: '/api/v2/local-units-options/',
    });

    const handleLocalUnitsUpdate = useCallback(() => {
        setLocalUnitUpdateKey(new Date().getTime());
    }, []);

    const handleLocalUnitFormModalClose = useCallback(
        () => {
            setShowAdLocalUnitModalFalse();
            setLocalUnitUpdateKey(new Date().getTime());
        },
        [setShowAdLocalUnitModalFalse],
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
                headerActions={isAuthenticated && (
                    <>
                        <Button
                            name={undefined}
                            onClick={setShowAddLocalUnitModalTrue}
                        >
                            {strings.addLocalUnitLabel}
                        </Button>
                        {canSeeMoreOptions && (
                            <DropdownMenu
                                withoutDropdownIcon
                                labelStyleVariant="action"
                                label={<MoreTwoFillIcon className={styles.icon} />}
                                persistent
                            >
                                {isSuperUser && (
                                    <DropdownMenuItem
                                        type="button"
                                        name={undefined}
                                        onClick={setShowManageLocalUnitModalTrue}
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
                                            onClick={setShowExportLocalUnitsModalTrue}
                                            before={<DownloadTwoLineIcon className={styles.icon} />}
                                        >
                                            {strings.exportButtonLabel}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            type="button"
                                            name={undefined}
                                            onClick={setShowBulkUploadModalTrue}
                                            before={<UploadLineIcon className={styles.icon} />}
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
                        key={localUnitUpdateKey}
                        filter={filter}
                        filtered={filtered}
                    />
                </TabPanel>
                {showAddLocalUnitModal && (
                    <LocalUnitsFormModal
                        onClose={handleLocalUnitFormModalClose}
                    />
                )}
                {showBulkUploadModal && (
                    <LocalUnitImportModal
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
                        onUpdate={handleLocalUnitsUpdate}
                    />
                )}
                {showExportLocalUnitsModal && (
                    <LocalUnitsExportModal onClose={setShowExportLocalUnitsModalFalse} />
                )}
            </Container>
        </Tabs>
    );
}

export default NationalSocietyLocalUnits;
