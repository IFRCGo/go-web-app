import { useState } from 'react';

import SearchSelectInput, {
    Props as SearchSelectInputProps,
} from '#components/SearchSelectInput';

import {
    useRequest,
} from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { paths } from '#generated/types';

type GetEvent = paths['/api/v2/event/mini/']['get'];
type GetEventParams = GetEvent['parameters']['query'];
type GetEventResponse = GetEvent['responses']['200']['content']['application/json'];
export type EventItem = Pick<NonNullable<GetEventResponse['results']>[number], 'id' | 'name' | 'dtype'>;

const keySelector = (d: EventItem) => d.id;
const labelSelector = (d: EventItem) => d.name ?? '???';

type Def = { containerClassName?: string;}
type EventSelectInputProps<NAME> = SearchSelectInputProps<
    number,
    NAME,
    EventItem,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending'
    | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
    | 'selectedOnTop'
> & {
    autoGeneratedSource?: GetEventParams['auto_generated_source'];
    countryId?: number;
};

function EventSearchSelectInput<const NAME>(
    props: EventSelectInputProps<NAME>,
) {
    const {
        className,
        countryId,
        autoGeneratedSource,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const query: GetEventParams | undefined = {
        search: debouncedSearchText,
        countries__in: countryId,
        auto_generated_source: autoGeneratedSource,
        limit: 20,
    };

    const {
        pending,
        response,
    } = useRequest({
        skip: !opened,
        url: '/api/v2/event/mini/',
        query,
        preserveResponse: true,
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
            selectedOnTop
        />
    );
}

export default EventSearchSelectInput;
