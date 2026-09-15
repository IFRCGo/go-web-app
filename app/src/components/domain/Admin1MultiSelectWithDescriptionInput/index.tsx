import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    InlineLayout,
    ListView,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    listToMap,
    randomString,
    unique,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import DistrictSearchMultiSelectInput, { type DistrictItem } from '../DistrictSearchMultiSelectInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface EapDistrictFormValue {
    client_id: string;
    id?: number;
    district?: number;
    description?: string;
    district_details?: DistrictItem;
}

interface Props<NAME> {
    name: NAME;
    value: EapDistrictFormValue[] | null | undefined;
    onChange: (
        newValue: EapDistrictFormValue[] | undefined,
        name: NAME,
    ) => void;
    countryId: number;
    error: ArrayError<EapDistrictFormValue> | undefined;
    maxWords?: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function Admin1MultiSelectWithDescriptionInput<const NAME>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        countryId,
        error,
        maxWords,
        disabled,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >();

    const combinedDistrictOptions = useMemo(
        () => unique(
            [
                ...value?.map((item) => item.district_details).filter(isDefined) ?? [],
                ...districtOptions ?? [],
            ],
            ({ id }) => id,
        ),
        [value, districtOptions],
    );

    const districtNameMap = useMemo(
        () => listToMap(
            combinedDistrictOptions,
            ({ id }) => id,
            ({ name: districtName }) => districtName,
        ) ?? {},
        [combinedDistrictOptions],
    );

    const selectedIds = useMemo(
        () => value?.map(({ district }) => district).filter(isDefined) ?? [],
        [value],
    );

    const selectedDistricts = useMemo(
        () => value?.filter((item) => isDefined(item.district)),
        [value],
    );
    const missingDistrictIds = useMemo(
        () => selectedIds.filter((districtId) => isNotDefined(districtNameMap[districtId])),
        [selectedIds, districtNameMap],
    );

    const debouncedMissingDistrictIds = useDebouncedValue(missingDistrictIds);

    useRequest({
        skip: debouncedMissingDistrictIds.length === 0,
        url: '/api/v2/district/',
        query: {
            id__in: debouncedMissingDistrictIds,
            limit: MAX_PAGE_LIMIT,
        },
        onSuccess: (response) => {
            setDistrictOptions((prevOptions) => unique(
                [
                    ...prevOptions ?? [],
                    ...response.results ?? [],
                ],
                ({ id }) => id,
            ));
        },
    });

    const handleSelectionChange = useCallback(
        (newIds: number[] | undefined) => {
            const itemByDistrict = listToMap(
                value?.filter((item) => isDefined(item.district)) ?? [],
                (item) => item.district as number,
            );

            onChange(
                newIds?.map((districtId) => itemByDistrict[districtId] ?? {
                    client_id: randomString(),
                    district: districtId,
                }),
                name,
            );
        },
        [value, onChange, name],
    );

    const handleDescriptionChange = useCallback(
        (newDescription: string | undefined, clientId: string) => {
            onChange(
                value?.map((item) => (
                    item.client_id === clientId
                        ? { ...item, description: newDescription }
                        : item
                )),
                name,
            );
        },
        [value, onChange, name],
    );

    return (
        <ListView
            className={styles.admin1Input}
            layout="block"
        >
            <NonFieldError error={getErrorObject(error)} />
            {!readOnly && (
                <DistrictSearchMultiSelectInput
                    name="district"
                    label={strings.selectAreasLabel}
                    countryId={countryId}
                    value={selectedIds}
                    onChange={handleSelectionChange}
                    options={combinedDistrictOptions}
                    onOptionsChange={setDistrictOptions}
                    disabled={disabled}
                />
            )}
            <Container
                headingLevel={6}
                withCompactMessage
                empty={isNotDefined(selectedDistricts) || selectedDistricts.length === 0}
                emptyMessage={strings.emptyMessage}
                withBorder
                withPadding
            >
                <ListView layout="block">
                    {selectedDistricts?.map((item) => {
                        const itemError = getErrorObject(error?.[item.client_id]);
                        return (
                            <InlineLayout
                                key={item.client_id}
                            >
                                <TextArea
                                    name={item.client_id}
                                    labelClassName={styles.districtLabel}
                                    label={
                                        districtNameMap[item.district as number]
                                        ?? String(item.district)
                                    }
                                    value={item.description}
                                    error={itemError?.description}
                                    onChange={handleDescriptionChange}
                                    maxWords={maxWords}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                />
                            </InlineLayout>
                        );
                    })}
                </ListView>
            </Container>
        </ListView>
    );
}

export default Admin1MultiSelectWithDescriptionInput;
