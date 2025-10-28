import {
    useCallback,
    useMemo,
} from 'react';
import {
    Checklist,
    Container,
    InputSection,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
    useFormArray,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialSimplifiedEapType } from '../schema';
import ApproachesInput from './ApproachesInput';

import i18n from './i18n.json';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type EnablingApproachesOption = NonNullable<GlobalEnumsResponse['eap_approach']>[number];

type EnablingApproachesFormFields = NonNullable<PartialSimplifiedEapType['enable_approaches']>[number];

interface Props {
    value: PartialSimplifiedEapType;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
}

function approachesKeySelector(option: EnablingApproachesOption) {
    return option.key;
}
function EnablingApproches(props: Props) {
    const {
        value,
        error: formError,
        disabled,
        setFieldValue,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    const {
        eap_approach: approachesOptions,
    } = useGlobalEnums();

    const selectedApproach = (value.enable_approaches ?? [])
        .map((op) => op.title)
        .filter((key): key is EnablingApproachesOption['key'] => key !== undefined);

    const {
        setValue: onApproachChange,
        removeValue: onApproachRemove,
    } = useFormArray<'enable_approaches', EnablingApproachesFormFields>(
        'enable_approaches',
        setFieldValue,
    );

    const handleApproachSelect = useCallback((selectedKeys: EnablingApproachesOption['key'][]) => {
        const previousKeys = (value.enable_approaches ?? [])
            .map((op) => op.title)
            .filter((key): key is EnablingApproachesOption['key'] => key !== undefined);

        const addedKeys = selectedKeys.filter((key) => !previousKeys.includes(key));
        const removedKeys = previousKeys.filter((key) => !selectedKeys.includes(key));

        if (addedKeys.length > 0) {
            const newOperations = addedKeys.map((key) => ({
                client_id: randomString(),
                title: key,
            }));

            setFieldValue(
                (oldValue: EnablingApproachesFormFields[] = []) => {
                    const safeOldValue = oldValue.map((op) => ({
                        ...op,
                        title: op.title,
                    }));
                    return [...safeOldValue, ...newOperations];
                },
                'enable_approaches',
            );
        }

        if (removedKeys.length > 0) {
            removedKeys.forEach((key) => {
                const index = value.enable_approaches?.findIndex(
                    (op) => op.title === key,
                );
                if (index !== undefined && index >= 0) {
                    onApproachRemove(index);
                }
            });
        }
    }, [
        value.enable_approaches,
        setFieldValue,
        onApproachRemove,
    ]);

    const approachTitleMap = useMemo(
        () => (
            listToMap(
                approachesOptions,
                (approach) => approach.key,
                (approach) => approach.value,
            )
        ),
        [approachesOptions],
    );

    return (
        <Container heading={strings.enablingApproachesTitle}>
            <ListView
                layout="block"
                spacing="sm"
            >
                <InputSection
                    title={strings.enablingApproachesTitle}
                    description={strings.enablingApproachesDescription}
                >
                    <NonFieldError error={getErrorObject(error?.enable_approaches)} />
                    <Checklist
                        name={undefined}
                        options={approachesOptions}
                        onChange={handleApproachSelect}
                        value={selectedApproach}
                        disabled={disabled}
                        keySelector={approachesKeySelector}
                        labelSelector={stringValueSelector}
                        checkListLayout="grid"
                        checkListLayoutPreferredGridColumns={3}
                    />
                </InputSection>
                {value?.enable_approaches?.map((approach, index) => (
                    <ApproachesInput
                        key={approach.client_id}
                        index={index}
                        value={approach}
                        onChange={onApproachChange}
                        onRemove={onApproachRemove}
                        error={getErrorObject(error?.enable_approaches)}
                        disabled={disabled}
                        titleMap={approachTitleMap}
                    />
                ))}
            </ListView>
        </Container>
    );
}

export default EnablingApproches;
