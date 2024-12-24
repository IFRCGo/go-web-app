import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import { CloseLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
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
} from '@togglecorp/fujs';

import { environment } from '#config';
import useAuth from '#hooks/domain/useAuth';
import usePermissions from '#hooks/domain/usePermissions';
import useFilterState from '#hooks/useFilterState';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import Filters, { type FilterValue } from './Filters';
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

    const [activeTab, setActiveTab] = useState<'map'| 'table'>('map');
    const { isAuthenticated } = useAuth();
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const { isSuperUser, isCountryAdmin, isGuestUser } = usePermissions();
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
        // pending: localUnitsOptionsResponsePending,
    } = useRequest({
        url: '/api/v2/local-units-options/',
    });

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

    const handleLocalUnitFormModalClose = useCallback(
        () => {
            setShowAddEditModalFalse();
            setLocalUnitUpdateKey(new Date().getTime());
        },
        [setShowAddEditModalFalse],
    );

    const strings = useTranslation(i18n);

    const hasAddEditLocalUnitPermission = isCountryAdmin(countryResponse?.id) || isSuperUser;

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return (() => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        });
    }, [handleFullScreenChange]);

    return (
        <Tabs
            onChange={setActiveTab}
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
                // NOTE: disable local units add/edit for now
                actions={hasAddEditLocalUnitPermission && (environment !== 'production') && (
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={setShowAddEditModalTrue}
                    >
                        {strings.addLocalUnitLabel}
                    </Button>
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
            </Container>
        </Tabs>
    );
}

export default NationalSocietyLocalUnits;
