import { useCallback, useState } from 'react';
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
                actions={isAuthenticated && (
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={setShowAddEditModalTrue}
                    >
                        {strings.editLocalUnitLink}
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
