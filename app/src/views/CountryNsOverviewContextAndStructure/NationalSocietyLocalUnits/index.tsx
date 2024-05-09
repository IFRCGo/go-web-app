import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import Link from '#components/Link';
import { adminUrl } from '#config';
import useAuth from '#hooks/domain/useAuth';
import { type CountryOutletContext } from '#utils/outletContext';
import { resolveUrl } from '#utils/resolveUrl';

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

    const strings = useTranslation(i18n);
    const { countryId } = useOutletContext<CountryOutletContext>();

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
                    <Link
                        external
                        href={resolveUrl(adminUrl, `local_units/localunit/?country=${countryId}`)}
                        variant="secondary"
                    >
                        {strings.editLocalUnitLink}
                    </Link>
                )}
            >
                <TabPanel name="map">
                    <LocalUnitsMap />
                </TabPanel>
                <TabPanel name="table">
                    <LocalUnitsTable />
                </TabPanel>
            </Container>
        </Tabs>
    );
}

export default NationalSocietyLocalUnits;
