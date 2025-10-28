import { useCallback } from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Checklist,
    Container,
    ListView,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialSimplifiedEapType } from '../../../schema';

import i18n from './i18n.json';

type ApproachesFormFields = NonNullable<PartialSimplifiedEapType['enable_approaches']>[number];
type ActivityFormField = NonNullable<ApproachesFormFields['early_action_activities']>[number];

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type TimeframeOption = NonNullable<GlobalEnumsResponse['eap_timeframe']>[number];

const defaultActivityValue: ActivityFormField = {
    client_id: '-1',
};

function timeframeKeySelector(option: TimeframeOption) {
    return option.key;
}

const timeValueKeySelector = (
    option: { key: number; value: string },
) => option.key;

interface Props {
    value: ActivityFormField;
    error: ArrayError<ActivityFormField> | undefined;
    onChange: (value: SetValueArg<ActivityFormField>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
}

function ActivityInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const {
        eap_timeframe,
        eap_years_timeframe_value,
        eap_months_timeframe_value,
        eap_days_timeframe_value,
        eap_hours_timeframe_value,
    } = useGlobalEnums();
    const onFieldChange = useFormObject(index, onChange, defaultActivityValue);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    const getTimeValueOptions = useCallback(
        (timeframe?: number) => {
            switch (timeframe) {
                case 10:
                    return eap_years_timeframe_value ?? [];
                case 20:
                    return eap_months_timeframe_value ?? [];
                case 30:
                    return eap_days_timeframe_value ?? [];
                case 40:
                    return eap_hours_timeframe_value ?? [];
                default:
                    return [];
            }
        },
        [
            eap_years_timeframe_value,
            eap_months_timeframe_value,
            eap_days_timeframe_value,
            eap_hours_timeframe_value,
        ],
    );

    const timeValueOptions = getTimeValueOptions(value?.timeframe);

    const handleTimeframeChange = useCallback(
        (newTimeframe: TimeframeOption['key'] | undefined) => {
            onFieldChange(newTimeframe, 'timeframe');
            onFieldChange([], 'time_value');
        },
        [onFieldChange],
    );

    return (
        <Container
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="outline"
                    title="Remove"
                    disabled={disabled}
                >
                    <DeleteBinTwoLineIcon />
                </Button>
            )}
        >
            <ListView layout="block">
                <ListView layout="grid" numPreferredGridColumns={3}>
                    <TextInput
                        label={strings.approachReadiness}
                        name="activity"
                        value={value.activity}
                        onChange={onFieldChange}
                        disabled={disabled}
                        withAsterisk
                    />
                    <SelectInput
                        label={strings.approachTimeFrame}
                        name="timeframe"
                        value={value.timeframe}
                        onChange={handleTimeframeChange}
                        keySelector={timeframeKeySelector}
                        labelSelector={stringValueSelector}
                        options={eap_timeframe}
                        disabled={disabled}
                        error={error?.timeframe}
                    />

                    {value?.timeframe && (
                        <Checklist
                            label={strings.approachTimeValue}
                            name="time_value"
                            value={value?.time_value}
                            onChange={onFieldChange}
                            keySelector={timeValueKeySelector}
                            labelSelector={stringValueSelector}
                            options={timeValueOptions}
                            disabled={disabled}
                        />
                    )}
                </ListView>
            </ListView>
        </Container>
    );
}

export default ActivityInput;
