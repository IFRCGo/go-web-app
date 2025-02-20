import { useState } from 'react';
import {
    SearchMultiSelectInput,
    type SearchMultiSelectInputProps,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';

import { type paths } from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { useRequest } from '#utils/restRequest';

type GetDistrict = paths['/api/v2/district/']['get'];
type GetDistrictParams = GetDistrict['parameters']['query'];
type GetDistrictResponse = GetDistrict['responses']['200']['content']['application/json'];

export type DistrictItem = Pick<NonNullable<GetDistrictResponse['results']>[number], 'id' | 'name'>;

const keySelector = (d: DistrictItem) => d.id;
const labelSelector = (d: DistrictItem) => d.name;

type Def = { containerClassName?: string;}
type DistrictMultiSelectInputProps<NAME> = SearchMultiSelectInputProps<
    number,
    NAME,
    DistrictItem,
    Def,
    'name' | 'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'selectedOnTop'
    | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    name: NAME;
    countryIds?: number[];
};

// TODO: can anyone suggest a better function name? If so please change it accordingly.
function MultiCountryDistrictSearchMultiSelectInput<const NAME>(
    props: DistrictMultiSelectInputProps<NAME>,
) {
    const {
        className,
        countryIds,
        onChange,
        onOptionsChange,
        name,
        disabled,
        readOnly,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const query: GetDistrictParams = {
        country__in: countryIds,
        search: debouncedSearchText,
        limit: 20,
    };

    const {
        pending,
        response,
    } = useRequest({
        skip: isNotDefined(countryIds) || !opened,
        url: '/api/v2/district/',
        query,
    });

    return (
        <SearchMultiSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            disabled={disabled}
            readOnly={readOnly}
            onOptionsChange={onOptionsChange}
            className={className}
            name={name}
            onChange={onChange}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={response?.results}
            optionsPending={pending}
            totalOptionsCount={response?.count ?? 0}
            onShowDropdownChange={setOpened}
            selectedOnTop
        />
    );
}

export default MultiCountryDistrictSearchMultiSelectInput;
