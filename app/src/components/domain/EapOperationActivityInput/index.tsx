import {
    useCallback,
    useMemo,
} from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Checklist,
    IconButton,
    InlineLayout,
    ListView,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    type ArrayError,
    getErrorObject,
    getErrorString,
    type LeafError,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { TIMEFRAME_YEAR } from '#utils/constants';

import { type OperationActivityFormFields } from './schema';
import TimeSpanCheck from './TimeSpanCheck';

import i18n from './i18n.json';

const defaultActivityValue: OperationActivityFormFields = {
    client_id: '-1',
};

export type ActivityInputType = 'readiness_activities' | 'prepositioning_activities' | 'early_action_activities';

type TimeframeOption = components['schemas']['EapTimeframeEnum'];

function timeframeKeySelector(option: TimeframeOption) {
    return option.key;
}

const timeValueKeySelector = (
    option: { key: number; value: string },
) => option.key;

interface Props {
    value: OperationActivityFormFields;
    error: ArrayError<OperationActivityFormFields> | LeafError | undefined;
    onChange: (value: SetValueArg<OperationActivityFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;

    name: ActivityInputType;
}

function EapOperationActivityInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        readOnly,
        name,
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
        ? getErrorObject(getErrorObject(errorFromProps)?.[value.client_id])
        : undefined;

    const eapTimeframeOption = useMemo(() => {
        if (name === 'early_action_activities') {
            return eap_timeframe?.filter((item) => item.key !== TIMEFRAME_YEAR);
        }
        return eap_timeframe;
    }, [eap_timeframe, name]);

    const eapTimeFrameReadOnly = name === 'readiness_activities' || name === 'prepositioning_activities';

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
            onFieldChange(undefined, 'time_value');
        },
        [onFieldChange],
    );

    return (
        <InlineLayout
            after={(
                <IconButton
                    name={index}
                    onClick={onRemove}
                    // FIXME: use translations
                    title="Remove"
                    ariaLabel="Remove"
                    disabled={disabled || readOnly}
                >
                    <DeleteBinTwoLineIcon />
                </IconButton>
            )}
        >
            <ListView layout="grid">
                <TextInput
                    label={strings.operationPriorityActionLabel}
                    name="activity"
                    value={value.activity}
                    error={error?.activity}
                    onChange={onFieldChange}
                    disabled={disabled}
                    readOnly={readOnly}
                    withAsterisk
                />
                <ListView layout="grid">
                    <SelectInput
                        label={strings.operationTimeFrameLabel}
                        name="timeframe"
                        value={value.timeframe}
                        onChange={handleTimeframeChange}
                        keySelector={timeframeKeySelector}
                        labelSelector={stringValueSelector}
                        options={eapTimeframeOption}
                        disabled={disabled}
                        error={error?.timeframe}
                        readOnly={readOnly || eapTimeFrameReadOnly}
                    />
                    {value?.timeframe && (
                        <Checklist
                            label={strings.operationTimeValueLabel}
                            name="time_value"
                            value={value?.time_value}
                            spacing="xs"
                            onChange={onFieldChange}
                            keySelector={timeValueKeySelector}
                            labelSelector={stringValueSelector}
                            options={timeValueOptions}
                            disabled={disabled}
                            renderer={TimeSpanCheck}
                            withoutOpticalSpacingCorrection
                            error={getErrorString(error?.time_value)}
                            readOnly={readOnly}
                        />
                    )}
                </ListView>
            </ListView>
        </InlineLayout>
    );
}

export default EapOperationActivityInput;
