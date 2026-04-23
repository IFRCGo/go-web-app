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

import { type PartialSimplifiedEapType } from '../../schema';

import i18n from './i18n.json';

type PlannedOperationFormFields = NonNullable<PartialSimplifiedEapType['planned_operations']>[number];

type EapSectorApCodeOption = NonNullable<GoApiResponse<'/api/v2/eap/options/'>['sector_ap_codes']>;

const defaultOperationValue: PlannedOperationFormFields = {
    sector: 101,
};

interface Props {
    value: PlannedOperationFormFields;
    error: ArrayError<PlannedOperationFormFields> | undefined;
    onChange: (value: SetValueArg<PlannedOperationFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    operationTitle?: React.ReactNode;
    readOnly?: boolean;
    sectorApCodeOption?: EapSectorApCodeOption;
}

function OperationsBySectorInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        operationTitle,
        readOnly,
        sectorApCodeOption,
    } = props;

    const strings = useTranslation(i18n);
    const onFieldChange = useFormObject(index, onChange, defaultOperationValue);

    const apCodeValue = sectorApCodeOption?.[value.sector]?.join(', ');

    const error = (value && value.sector && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.sector])
        : undefined;

    return (
        <ExpandableContainer
            heading={operationTitle ?? '--'}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="action"
                    disabled={disabled || readOnly}
                    title={strings.operationRemoveButton}
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
                        label={strings.operationPeopleTargeted}
                        name="people_targeted"
                        value={value?.people_targeted}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.people_targeted}
                        readOnly={readOnly}
                        required
                    />
                    <NumberInput
                        label={strings.operationBudget}
                        name="budget_per_sector"
                        value={value?.budget_per_sector}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.budget_per_sector}
                        readOnly={readOnly}
                        required
                    />
                    <TextInput
                        name={undefined}
                        onChange={noOp}
                        readOnly
                        label={strings.operationApCode}
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

export default OperationsBySectorInput;
