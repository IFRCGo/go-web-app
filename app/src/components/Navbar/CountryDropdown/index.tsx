import {
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    matchPath,
    useLocation,
} from 'react-router-dom';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    Container,
    DropdownMenu,
    ListView,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    rankedSearchOnList,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
import DomainContext from '#contexts/domain';
import RouteContext from '#contexts/route';
import useCountry from '#hooks/domain/useCountry';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useInputState from '#hooks/useInputState';

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

    const {
        countriesPending,
        regionsPending,
    } = useContext(DomainContext);
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
            label={strings.menuCountriesLabel}
            labelColorVariant="text"
            labelStyleVariant="action"
            popupClassName={styles.countryDropdown}
            persistent
            preferredPopupWidth={56}
            withoutPopupPadding
        >
            <Container
                empty={isEmpty}
                emptyMessage={strings.messageNotAvailable}
                pending={regionsPending}
                withContentOverflow
                withOverflow
            >
                <Tabs
                    value={activeRegion}
                    onChange={setActiveRegion}
                    styleVariant="vertical-compact"
                >
                    <ListView
                        layout="grid"
                        withSidebar
                        sidebarPosition="start"
                        sidebarSize="xs"
                        spacing="none"
                        withOverflow
                    >
                        <ListView
                            className={styles.tabList}
                            layout="block"
                            withPadding
                        >
                            <TabList>
                                {regionOptions?.map(
                                    (region) => (
                                        <Tab
                                            key={region.key}
                                            name={region.key}
                                        >
                                            {region.value}
                                        </Tab>
                                    ),
                                )}
                            </TabList>
                        </ListView>
                        {regionOptions?.map(
                            (region) => (
                                <TabPanel
                                    key={region.key}
                                    name={region.key}
                                    withContentsOnly
                                >
                                    <Container
                                        errored={false}
                                        filtered={isTruthyString(countrySearch)}
                                        withContentOverflow
                                        withOverflow
                                        headerDescription={(
                                            <ListView
                                                withWrap
                                                withSpaceBetweenContents
                                            >
                                                <DropdownMenuItem
                                                    type="link"
                                                    to="regionsLayout"
                                                    urlParams={{ regionId: region.key }}
                                                    withLinkIcon
                                                    colorVariant="primary"
                                                    styleVariant="filled"
                                                    withoutFullWidth
                                                >
                                                    {resolveToString(
                                                        strings.regionalPageLinkLabel,
                                                        { regionName: region.value ?? '--' },
                                                    )}
                                                </DropdownMenuItem>
                                                <TextInput
                                                    className={styles.searchInput}
                                                    name={undefined}
                                                    placeholder={strings
                                                        .countryDropdownSearchPlaceholder}
                                                    value={countrySearch}
                                                    onChange={setCountrySearch}
                                                    icons={<SearchLineIcon />}
                                                    variant="general"
                                                />
                                            </ListView>
                                        )}
                                        withPadding
                                        empty={isNotDefined(countriesInSelectedRegion)
                                            || countriesInSelectedRegion.length === 0}
                                        pending={countriesPending}
                                    >
                                        <ListView
                                            layout="grid"
                                            spacing="xs"
                                            numPreferredGridColumns={4}
                                            minGridColumnSize="9rem"
                                        >
                                            {/* TODO: use RawList */}
                                            {countriesInSelectedRegion?.map(
                                                ({ id, name }) => (
                                                    <DropdownMenuItem
                                                        type="link"
                                                        key={id}
                                                        to="countriesLayout"
                                                        urlParams={{ countryId: id }}
                                                        styleVariant="action"
                                                        spacing="sm"
                                                        withoutFullWidth
                                                        withoutPadding
                                                        textSize="sm"
                                                    >
                                                        {name}
                                                    </DropdownMenuItem>
                                                ),
                                            )}
                                        </ListView>
                                    </Container>
                                </TabPanel>
                            ),
                        )}
                    </ListView>
                </Tabs>
            </Container>
        </DropdownMenu>
    );
}

export default CountryDropdown;
