import { useState } from 'react';

import SearchSelectInput, {
    Props,
} from '#components/SearchSelectInput';

import {
    useRequest,
    type GoApiUrlQuery,
    type GoApiResponse,
} from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';

type GetFieldReportParams = GoApiUrlQuery<'/api/v2/field-report/'>;
type GetFieldReportResponse = GoApiResponse<'/api/v2/field-report/'>;
export type FieldReportItem = Pick<NonNullable<GetFieldReportResponse['results']>[number], 'id' | 'summary'>;

const keySelector = (d: FieldReportItem) => d.id;
const labelSelector = (d: FieldReportItem) => d.summary || '???';

type Def = { containerClassName?: string;}
type FieldReportSelectInputProps<NAME> = Props<
    number,
    NAME,
    FieldReportItem,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
    | 'selectedOnTop'
> & { nationalSociety?: number };

function FieldReportSearchSelectInput<NAME>(
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
    } = useRequest({
        skip: !opened,
        url: '/api/v2/field-report/',
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

export default FieldReportSearchSelectInput;
