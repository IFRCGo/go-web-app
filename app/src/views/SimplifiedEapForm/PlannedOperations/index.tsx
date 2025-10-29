import {
    useCallback,
    useMemo,
} from 'react';
import {
    Checklist,
    Container,
    InputSection,
} from '@ifrc-go/ui';
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
import { useRequest } from '#utils/restRequest';

import { type PartialSimplifiedEapType } from '../schema';
import OperationsBySectorInput from './OperationsBySectorInput';

type PlannedOperationFormFields = NonNullable<PartialSimplifiedEapType['planned_operations']>[number];

interface Props {
    value: PartialSimplifiedEapType;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
}
const idSelector = (item: { id: number }) => item.id;
const titleSelector = (item: { title: string }) => item.title;

function PlannedOperations(props: Props) {
    const {
        value,
        error: formError,
        disabled,
        setFieldValue,
    } = props;

    const error = getErrorObject(formError);

    const {
        response: optionsResponse,
    } = useRequest({
        url: '/api/v2/emergency-project/options/',
    });

    const selectedSectorIds = useMemo(
        () => value?.planned_operations?.map((op) => op.sector) ?? [],
        [value?.planned_operations],
    );

    const handleSectorSelect = useCallback((newSelectedIds: number[]) => {
        const sectors = optionsResponse?.sectors ?? [];

        const newItem = newSelectedIds
            .filter((id) => !selectedSectorIds.includes(id))
            .map((id) => {
                const sector = sectors.find((s) => s.id === id);
                return {
                    client_id: randomString(),
                    sector: sector?.id,
                    sector_title: sector?.title,
                };
            });
        const filtered = value?.planned_operations?.filter(
            (op) => newSelectedIds.includes(op.sector),
        ) ?? [];

        setFieldValue(
            [...filtered, ...newItem],
            'planned_operations' as const,
        );
    }, [
        value?.planned_operations,
        optionsResponse?.sectors,
        setFieldValue,
        selectedSectorIds,
    ]);

    const {
        setValue: onOperationChange,
        removeValue: onOperationRemove,
    } = useFormArray<'planned_operations', PlannedOperationFormFields>(
        'planned_operations',
        setFieldValue,
    );

    const sectorOptionsMap = useMemo(() => (
        listToMap(
            optionsResponse?.sectors,
            (sector) => sector.id,
            (sector) => sector.title,
        )
    ), [optionsResponse?.sectors]);

    return (
        <Container
            heading="Planned Operations"
        >
            <InputSection
                title="Planned Operation"
                description="Select sectors which are used in this Early Action Protocol."
            >
                <NonFieldError
                    error={getErrorObject(error?.planned_operations)}
                />
                <NonFieldError
                    error={getErrorString(error?.planned_operations)}
                />
                <Checklist
                    name={undefined}
                    options={optionsResponse?.sectors}
                    onChange={handleSectorSelect}
                    value={selectedSectorIds}
                    disabled={disabled}
                    keySelector={idSelector}
                    labelSelector={titleSelector}
                />
            </InputSection>
            {value?.planned_operations?.map((operation, index) => (
                <OperationsBySectorInput
                    key={operation.client_id}
                    index={index}
                    value={operation}
                    onChange={onOperationChange}
                    onRemove={onOperationRemove}
                    error={getErrorObject(error?.planned_operations)}
                    disabled={disabled}
                    sectorTitle={sectorOptionsMap}
                />
            ))}
        </Container>
    );
}

export default PlannedOperations;
