import { useState } from 'react';

import SearchSelectInput, {
    SearchSelectInputProps,
} from '#components/SearchSelectInput';

import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';

export type FieldReportListItem = {
    id: number;
    summary: string;
};

const keySelector = (d: FieldReportListItem) => d.id;
const labelSelector = (d: FieldReportListItem) => d.summary;

type Def = { containerClassName?: string;}
type FieldReportSelectInputProps<K extends string> = SearchSelectInputProps<
    number,
    K,
    FieldReportListItem,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & { nationalSociety?: number };

function FieldReportSelectInput<K extends string>(
    props: FieldReportSelectInputProps<K>,
) {
    const {
        className,
        nationalSociety,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const {
        pending,
        response,
    } = useRequest<ListResponse<FieldReportListItem>>({
        skip: (searchText?.length ?? 0) === 0 || !opened,
        url: 'api/v2/field_report/',
        query: {
            summary: debouncedSearchText,
            limit: 20,
            countries__in: nationalSociety,
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
        />
    );
}

export default FieldReportSelectInput;
