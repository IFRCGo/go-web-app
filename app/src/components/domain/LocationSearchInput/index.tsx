import {
    useCallback,
    useState,
} from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import { SearchSelectInput } from '@ifrc-go/ui';
import { useDebouncedValue } from '@ifrc-go/ui/hooks';

import { useExternalRequest } from '#utils/restRequest';

export interface LocationSearchResult {
    addresstype: string;
    boundingbox: string[];
    readOnly?: boolean;
    class: string;
    display_name: string;
    importance: number;
    lat: string;
    licence: string;
    lon: string;
    name: string;
    osm_id: number;
    osm_type: string;
    place_id: number;
    place_rank: number;
    type: string;
}

function keySelector(result: LocationSearchResult) {
    return String(result.osm_id);
}

function labelSelector(result: LocationSearchResult) {
    return result.name;
}

function descriptionSelector(result: LocationSearchResult) {
    return result.display_name;
}

interface Props {
    className?: string;
    onResultSelect: (result: LocationSearchResult | undefined) => void;
    countryIso: string;
    readOnly?: boolean;
}

function LocationSearchInput(props: Props) {
    const {
        className, onResultSelect, readOnly, countryIso,
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>(undefined);

    const debouncedSearchText = useDebouncedValue(searchText?.trim() ?? '');

    const { pending, response: options } = useExternalRequest<
        LocationSearchResult[] | undefined
    >({
        skip: !opened || debouncedSearchText.length === 0,
        url: 'https://nominatim.openstreetmap.org/search',
        query: {
            q: debouncedSearchText,
            countrycodes: countryIso,
            format: 'json',
        },
    });

    const handleOptionSelect = useCallback(
        (
            _: string | undefined,
            __: string,
            option: LocationSearchResult | undefined,
        ) => {
            onResultSelect(option);
        },
        [onResultSelect],
    );

    return (
        <SearchSelectInput
            className={className}
            name=""
            // FIXME: use translations
            placeholder="Search for a place"
            readOnly={readOnly}
            options={undefined}
            value={undefined}
            keySelector={keySelector}
            labelSelector={labelSelector}
            descriptionSelector={descriptionSelector}
            onSearchValueChange={setSearchText}
            searchOptions={options}
            optionsPending={pending}
            onChange={handleOptionSelect}
            totalOptionsCount={options?.length ?? 0}
            onShowDropdownChange={setOpened}
            selectedOnTop={false}
            icons={<SearchLineIcon />}
        />
    );
}

export default LocationSearchInput;
