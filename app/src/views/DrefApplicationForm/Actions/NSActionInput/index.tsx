import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    InlineLayout,
    InputSection,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import { type PartialDref } from '../../schema';

import i18n from './i18n.json';

type NsActionFormFields = NonNullable<PartialDref['national_society_actions']>[number];

const defaultNsActionValue: NsActionFormFields = {
    client_id: '-1',
};

interface Props {
    readOnly?: boolean;
    value: NsActionFormFields;
    error: ArrayError<NsActionFormFields> | undefined;
    onChange: (value: SetValueArg<NsActionFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    titleDisplayMap: Record<string, string> | undefined;
    disabled?: boolean;
}

function NsActionInput(props: Props) {
    const {
        readOnly,
        error: errorFromProps,
        onChange,
        value,
        index,
        titleDisplayMap,
        onRemove,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(index, onChange, defaultNsActionValue);

    const nsActionLabel = isDefined(value.title)
        ? titleDisplayMap?.[value.title]
        : '--';

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <InputSection
            title={nsActionLabel}
            withAsteriskOnTitle
            numPreferredColumns={1}
        >
            <NonFieldError error={error} />
            <InlineLayout
                after={(
                    <Button
                        name={index}
                        onClick={onRemove}
                        variant="tertiary"
                        title={strings.drefApplicationNSActionRemoveNeed}
                        disabled={disabled || readOnly}
                    >
                        <DeleteBinTwoLineIcon />
                    </Button>
                )}
            >
                <TextArea
                    name="description"
                    value={value.description}
                    onChange={onFieldChange}
                    error={error?.description}
                    disabled={disabled}
                    readOnly={readOnly}
                    // withAsterisk
                />
            </InlineLayout>
        </InputSection>
    );
}

export default NsActionInput;
