import { useState } from 'react';
import {
    SearchSelectInput,
    type SearchSelectInputProps,
} from '@ifrc-go/ui';

import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

type GetEventParams = GoApiUrlQuery<'/api/v2/event/mini/'>;
type GetEventResponse = GoApiResponse<'/api/v2/event/mini/'>;
export type EventItem = Omit<
    Pick<
        NonNullable<GetEventResponse['results']>[number],
        'id' | 'name' | 'dtype' | 'latest_field_report_id'
    >,
    'latest_field_report_id'
> & {
    latest_field_report_id?: NonNullable<GetEventResponse['results']>[number]['latest_field_report_id'];
};

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
    countryId?: number;
};

function EventSearchSelectInput<const NAME>(
    props: EventSelectInputProps<NAME>,
) {
    const {
        className,
        countryId,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const query: GetEventParams | undefined = {
        search: debouncedSearchText,
        countries__in: countryId,
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
