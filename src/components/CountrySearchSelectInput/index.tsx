import { useCallback, useEffect, useState } from 'react';

import SearchSelectInput from '#components/SearchSelectInput';
import type { Props as SearchSelectInputProps } from '#components/SearchSelectInput';

import { useLazyRequest, useRequest } from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    unique,
} from '@togglecorp/fujs';
import { numericIdSelector, stringNameSelector } from '#utils/selectors';

const MIN_SEARCH_LENGTH = 2;
interface CountryOptionItem {
    id: number;
    name: string;
}

interface CountryOptionItemUnsafe {
    id: number;
    name?: string | null | undefined;
}

type Props<NAME> = SearchSelectInputProps<
    number,
    NAME,
    CountryOptionItem,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    'name' | 'value' | 'onChange' | 'options' | 'searchOptions' | 'onSearchValueChange'
        | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'emptyMessage' | 'optionsPending'
> & {
    className?: string;
    name: NAME;
    value: number | null | undefined;
    onChange: (newValue: number | undefined, name: NAME) => void;
}

function CountrySearchSelectInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        onChange,
        ...otherProps
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);
    const searchTextSafe = debouncedSearchText?.trim() ?? '';
    const [cachedOptions, setCachedoptions] = useState<CountryOptionItem[]>([]);

    const addCachedOptions = useCallback(
        (newOptions: CountryOptionItemUnsafe[] | undefined | null) => {
            if (isNotDefined(newOptions)) {
                setCachedoptions([]);
                return;
            }

            setCachedoptions(
                (prevOptions) => (
                    unique(
                        [
                            ...newOptions.map(
                                (potentialCountry) => {
                                    if (isNotDefined(potentialCountry)
                                        || isFalsyString(potentialCountry.name)
                                        || isNotDefined(potentialCountry.id)
                                    ) {
                                        return undefined;
                                    }

                                    return {
                                        ...potentialCountry,
                                        id: potentialCountry.id,
                                        name: potentialCountry.name,
                                    };
                                },
                            ).filter(isDefined) ?? [],
                            ...prevOptions,
                        ],
                        (country) => country.id,
                    )
                ),
            );
        },
        [],
    );

    const { trigger: getDetailsForSelectedCountry } = useLazyRequest<'/api/v2/country/{id}/', null>({
        url: '/api/v2/country/{id}/',
        pathVariables: isDefined(value) ? { id: value } : undefined,
        onSuccess: (response) => {
            addCachedOptions([response]);
        },
    });

    const {
        pending: searchPending,
        response: searchResponse,
    } = useRequest({
        skip: searchTextSafe.length < MIN_SEARCH_LENGTH,
        url: '/api/v2/country/',
        query: {
            search: searchTextSafe,
            limit: 20,
            is_independent: true,
            is_deprecated: false,
        },
        onSuccess: (response) => {
            addCachedOptions(response?.results);
        },
    });

    useEffect(
        () => {
            if (isNotDefined(value)) {
                return;
            }

            const countryDetail = cachedOptions.find((option) => option.id === value);
            if (!countryDetail) {
                getDetailsForSelectedCountry(null);
            }
        },
        [value, cachedOptions, getDetailsForSelectedCountry],
    );

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            onSearchValueChange={setSearchText}
            optionsPending={searchPending}
            searchOptions={cachedOptions}
            options={cachedOptions}
            keySelector={numericIdSelector}
            labelSelector={stringNameSelector}
            totalOptionsCount={searchResponse?.count ?? 0}
            value={value}
            onChange={onChange}
            emptyMessage={searchTextSafe.length < MIN_SEARCH_LENGTH
                ? (
                    <>
                        {/* FIXME: use translation */}
                        <div>
                            Start typing country name
                        </div>
                        <div>
                            (at least 2 characters)
                        </div>
                        <div>
                            to start the search
                        </div>
                    </>
                ) : undefined}
        />
    );
}

export default CountrySearchSelectInput;
