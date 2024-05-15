import { useState } from 'react';
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
import { type CountryOutletContext } from '#utils/outletContext';

import AddEditLocalUnitsModal from './AddEditLocalUnitsModal';
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
    const [showAddEditModal, {
        setTrue: setShowAddEditModalTrue,
        setFalse: setShowAddEditModalFalse,
    }] = useBooleanState(false);

    const strings = useTranslation(i18n);

    return (
        <Tabs
            onChange={setActiveTab}
            value={activeTab}
            variant="tertiary"
        >
            <Container
                className={_cs(styles.nationalSocietyLocalUnitsMap, className)}
                heading={strings.localUnitsMapTitle}
                childrenContainerClassName={styles.content}
                withGridViewInFilter
                withHeaderBorder
                headerDescription={isAuthenticated && (
                    <TabList>
                        <Tab name="map">{strings.localUnitsMapView}</Tab>
                        <Tab name="table">{strings.localUnitsListView}</Tab>
                    </TabList>
                )}
                actions={isAuthenticated && (
                    // <Link
                    //     external
                    //     href={resolveUrl(adminUrl,
                    //     `local_units/localunit/?country=${countryId}`)}
                    //     variant="secondary"
                    // >
                    //     {strings.editLocalUnitLink}
                    // </Link>
                    <Button
                        name="addEdit"
                        variant="secondary"
                        onClick={setShowAddEditModalTrue}
                    >
                        {strings.editLocalUnitLink}
                    </Button>
                )}
            >
                <TabPanel name="map">
                    <LocalUnitsMap />
                </TabPanel>
                <TabPanel name="table">
                    <LocalUnitsTable />
                </TabPanel>
                {showAddEditModal && (
                    <AddEditLocalUnitsModal
                        onClose={setShowAddEditModalFalse}
                    />
                )}
            </Container>
        </Tabs>
    );
}

export default NationalSocietyLocalUnits;
