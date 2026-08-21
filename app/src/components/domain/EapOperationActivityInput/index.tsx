import {
    useCallback,
    useMemo,
} from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Checkbox,
    Checklist,
    IconButton,
    InlineLayout,
    InputContainer,
    ListView,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToString,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
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
import {
    TIMEFRAME_DAYS,
    TIMEFRAME_HOURS,
    TIMEFRAME_MONTHS,
    TIMEFRAME_YEAR,
    type TimeFrameEnumKey,
} from '#utils/constants';

import {
    type ActivityInputType,
    type OperationActivityFormFields,
} from './schema';
import TimeSpanCheck from './TimeSpanCheck';

import i18n from './i18n.json';

// NOTE: Simplified EAPs are limited to a two year timeframe
const SIMPLIFIED_EAP_MAX_YEARS = 2;

const defaultActivityValue: OperationActivityFormFields = {
    client_id: '-1',
    activation_one: false,
    activation_two: false,
};

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
    withActivationSelection?: boolean;
    withoutTimeframeSelection?: boolean;
    leadTimeframeUnit?: TimeFrameEnumKey;
    isSimplifiedEap?: boolean;
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
        withActivationSelection,
        withoutTimeframeSelection,
        leadTimeframeUnit,
        isSimplifiedEap,
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

    const isTimeframeFixedToLeadTime = name === 'early_action_activities'
        && isDefined(leadTimeframeUnit);

    const eapTimeframeOption = useMemo(() => {
        if (name !== 'early_action_activities') {
            return eap_timeframe;
        }
        if (isDefined(leadTimeframeUnit)) {
            return eap_timeframe?.filter((item) => item.key === leadTimeframeUnit);
        }
        return eap_timeframe?.filter((item) => item.key !== TIMEFRAME_YEAR);
    }, [eap_timeframe, name, leadTimeframeUnit]);

    const eapTimeFrameReadOnly = name === 'readiness_activities' || isTimeframeFixedToLeadTime;

    const leadTimeHint = resolveToString(
        strings.operationTimeFrameLeadTimeHint,
        {
            sectionName: isSimplifiedEap
                ? strings.operationTimeFrameLeadTimeSectionEarlyAction
                : strings.operationTimeFrameLeadTimeSectionTrigger,
        },
    );

    const getTimeValueOptions = useCallback(
        (timeframe?: number) => {
            switch (timeframe) {
                case TIMEFRAME_YEAR: {
                    const yearOptions = eap_years_timeframe_value ?? [];
                    return isSimplifiedEap
                        ? yearOptions.filter(({ key }) => key <= SIMPLIFIED_EAP_MAX_YEARS)
                        : yearOptions;
                }
                case TIMEFRAME_MONTHS:
                    return eap_months_timeframe_value ?? [];
                case TIMEFRAME_DAYS:
                    return eap_days_timeframe_value ?? [];
                case TIMEFRAME_HOURS:
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
            isSimplifiedEap,
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
                <ListView
                    layout="block"
                >
                    {withActivationSelection && (
                        <InputContainer
                            label={strings.operationActivationLabel}
                            disabled={disabled}
                            variant="transparent"
                            withoutInputSectionPadding
                            input={(
                                <ListView
                                    withWrap
                                    spacing="xl"
                                >
                                    <Checkbox
                                        name="activation_one"
                                        label={strings.operationActivationOneLabel}
                                        value={value.activation_one}
                                        onChange={onFieldChange}
                                        error={error?.activation_one}
                                        disabled={disabled}
                                        readOnly={readOnly}
                                    />
                                    <Checkbox
                                        name="activation_two"
                                        label={strings.operationActivationTwoLabel}
                                        value={value.activation_two}
                                        onChange={onFieldChange}
                                        error={error?.activation_two}
                                        disabled={disabled}
                                        readOnly={readOnly}
                                    />
                                </ListView>
                            )}
                        />
                    )}
                    {!withoutTimeframeSelection && (
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
                                hint={isTimeframeFixedToLeadTime
                                    ? leadTimeHint
                                    : undefined}
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
                                    hint={isTimeframeFixedToLeadTime
                                        ? strings.operationActivityTimeSpanHint
                                        : undefined}
                                />
                            ) }
                        </ListView>
                    )}
                </ListView>
            </ListView>
        </InlineLayout>
    );
}

export default EapOperationActivityInput;
