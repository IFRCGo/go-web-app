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
    Message,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { rankedSearchOnList } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
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
            labelColorVariant="text"
            labelStyleVariant="action"
            popupClassName={styles.dropdown}
            persistent
            preferredPopupWidth={56}
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
                    styleVariant="vertical-compact"
                >
                    <TabList className={styles.regionList}>
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
                    <div className={styles.regionBorder} />
                    {regionOptions?.map(
                        (region) => (
                            <TabPanel
                                key={region.key}
                                name={region.key}
                                className={styles.regionDetail}
                            >
                                <Container
                                    pending={false}
                                    empty={false}
                                    errored={false}
                                    filtered={isTruthyString(countrySearch)}
                                    className={styles.regionDetailContent}
                                    withHeaderBorder
                                    withContentOverflow
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
                                                spacing="sm"
                                            >
                                                {/* FIXME: use translation */}
                                                {`${region.value} Region`}
                                            </DropdownMenuItem>
                                            <TextInput
                                                name={undefined}
                                                placeholder={strings
                                                    .countryDropdownSearchPlaceholder}
                                                value={countrySearch}
                                                onChange={setCountrySearch}
                                                icons={<SearchLineIcon />}
                                            />
                                        </ListView>
                                    )}
                                    withPadding
                                >
                                    <ListView
                                        layout="grid"
                                        spacing="xs"
                                        numPreferredGridColumns={4}
                                        minGridColumnSize="10rem"
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
                </Tabs>
            )}
        </DropdownMenu>
    );
}

export default CountryDropdown;
