import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

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
    name?: string | null;
    society_name?: string | null;
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
    // We can either have country selection label by
    // the name of country or name of its national society
    selectionMode?: 'country' | 'nationalSociety';
}

function CountrySearchSelectInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        onChange,
        selectionMode,
        ...otherProps
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);
    const searchTextSafe = debouncedSearchText?.trim() ?? '';

    const [cachedOptions, setCachedoptions] = useState<CountryOptionItem[]>([]);

    // FIXME: Let's handle caching outside the component
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
                                    if (selectionMode === 'nationalSociety') {
                                        if (isFalsyString(potentialCountry.society_name)) {
                                            return undefined;
                                        }

                                        return {
                                            ...potentialCountry,
                                            id: potentialCountry.id,
                                            name: potentialCountry.society_name,
                                        };
                                    }

                                    if (isFalsyString(potentialCountry.name)) {
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
        [selectionMode],
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
            is_nationalsociety: selectionMode === 'nationalSociety' ? true : undefined,
        },
        onSuccess: (response) => {
            addCachedOptions(response?.results);
        },
    });

    // Get country option for a value if option is not in cache
    useEffect(
        () => {
            if (isNotDefined(value)) {
                return;
            }

            const countryDetail = cachedOptions.find((option) => option.id === value);
            if (!countryDetail) {
                // FIXME: Initial option should be provided externally.
                // This might result in lots of simultaneous request.
                // A quick fix can be a shared cached options
                // although, it can still result in simultaneous requests.
                getDetailsForSelectedCountry(null);
            }
        },
        [value, cachedOptions, getDetailsForSelectedCountry],
    );

    const sanitizedResults = useMemo(
        () => (
            searchResponse?.results?.map(
                (country) => {
                    if (selectionMode === 'nationalSociety') {
                        if (isFalsyString(country.society_name)) {
                            return undefined;
                        }

                        return {
                            ...country,
                            id: country.id,
                            name: country.society_name,
                        };
                    }

                    if (isFalsyString(country.name)) {
                        return undefined;
                    }

                    return {
                        ...country,
                        name: country.name,
                    };
                },
            ).filter(isDefined)
        ),
        [searchResponse, selectionMode],
    );

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            onSearchValueChange={setSearchText}
            optionsPending={searchPending}
            searchOptions={sanitizedResults}
            options={cachedOptions}
            keySelector={numericIdSelector}
            labelSelector={stringNameSelector}
            totalOptionsCount={searchResponse?.count ?? 0}
            value={value}
            onChange={onChange}
            emptyMessage={searchTextSafe.length < MIN_SEARCH_LENGTH
                ? (
                    <>
                        {/* FIXME: use translation and better message */}
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
