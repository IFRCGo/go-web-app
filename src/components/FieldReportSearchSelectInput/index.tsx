import { useState } from 'react';

import SearchSelectInput, {
    SearchSelectInputProps,
} from '#components/SearchSelectInput';

import {
    useRequest,
} from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { paths } from '#generated/types';

type GetFieldReport = paths['/api/v2/field_report/']['get'];
type GetFieldReportParams = GetFieldReport['parameters']['query'];
type GetFieldReportResponse = GetFieldReport['responses']['200']['content']['application/json'];
export type FieldReportItem = Pick<NonNullable<GetFieldReportResponse['results']>[number], 'id' | 'summary'>;

const keySelector = (d: FieldReportItem) => d.id;
const labelSelector = (d: FieldReportItem) => d.summary || '???';

type Def = { containerClassName?: string;}
type FieldReportSelectInputProps<NAME> = SearchSelectInputProps<
    number,
    NAME,
    FieldReportItem,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & { nationalSociety?: number };

function FieldReportSelectInput<NAME>(
    props: FieldReportSelectInputProps<NAME>,
) {
    const {
        className,
        nationalSociety,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const query: GetFieldReportParams = {
        summary: debouncedSearchText,
        limit: 20,
        countries__in: nationalSociety,
    };

    const {
        pending,
        response,
    } = useRequest<GetFieldReportResponse>({
        skip: (searchText?.length ?? 0) === 0 || !opened,
        url: 'api/v2/field_report/',
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
            searchOptions={response?.results}
            optionsPending={pending}
            totalOptionsCount={response?.count ?? 0}
            onShowDropdownChange={setOpened}
        />
    );
}

export default FieldReportSelectInput;
