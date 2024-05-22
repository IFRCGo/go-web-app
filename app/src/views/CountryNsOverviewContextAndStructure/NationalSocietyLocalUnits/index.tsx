import {
    useCallback,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Button,
    Container,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import useAuth from '#hooks/domain/useAuth';
import usePermissions from '#hooks/domain/usePermissions';
import { CountryOutletContext } from '#utils/outletContext';

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
    const { isSuperUser, isCountryAdmin } = usePermissions();

    // NOTE: key is used to refresh the page when local unit data is updated
    const [localUnitUpdateKey, setLocalUnitUpdateKey] = useState(0);

    const [showAddEditModal, {
        setTrue: setShowAddEditModalTrue,
        setFalse: setShowAddEditModalFalse,
    }] = useBooleanState(false);

    const handleLocalUnitFormModalClose = useCallback(
        () => {
            setShowAddEditModalFalse();
            setLocalUnitUpdateKey(new Date().getTime());
        },
        [setShowAddEditModalFalse],
    );

    const strings = useTranslation(i18n);

    const hasAddLocalUnitPermission = isCountryAdmin(countryResponse?.id) || isSuperUser;

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
                withGridViewInFilter
                withHeaderBorder
                headerDescription={isAuthenticated && (
                    <TabList>
                        <Tab name="map">{strings.localUnitsMapView}</Tab>
                        <Tab name="table">{strings.localUnitsListView}</Tab>
                    </TabList>
                )}
                actions={hasAddLocalUnitPermission && (
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
                    <LocalUnitsMap
                        key={localUnitUpdateKey}
                    />
                </TabPanel>
                <TabPanel name="table">
                    <LocalUnitsTable
                        key={localUnitUpdateKey}
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
