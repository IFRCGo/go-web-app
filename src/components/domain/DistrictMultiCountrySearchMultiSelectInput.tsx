import { useState } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import SearchMultiSelectInput, {
    SearchMultiSelectInputProps,
} from '#components/SearchMultiSelectInput';

import { useRequest } from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { paths } from '#generated/types';

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
    'onSearchValueChange' | 'searchOptions' | 'optionsPending'
    | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    countryIds?: number[];
};

function DistrictMultiCountrySearchMultiSelectInput<const NAME>(
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
        limit: 40,
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
        />
    );
}

export default DistrictMultiCountrySearchMultiSelectInput;
