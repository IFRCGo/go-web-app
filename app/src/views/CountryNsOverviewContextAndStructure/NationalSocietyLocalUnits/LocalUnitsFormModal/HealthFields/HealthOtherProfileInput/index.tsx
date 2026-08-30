import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    IconButton,
    InlineLayout,
    ListView,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type ObjectError,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { type PartialOtherProfileFields } from './schema';

import i18n from './i18n.json';

const defaultOtherProfilesValue: PartialOtherProfileFields = {
    client_id: '-1',
};

interface Props {
    value: PartialOtherProfileFields;
    prevValue?: PartialOtherProfileFields | null;
    withPrevValue?: boolean;
    withDiffView?: boolean;
    readOnly?: boolean;
    error: ObjectError<PartialOtherProfileFields> | undefined;
    index: number;
    onRemove: (index: number) => void;
    onChange: (
        value: SetValueArg<PartialOtherProfileFields>,
        index: number
    ) => void;
}

function HealthOtherProfileInput(props: Props) {
    const strings = useTranslation(i18n);

    const {
        value,
        index,
        onRemove,
        readOnly,
        error,
        prevValue,
        onChange,
        withPrevValue,
        withDiffView,
    } = props;

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultOtherProfilesValue,
    );

    return (
        <InlineLayout
            after={(
                <IconButton
                    name={index}
                    onClick={onRemove}
                    title={strings.otherProfilesRemoveLabel}
                    ariaLabel={strings.otherProfilesRemoveLabel}
                    disabled={readOnly}
                >
                    <DeleteBinTwoLineIcon />
                </IconButton>
            )}
        >
            <ListView layout="grid">
                <TextInput
                    label={strings.otherProfilesPositionLabel}
                    name="position"
                    value={value.position}
                    onChange={onFieldChange}
                    error={error?.position}
                    readOnly={readOnly}
                    withAsterisk
                    prevValue={prevValue?.position}
                    withPrevValue={withPrevValue}
                    withDiffView={withDiffView}
                />

                <NumberInput
                    label={strings.otherProfilesNumberLabel}
                    name="number"
                    value={value.number}
                    onChange={onFieldChange}
                    error={error?.number}
                    readOnly={readOnly}
                    withAsterisk
                    prevValue={prevValue?.number}
                    withPrevValue={withPrevValue}
                    withDiffView={withDiffView}
                />
            </ListView>
        </InlineLayout>
    );
}

export default HealthOtherProfileInput;
