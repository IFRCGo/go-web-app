import { useCallback, useState } from 'react';

import SearchSelectInput, {
    SearchSelectInputProps,
} from '#components/SearchSelectInput';

import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';

type CountryResponse = GoApiResponse<'/api/v2/country/'>;
export type CountryItem = Pick<NonNullable<CountryResponse['results']>[number], 'id' | 'name' | 'society_name'>;

const keySelector = (d: CountryItem) => d.id;
// TODO: Add isNationalSociety, isIndependent filter in request
type Def = { containerClassName?: string;}
type CountrySelectInputProps<NAME> = SearchSelectInputProps<
    number,
    NAME,
    CountryItem,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending'
    | 'options' | 'onOptionsChange' | 'keySelector'
    | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    initialOptions?: CountryItem[];
    showOnlyNationalSocieties?: boolean;
};

function CountrySelectInput<const NAME>(
    props: CountrySelectInputProps<NAME>,
) {
    const {
        className,
        initialOptions,
        showOnlyNationalSocieties,
        ...otherProps
    } = props;

    const [fetchedCountries, setFetchedCountries] = useState<
        CountryItem[] | undefined | null
    >(initialOptions ?? []);

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const labelSelector = useCallback(
        (d: CountryItem) => (showOnlyNationalSocieties ? d.society_name : d.name) ?? '???',
        [showOnlyNationalSocieties],
    );

    const {
        pending,
        response,
    } = useRequest({
        url: '/api/v2/country/',
        skip: !opened,
        query: {
            search: debouncedSearchText,
            limit: 20,
            is_nationalsociety: showOnlyNationalSocieties,
            is_independent: showOnlyNationalSocieties,
        },
    });

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={response?.results}
            optionsPending={pending}
            totalOptionsCount={response?.count ?? 0}
            onShowDropdownChange={setOpened}
            options={fetchedCountries}
            onOptionsChange={setFetchedCountries}
        />
    );
}

export default CountrySelectInput;
