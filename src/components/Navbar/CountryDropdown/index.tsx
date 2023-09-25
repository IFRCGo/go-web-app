import { useContext, useMemo, useState } from 'react';
import {
    useLocation,
    matchPath,
} from 'react-router-dom';
import {
    _cs,
    isDefined,
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import Message from '#components/Message';
import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import TabList from '#components/Tabs/TabList';
import Tabs from '#components/Tabs';
import Tab from '#components/Tabs/Tab';
import TabPanel from '#components/Tabs/TabPanel';
import useCountry from '#hooks/domain/useCountry';
import useTranslation from '#hooks/useTranslation';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import RouteContext from '#contexts/route';

import TextInput from '#components/TextInput';
import useInputState from '#hooks/useInputState';
import { SearchLineIcon } from '@ifrc-go/icons';
import { rankedSearchOnList } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

function CountryDropdown() {
    const location = useLocation();

    const strings = useTranslation(i18n);
    const {
        regionsLayout: regionRoute,
    } = useContext(RouteContext);
    const {
        api_region_name: regionOptions,
    } = useGlobalEnums();
    type RegionKey = NonNullable<(typeof regionOptions)>[number]['key'];

    const match = matchPath(
        {
            path: regionRoute.absolutePath,
            end: false,
        },
        location.pathname,
    );

    const regionIdFromMatch = useMemo(
        () => {
            const regionId = match?.params?.regionId;
            if (isFalsyString(regionId)) {
                return undefined;
            }

            const regionIdSafe = Number(regionId);

            if (
                regionIdSafe !== 0
                    && regionIdSafe !== 1
                    && regionIdSafe !== 2
                    && regionIdSafe !== 3
                    && regionIdSafe !== 4
            ) {
                return undefined;
            }

            return regionIdSafe;
        },
        [match],
    );

    const isEmpty = isNotDefined(regionOptions) || regionOptions.length === 0;

    const [activeRegion, setActiveRegion] = useState<RegionKey>(regionIdFromMatch ?? 0);
    const [countrySearch, setCountrySearch] = useInputState<string | undefined>(undefined);

    const allCountries = useCountry();
    const countriesInSelectedRegion = useMemo(
        () => (
            rankedSearchOnList(
                allCountries?.filter(({ region }) => region === activeRegion),
                countrySearch,
                ({ name }) => name,
            )
        ),
        [activeRegion, allCountries, countrySearch],
    );

    return (
        <DropdownMenu
            className={_cs(
                styles.regionDropdown,
                isDefined(match) && styles.active,
            )}
            label={strings.menuCountriesLabel}
            variant="tertiary"
            popupClassName={styles.dropdown}
            persistent
        >
            {isEmpty && (
                <Message
                    description={strings.messageNotAvailable}
                    compact
                />
            )}
            {!isEmpty && (
                <Tabs
                    value={activeRegion}
                    onChange={setActiveRegion}
                    variant="vertical-compact"
                >
                    <TabList
                        className={styles.regionList}
                        contentClassName={styles.regionListContent}
                    >
                        {regionOptions?.map(
                            (region) => (
                                <Tab
                                    key={region.key}
                                    name={region.key}
                                    className={styles.region}
                                >
                                    {region.value}
                                </Tab>
                            ),
                        )}
                    </TabList>
                    <div className={styles.regionBorder} />
                    {regionOptions?.map(
                        (region) => (
                            <TabPanel
                                key={region.key}
                                name={region.key}
                                className={styles.regionDetail}
                            >
                                <Container
                                    className={styles.regionDetailContent}
                                    withHeaderBorder
                                    heading={(
                                        <DropdownMenuItem
                                            type="link"
                                            to="regionsLayout"
                                            urlParams={{ regionId: region.key }}
                                            withLinkIcon
                                            variant="primary"
                                        >
                                            {/* FIXME: use translation */}
                                            {`${region.value} Region`}
                                        </DropdownMenuItem>
                                    )}
                                    headingLevel={4}
                                    childrenContainerClassName={styles.countryList}
                                    actions={(
                                        <TextInput
                                            name={undefined}
                                            placeholder={strings.countryDropdownSearchPlaceholder}
                                            value={countrySearch}
                                            onChange={setCountrySearch}
                                            icons={<SearchLineIcon />}
                                        />
                                    )}
                                >
                                    {/* TODO: use List */}
                                    {countriesInSelectedRegion?.map(
                                        ({ id, name }) => (
                                            <DropdownMenuItem
                                                key={id}
                                                type="link"
                                                to="countriesLayout"
                                                urlParams={{ countryId: id }}
                                                variant="tertiary"
                                                withLinkIcon
                                            >
                                                {name}
                                            </DropdownMenuItem>
                                        ),
                                    )}
                                </Container>
                            </TabPanel>
                        ),
                    )}
                </Tabs>
            )}
        </DropdownMenu>
    );
}

export default CountryDropdown;
