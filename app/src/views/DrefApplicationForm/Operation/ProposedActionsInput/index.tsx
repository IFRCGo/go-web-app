import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Container,
    InputSection,
    NumberInput,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isNotDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';
import { EARLY_ACTIONS } from '#views/DrefApplicationForm/common';

import { type PartialDref } from '../../schema';
import ActivitiesInput from './ActivitiesInput';

import i18n from './i18n.json';

type ProposedActionsFormFields = NonNullable<PartialDref['proposed_action']>[number];
type ActivitiesFormFields = NonNullable<ProposedActionsFormFields['activities']>[number];
type ActivityOptions = NonNullable<GoApiResponse<'/api/v2/primarysector'>>[number];

function sectorLabelSelector(option: ActivityOptions) {
    return option.label;
}

function sectorKeySelector(option: ActivityOptions) {
    return option.key;
}

const defaultProposedActionsValue: ProposedActionsFormFields = {
    client_id: '-1',
};

interface Props {
    value: ProposedActionsFormFields;
    error: ArrayError<ProposedActionsFormFields> | undefined;
    onChange: (
        value: SetValueArg<ProposedActionsFormFields>,
        index: number,
    ) => void;
    index: number;
    disabled?: boolean;
}
function ProposedActionsInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const {
        pending: activityOptionPending,
        response: activityOptionResponse,
    } = useRequest({
        url: '/api/v2/primarysector',
    });

    const [
        selectedSector,
        setSelectedSector,
    ] = useState<ActivityOptions['key'] | undefined>();

    const onProposedActionChange = useFormObject(index, onChange, defaultProposedActionsValue);

    const {
        setValue: onActivityChange,
        removeValue: onActivityRemove,
    } = useFormArray<'activities', ActivitiesFormFields>(
        'activities' as const,
        onProposedActionChange,
    );

    const handleActivityAddButtonClick = useCallback(
        () => {
            const newActivityItem: ActivitiesFormFields = {
                client_id: randomString(),
                sector: selectedSector,
            };

            onProposedActionChange(
                (oldValue: ActivitiesFormFields[] | undefined) => (
                    [...(oldValue ?? []), newActivityItem]
                ),
                'activities' as const,
            );
            setSelectedSector(undefined);
        },
        [onProposedActionChange, selectedSector],
    );

    const activityFilteredOptions = useMemo(() => {
        const valueMap = listToMap(
            value.activities,
            (activity) => activity.sector ?? '<no-key>',
            (activity) => ({
                type: value.proposed_type,
                sector: activity.sector,
                isFilter: true,
            }),
        );

        return activityOptionResponse?.filter(
            (response) => !valueMap?.[response.key]?.isFilter,
        );
    }, [value, activityOptionResponse]);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <InputSection
            title={
                value.proposed_type === EARLY_ACTIONS
                    ? strings.drefFromProposedEarlyActionLabel
                    : strings.drefFromProposedEarlyResponseLabel
            }
            numPreferredColumns={2}
        >
            <NonFieldError error={error} />
            <Container
                contentViewType="vertical"
            >
                <SelectInput
                    name={undefined}
                    label={strings.drefFormProposedActionSectorLabel}
                    value={selectedSector}
                    onChange={setSelectedSector}
                    keySelector={sectorKeySelector}
                    labelSelector={sectorLabelSelector}
                    options={activityFilteredOptions}
                    disabled={disabled || activityOptionPending}
                />
                <Button
                    variant="secondary"
                    name={undefined}
                    onClick={handleActivityAddButtonClick}
                    disabled={
                        isNotDefined(selectedSector)
                        || disabled
                    }
                >
                    {strings.drefFormAddProposedActionLabel}
                </Button>
                <Container>
                    <NonFieldError error={getErrorObject(error?.activities)} />
                    {value.activities?.map((activity, i) => (
                        <ActivitiesInput
                            key={activity.client_id}
                            index={i}
                            value={activity}
                            onChange={onActivityChange}
                            onRemove={onActivityRemove}
                            error={getErrorObject(error?.activities)}
                            activityOptions={activityOptionResponse}
                        />
                    ))}
                </Container>
            </Container>
            <NumberInput
                required
                name="total_budget"
                value={value.total_budget}
                onChange={onProposedActionChange}
                error={error?.total_budget}
                label="Budget"
                disabled={disabled}
            />
        </InputSection>
    );
}

export default ProposedActionsInput;
