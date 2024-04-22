import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    SelectInput,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    stringLabelSelector,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { adminUrl } from '#config';
import { type components } from '#generated/types';
import useAuth from '#hooks/domain/useAuth';
import useFilterState from '#hooks/useFilterState';
import { type CountryOutletContext } from '#utils/outletContext';
import { resolveUrl } from '#utils/resolveUrl';
import { useRequest } from '#utils/restRequest';

import LocalUnitsMap from './LocalUnitsMap';
import LocalUnitsTable from './LocalUnitsTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

type LocalUnitType = components<'read'>['schemas']['LocalUnitType'];

const localUnitCodeSelector = (localUnit: LocalUnitType) => localUnit.code;

interface Validation {
    label: string;
}

interface Props {
    className?: string;
}

function NationalSocietyLocalUnits(props: Props) {
    const {
        className,
    } = props;

    const [activeTab, setActiveTab] = useState<'map'| 'table'>('table');

    const strings = useTranslation(i18n);
    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();

    const { isAuthenticated } = useAuth();

    const {
        rawFilter,
        limit,
        filter,
        filtered,
        setFilter,
        setFilterField,
    } = useFilterState<{
        type?: number;
        search?: string;
        isValidated?: string;
    }>({
        filter: {},
        pageSize: 9999,
    });

    const {
        response: localUnitListResponse,
    } = useRequest({
        skip: isNotDefined(countryResponse?.iso3),
        url: '/api/v2/local-units/',
        query: {
            limit,
            type__code: filter.type,
            validated: isDefined(filter.isValidated)
                ? filter.isValidated === strings.validated : undefined,
            search: filter.search,
            country__iso3: isDefined(countryResponse?.iso3) ? countryResponse?.iso3 : undefined,
        },
    });

    const {
        response: localUnitsOptionsResponse,
        pending: localUnitsOptionsResponsePending,
    } = useRequest({
        url: '/api/v2/local-units/options/',
    });

    const validationOptions: Validation[] = useMemo(() => ([
        {
            label: strings.validated,
        },
        {
            label: strings.notValidated,
        },
    ]), [strings.validated, strings.notValidated]);

    const handleClearFilter = useCallback(
        () => {
            setFilter({});
        },
        [setFilter],
    );

    return (
        <Container
            className={_cs(styles.nationalSocietyLocalUnitsMap, className)}
            heading={strings.localUnitsMapTitle}
            childrenContainerClassName={styles.content}
            withGridViewInFilter
            withHeaderBorder
            actions={isAuthenticated && (
                <Link
                    external
                    href={resolveUrl(adminUrl, `local_units/localunit/?country=${countryId}`)}
                    variant="secondary"
                >
                    {strings.editLocalUnitLink}
                </Link>
            )}
            filters={(
                <>
                    <SelectInput
                        placeholder={strings.localUnitsFilterTypePlaceholder}
                        label={strings.localUnitsFilterTypeLabel}
                        name="type"
                        value={rawFilter.type}
                        onChange={setFilterField}
                        keySelector={localUnitCodeSelector}
                        labelSelector={stringNameSelector}
                        disabled={localUnitsOptionsResponsePending}
                        options={localUnitsOptionsResponse?.type}
                    />
                    <SelectInput
                        placeholder={strings.localUnitsFilterValidatedPlaceholder}
                        label={strings.localUnitsFilterValidatedLabel}
                        name="isValidated"
                        value={rawFilter.isValidated}
                        onChange={setFilterField}
                        keySelector={stringLabelSelector}
                        labelSelector={stringLabelSelector}
                        options={validationOptions}
                    />
                    <TextInput
                        name="search"
                        label={strings.localUnitsFilterSearchLabel}
                        placeholder={strings.localUnitsFilterSearchPlaceholderLabel}
                        value={rawFilter.search}
                        onChange={setFilterField}
                        icons={<SearchLineIcon />}
                    />
                    <div className={styles.clearButton}>
                        <Button
                            name={undefined}
                            variant="secondary"
                            onClick={handleClearFilter}
                            disabled={!filtered}
                        >
                            {strings.localUnitsFilterClear}
                        </Button>
                    </div>
                </>
            )}
        >
            <Tabs
                onChange={setActiveTab}
                value={activeTab}
                variant="tertiary"
            >
                <TabList>
                    <Tab name="map">{strings.localUnitsMapView}</Tab>
                    <Tab name="table">{strings.localUnitsListView}</Tab>
                </TabList>
                <TabPanel name="map">
                    <LocalUnitsMap
                        localUnitListResponse={localUnitListResponse}
                    />
                </TabPanel>
                <TabPanel name="table">
                    <LocalUnitsTable
                        filter={filter}
                    />
                </TabPanel>
            </Tabs>
        </Container>
    );
}

export default NationalSocietyLocalUnits;
