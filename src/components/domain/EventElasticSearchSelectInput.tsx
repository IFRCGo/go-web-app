import { useState } from 'react';
import { isFalsyString, encodeDate } from '@togglecorp/fujs';

import SearchSelectInput, {
    Props as SearchSelectInputProps,
} from '#components/SearchSelectInput';

import {
    useRequest,
} from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { paths } from '#generated/types';

type GetSearch = paths['/api/v1/search/']['get'];
type GetSearchParams = GetSearch['parameters']['query'];
type GetSearchResponse = GetSearch['responses']['200']['content']['application/json'];

export type EventItem = Pick<NonNullable<GetSearchResponse['emergencies']>[number], 'id' | 'start_date' | 'name'>;

const keySelector = (d: EventItem) => d.id;
const labelSelector = (d: EventItem) => {
    const date = encodeDate(new Date(d.start_date));
    return `${d.name} (${date})`;
};

type Def = { containerClassName?: string;}
type ElasticSearchSelectInput<NAME> = SearchSelectInputProps<
    number,
    NAME,
    EventItem,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending'
    | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;

function EventElasticSearchSelectInput<const NAME>(
    props: ElasticSearchSelectInput<NAME>,
) {
    const {
        className,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const query: GetSearchParams | undefined = ({
        keyword: debouncedSearchText,
        // FIXME: server should fix this search params
    } as never);

    const {
        pending,
        response,
    } = useRequest({
        skip: !opened || isFalsyString(searchText) || searchText.length < 2,
        url: '/api/v1/search/',
        query,
    });

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={response?.emergencies}
            optionsPending={pending}
            totalOptionsCount={0}
            onShowDropdownChange={setOpened}
        />
    );
}

export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

export default EventElasticSearchSelectInput;
