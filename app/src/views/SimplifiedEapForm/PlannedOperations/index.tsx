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
import TabPage from '#components/TabPage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialSimplifiedEapType } from '../schema';
import OperationInput from './OperationsInput';

import i18n from './i18n.json';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type EapSectorOption = NonNullable<GlobalEnumsResponse['eap_sector']>[number];

type PlannedOperationFormFields = NonNullable<PartialSimplifiedEapType['planned_operations']>[number];
function sectorKeySelector(option: EapSectorOption) {
    return option.key;
}

interface Props {
    value: PartialSimplifiedEapType;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
}

function PlannedOperations(props: Props) {
    const {
        value,
        error: formError,
        disabled,
        setFieldValue,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    const {
        eap_sector: eapSectorOptions,
    } = useGlobalEnums();

    const selectedOperations = (value.planned_operations ?? [])
        .map((op) => op.title)
        .filter((key): key is EapSectorOption['key'] => key !== undefined);

    const {
        setValue: onOperationChange,
        removeValue: onOperationRemove,
    } = useFormArray<'planned_operations', PlannedOperationFormFields>(
        'planned_operations',
        setFieldValue,
    );

    const handleOperationSelect = useCallback((selectedKeys: EapSectorOption['key'][]) => {
        const previousKeys = (value.planned_operations ?? [])
            .map((op) => op.title)
            .filter((key): key is EapSectorOption['key'] => key !== undefined);

        const addedKeys = selectedKeys.filter((key) => !previousKeys.includes(key));
        const removedKeys = previousKeys.filter((key) => !selectedKeys.includes(key));

        if (addedKeys.length > 0) {
            const newOperations = addedKeys.map((key) => ({
                client_id: randomString(),
                title: key,
            }));

            setFieldValue(
                (oldValue: PlannedOperationFormFields[] = []) => [...oldValue, ...newOperations],
                'planned_operations',
            );
        }

        removedKeys.forEach((key) => {
            const index = value.planned_operations?.findIndex(
                (op) => op.title === key,
            );
            if (index !== undefined && index >= 0) {
                onOperationRemove(index);
            }
        });
    }, [
        value.planned_operations,
        setFieldValue,
        onOperationRemove,
    ]);

    const eapSectorTitleMap = useMemo(
        () => (
            listToMap(
                eapSectorOptions,
                (sector) => sector.key,
                (sector) => sector.value,
            )
        ),
        [eapSectorOptions],
    );

    return (
        <TabPage>
            <Container heading={strings.plannedOperationsTitle}>
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.plannedOperationsTitle}
                        description={strings.plannedOperationsDescription}
                    >
                        <NonFieldError
                            error={getErrorObject(error?.planned_operations)}
                        />
                        <Checklist
                            name={undefined}
                            options={eapSectorOptions}
                            value={selectedOperations}
                            onChange={handleOperationSelect}
                            disabled={disabled}
                            keySelector={sectorKeySelector}
                            labelSelector={stringValueSelector}
                            checkListLayout="grid"
                            checkListLayoutPreferredGridColumns={3}
                        />

                    </InputSection>
                    {value?.planned_operations?.map((operation, index) => (
                        <OperationInput
                            key={operation.client_id}
                            index={index}
                            value={operation}
                            onChange={onOperationChange}
                            onRemove={onOperationRemove}
                            error={getErrorObject(error?.planned_operations)}
                            disabled={disabled}
                            titleMap={eapSectorTitleMap}
                        />
                    ))}
                </ListView>
            </Container>
        </TabPage>
    );
}

export default PlannedOperations;
