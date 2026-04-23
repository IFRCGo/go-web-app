import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    ExpandableContainer,
    ListView,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { noOp } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import EapIndicatorListInput from '#components/domain/EapIndicatorListInput';
import EapOperationActivityListInput from '#components/domain/EapOperationActivityListInput';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialEapFullFormType } from '../../schema';

import i18n from './i18n.json';

type EnableApproachesFormFields = NonNullable<PartialEapFullFormType['enabling_approaches']>[number];

type EapApproachApCodeOption = NonNullable<GoApiResponse<'/api/v2/eap/options/'>['approach_ap_codes']>;

const defaultApproachValue: EnableApproachesFormFields = {
    approach: 10,
};

interface Props {
    value: EnableApproachesFormFields;
    error: ArrayError<EnableApproachesFormFields> | undefined;
    onChange: (value: SetValueArg<EnableApproachesFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    approachTitle?: React.ReactNode;
    readOnly?: boolean;
    approachApCodeOption?: EapApproachApCodeOption;
}

function ApproachesInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        approachTitle,
        readOnly,
        approachApCodeOption,
    } = props;

    const strings = useTranslation(i18n);
    const onFieldChange = useFormObject(index, onChange, defaultApproachValue);

    const apCodeValue = approachApCodeOption?.[value?.approach]?.join(', ');

    const error = (value && value.approach && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.approach])
        : undefined;

    return (
        <ExpandableContainer
            heading={approachTitle ?? '--'}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="action"
                    title={strings.approachRemoveButton}
                    disabled={disabled || readOnly}
                >
                    <DeleteBinTwoLineIcon />
                </Button>
            )}
            withPadding
            withBackground
            initiallyExpanded
            withHeaderBorder
            // FIXME: add non field error and error indicator
        >
            <ListView layout="block">
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                >
                    <NumberInput
                        label={strings.approachBudget}
                        name="budget_per_approach"
                        value={value?.budget_per_approach}
                        onChange={onFieldChange}
                        disabled={disabled}
                        readOnly={readOnly}
                        error={error?.budget_per_approach}
                    />
                    <TextInput
                        name={undefined}
                        onChange={noOp}
                        readOnly
                        label={strings.approachApCode}
                        value={apCodeValue}
                    />
                </ListView>
                <ListView
                    layout="block"
                    spacing="2xs"
                >
                    <EapIndicatorListInput
                        name="indicators"
                        value={value.indicators}
                        onChange={onFieldChange}
                        readOnly={readOnly}
                        error={getErrorObject(error)?.indicators}
                    />
                    <EapOperationActivityListInput
                        name="readiness_activities"
                        value={value.readiness_activities}
                        onChange={onFieldChange}
                        readOnly={readOnly}
                        error={getErrorObject(error)?.readiness_activities}
                    />
                    <EapOperationActivityListInput
                        name="prepositioning_activities"
                        value={value.prepositioning_activities}
                        onChange={onFieldChange}
                        readOnly={readOnly}
                        error={getErrorObject(error)?.prepositioning_activities}
                    />
                    <EapOperationActivityListInput
                        name="early_action_activities"
                        value={value.early_action_activities}
                        onChange={onFieldChange}
                        readOnly={readOnly}
                        error={getErrorObject(error)?.early_action_activities}
                    />
                </ListView>
            </ListView>
        </ExpandableContainer>
    );
}

export default ApproachesInput;
