import {
    type Column,
    HeaderCell,
    type HeaderCellProps,
    ReducedListDisplay,
    type ReducedListDisplayProps,
    type SortDirection,
    type TableActionsProps,
} from '@ifrc-go/ui';
import { numericIdSelector } from '@ifrc-go/ui/utils';

import Link, { type Props as LinkProps } from '#components/Link';
import { type GoApiResponse } from '#utils/restRequest';

import type { Props as CountryLinkProps } from './CountryLink';
import CountryLink from './CountryLink';
import type { Props as RegionLinkProps } from './RegionLink';
import RegionLink from './RegionLink';

type Options<D, K, CompProps, HeaderProps> = {
    sortable?: boolean,
    defaultSortDirection?: SortDirection,

    columnClassName?: string;
    headerCellRendererClassName?: string;
    headerContainerClassName?: string;
    cellRendererClassName?: string;
    cellContainerClassName?: string;
    columnWidth?: Column<D, K, CompProps, HeaderProps>['columnWidth'];
    columnStretch?: Column<D, K, CompProps, HeaderProps>['columnStretch'];
    columnStyle?: Column<D, K, CompProps, HeaderProps>['columnStyle'];

    headerInfoTitle?: HeaderCellProps['infoTitle'];
    headerInfoDescription?: HeaderCellProps['infoDescription'];
}

export function createLinkColumn<D, K>(
    id: string,
    title: string,
    accessor: (item: D) => React.ReactNode,
    rendererParams: (item: D) => LinkProps,
    options?: Options<D, K, LinkProps, HeaderCellProps>,
) {
    const item: Column<D, K, LinkProps, HeaderCellProps> & {
        valueSelector: (item: D) => string | undefined | null,
        valueComparator: (foo: D, bar: D) => number,
    } = {
        id,
        title,
        headerCellRenderer: HeaderCell,
        headerCellRendererParams: {
            sortable: options?.sortable,
            infoTitle: options?.headerInfoTitle,
            infoDescription: options?.headerInfoDescription,
        },
        cellRenderer: Link,
        cellRendererParams: (_: K, datum: D): LinkProps => ({
            children: accessor(datum) || '--',
            withUnderline: true,
            ...rendererParams(datum),
        }),
        valueSelector: () => '',
        valueComparator: () => 0,
        cellRendererClassName: options?.cellRendererClassName,
        columnClassName: options?.columnClassName,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };

    return item;
}

type CountryResponse = GoApiResponse<'/api/v2/country/'>;
type CountryListItem = NonNullable<CountryResponse['results']>[number];
type PartialCountry = Pick<CountryListItem, 'id' | 'name'>;

type RegionListResponse = GoApiResponse<'/api/v2/region/'>;
type RegionListItem = NonNullable<RegionListResponse['results']>[number];
type PartialRegion = Pick<RegionListItem, 'id' | 'region_name'>;

const countryLinkRendererParams = (country: PartialCountry) => ({
    id: country.id,
    name: country.name ?? '?',
});

const regionLinkRendererParams = (region: PartialRegion) => ({
    id: region.id,
    name: region.region_name ?? '',
});

export function createCountryListColumn<DATUM, KEY>(
    id: string,
    title: string,
    countryListSelector: (datum: DATUM) => PartialCountry[] | undefined,
    options?: Options<DATUM, KEY, TableActionsProps, HeaderCellProps>,
) {
    const item: Column<
        DATUM,
        KEY,
        ReducedListDisplayProps<PartialCountry, CountryLinkProps>,
        HeaderCellProps
    > = {
        id,
        title,
        headerCellRenderer: HeaderCell,
        headerCellRendererParams: {
            sortable: false,
        },
        headerContainerClassName: options?.headerContainerClassName,
        cellRenderer: ReducedListDisplay,
        cellRendererParams: (_, datum) => {
            const countryList = countryListSelector(datum);
            return {
                list: countryList,
                renderer: CountryLink,
                keySelector: numericIdSelector,
                rendererParams: countryLinkRendererParams,
            };
        },
        cellRendererClassName: options?.cellRendererClassName,
        columnClassName: options?.columnClassName,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };

    return item;
}

export function createRegionListColumn<DATUM, KEY>(
    id: string,
    title: string,
    regionListSelector: (datum: DATUM) => PartialRegion[] | undefined,
    options?: Options<DATUM, KEY, TableActionsProps, HeaderCellProps>,
) {
    const item: Column<
        DATUM,
        KEY,
        ReducedListDisplayProps<PartialRegion, RegionLinkProps>,
        HeaderCellProps
    > = {
        id,
        title,
        headerCellRenderer: HeaderCell,
        headerCellRendererParams: {
            sortable: false,
        },
        headerContainerClassName: options?.headerContainerClassName,
        cellRenderer: ReducedListDisplay,
        cellRendererParams: (_, datum) => {
            const regionList = regionListSelector(datum);

            return {
                list: regionList,
                renderer: RegionLink,
                keySelector: numericIdSelector,
                rendererParams: regionLinkRendererParams,
            };
        },
        cellRendererClassName: options?.cellRendererClassName,
        columnClassName: options?.columnClassName,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };

    return item;
}
