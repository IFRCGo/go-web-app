import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    ListView,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import DiffWrapper from '#components/DiffWrapper';
import NonFieldError from '#components/NonFieldError';
import { hasChanged } from '#utils/common';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialLocalUnits } from '../schema';

import i18n from './i18n.json';

type OtherProfilesFormFields = NonNullable<
    NonNullable<PartialLocalUnits['health']>['other_profiles']
>[number];
type PreviousValueResponse = NonNullable<
    GoApiResponse<'/api/v2/local-units/{id}/'>
>;
type OtherProfilesResponseFields = NonNullable<
    NonNullable<NonNullable<PreviousValueResponse>['health']>['other_profiles']
>[number];

const defaultOtherProfilesValue: OtherProfilesFormFields = {
    client_id: '-1',
};

interface Props {
    value: OtherProfilesFormFields;
    previousValue?: OtherProfilesResponseFields;
    showValueChanges: boolean;
    showChanges: boolean;
    error: ArrayError<OtherProfilesFormFields> | undefined;
    onChange: (
        value: SetValueArg<OtherProfilesFormFields>,
        index: number
    ) => void;
    onRemove: (index: number) => void;
    index: number;
    readOnly?: boolean;
}

function OtherProfilesInput(props: Props) {
    const strings = useTranslation(i18n);

    const {
        value,
        onChange,
        index,
        onRemove,
        readOnly,
        showValueChanges,
        showChanges,
        previousValue,
        error: errorFromProps,
    } = props;

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultOtherProfilesValue,
    );

    const error = value && value.client_id && errorFromProps
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <ListView spacing="xs">
            <NonFieldError error={error} />
            <DiffWrapper
                showPreviousValue={showValueChanges}
                value={value.position}
                previousValue={previousValue?.position}
                diffViewEnabled={showChanges}
            >
                <TextInput
                    changed={
                        showChanges && hasChanged(value.position, previousValue?.position)
                    }
                    label={strings.otherProfilesPositionLabel}
                    name="position"
                    value={value.position}
                    onChange={onFieldChange}
                    error={error?.position}
                    readOnly={readOnly}
                    withAsterisk
                />
            </DiffWrapper>
            <DiffWrapper
                showPreviousValue={showValueChanges}
                value={value.number}
                previousValue={previousValue?.number}
                diffViewEnabled={showChanges}
            >
                <NumberInput
                    changed={
                        showChanges && hasChanged(value.number, previousValue?.number)
                    }
                    label={strings.otherProfilesNumberLabel}
                    name="number"
                    value={value.number}
                    onChange={onFieldChange}
                    error={error?.number}
                    readOnly={readOnly}
                    withAsterisk
                />
            </DiffWrapper>
            <Button
                name={index}
                onClick={onRemove}
                title={strings.otherProfilesRemoveLabel}
                styleVariant="action"
                disabled={readOnly}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </ListView>
    );
}

export default OtherProfilesInput;
