import { useCallback, useMemo, useState } from 'react';
import { unique } from '@togglecorp/fujs';

import { CheckDoubleFillIcon } from '@ifrc-go/icons';
import SearchMultiSelectInput, {
    SearchMultiSelectInputProps,
} from '#components/SearchMultiSelectInput';

import {
    useRequest,
    useLazyRequest,
} from '#utils/restRequest';
import Button from '#components/Button';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { paths } from '#generated/types';

type GetDistrict = paths['/api/v2/district/']['get'];
type GetDistrictParams = GetDistrict['parameters']['query'];
type GetDistrictResponse = GetDistrict['responses']['200']['content']['application/json'];
export type DistrictItem = Pick<NonNullable<GetDistrictResponse['results']>[number], 'id' | 'name'>;

const keySelector = (d: DistrictItem) => d.id;
const labelSelector = (d: DistrictItem) => d.name ?? '???';

type Def = { containerClassName?: string;}
type DistrictMultiSelectInputProps<NAME> = SearchMultiSelectInputProps<
    number,
    NAME,
    DistrictItem,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending'
    | 'options' | 'onOptionsChange' | 'keySelector'
    | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    initialOptions?: DistrictItem[];
    countryId?: number;
};

function DistrictMultiSelectInput<const NAME>(
    props: DistrictMultiSelectInputProps<NAME>,
) {
    const {
        className,
        initialOptions,
        countryId,
        onChange,
        name,
        ...otherProps
    } = props;

    const [fetchedCountries, setFetchedCountries] = useState<
        DistrictItem[] | undefined | null
    >(initialOptions ?? []);

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const query: GetDistrictParams = {
        country: countryId,
        search: debouncedSearchText,
        limit: 20,
    };

    const {
        pending,
        response,
    } = useRequest({
        skip: !countryId || !opened,
        url: '/api/v2/district/',
        query,
    });

    const {
        pending: pendingSelectAll,
        response: allResponse,
        trigger,
    } = useLazyRequest({
        url: '/api/v2/district/',
        query: (ctx: GetDistrictParams) => ctx,
        onSuccess: (allDistricts) => {
            const allDistrictsKeys = allDistricts.results?.map((d) => d.id);
            if (allDistrictsKeys && allDistrictsKeys.length > 0) {
                onChange(allDistrictsKeys, name);
            }
        },
    });

    const handleSelectAllClick = useCallback(() => {
        trigger({ country: countryId });
    }, [trigger, countryId]);

    const combinedOptions = useMemo(() => (
        unique(
            [
                ...(fetchedCountries ?? []),
                ...(allResponse?.results ?? []),
            ],
            keySelector,
        )
    ), [
        fetchedCountries,
        allResponse,
    ]);

    return (
        <SearchMultiSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            onChange={onChange}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={response?.results}
            optionsPending={pending || pendingSelectAll}
            totalOptionsCount={response?.count ?? 0}
            onShowDropdownChange={setOpened}
            options={combinedOptions}
            onOptionsChange={setFetchedCountries}
            actions={(
                <Button
                    name={undefined}
                    onClick={handleSelectAllClick}
                    disabled={!countryId || pendingSelectAll}
                >
                    <CheckDoubleFillIcon />
                </Button>
            )}
        />
    );
}

export default DistrictMultiSelectInput;
