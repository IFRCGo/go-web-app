import {
    useCallback,
    useState,
} from 'react';
import { CheckDoubleFillIcon } from '@ifrc-go/icons';
import {
    Button,
    SearchMultiSelectInput,
    type SearchMultiSelectInputProps,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isNotDefined,
    unique,
} from '@togglecorp/fujs';

import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetDistrictParams = GoApiUrlQuery<'/api/v2/district/'>;
type GetDistrictResponse = GoApiResponse<'/api/v2/district/'>;

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
    | 'selectedOnTop'
> & {
    countryId?: number;
};

function DistrictSearchMultiSelectInput<const NAME>(
    props: DistrictMultiSelectInputProps<NAME>,
) {
    const {
        className,
        countryId,
        onChange,
        onOptionsChange,
        name,
        disabled,
        readOnly,
        ...otherProps
    } = props;

    const strings = useTranslation(i18n);

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const query: GetDistrictParams = {
        country: countryId,
        search: debouncedSearchText,
        limit: 20,
    };

    const {
        pending,
        response,
    } = useRequest({
        skip: isNotDefined(countryId) || !opened,
        url: '/api/v2/district/',
        query,
        preserveResponse: true,
    });

    const {
        pending: pendingSelectAll,
        trigger,
    } = useLazyRequest({
        method: 'GET',
        url: '/api/v2/district/',
        query: (ctx: GetDistrictParams) => ctx,
        onSuccess: (allDistricts) => {
            const allDistrictsKeys = allDistricts.results?.map((d) => d.id);
            if (allDistrictsKeys && allDistrictsKeys.length > 0) {
                onChange(allDistrictsKeys, name);
                if (onOptionsChange) {
                    onOptionsChange(((existingOptions) => {
                        const safeOptions = existingOptions ?? [];
                        return unique(
                            [...safeOptions, ...(allDistricts.results ?? [])],
                            keySelector,
                        );
                    }));
                }
            }
        },
    });

    const handleSelectAllClick = useCallback(() => {
        trigger({
            country: countryId,
            limit: 9999,
        });
    }, [trigger, countryId]);

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
            optionsPending={pending || pendingSelectAll}
            totalOptionsCount={response?.count ?? 0}
            onShowDropdownChange={setOpened}
            actions={!disabled && !readOnly && (
                <Button
                    name={undefined}
                    onClick={handleSelectAllClick}
                    disabled={isNotDefined(countryId) || pendingSelectAll}
                    variant="tertiary"
                    title={strings.selectAll}
                >
                    <CheckDoubleFillIcon className={styles.icon} />
                </Button>
            )}
            selectedOnTop
        />
    );
}

export default DistrictSearchMultiSelectInput;
