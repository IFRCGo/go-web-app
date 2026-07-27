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
    type PartialForm,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import { type PartialOpsUpdate } from '../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type NeedFormFields = NonNullable<PartialOpsUpdate['needs_identified']>[number];
const defaultNeedValue: NeedFormFields = {
    client_id: '-1',
};

interface Props {
    value: PartialForm<NeedFormFields>;
    readOnly?: boolean;
    error: ArrayError<NeedFormFields> | undefined;
    onChange: (value: SetValueArg<NeedFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    titleDisplayMap: Record<string, string> | undefined;
    disabled?: boolean;
}

function NeedInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        titleDisplayMap,
        onRemove,
        readOnly,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(index, onChange, defaultNeedValue);

    const needLabel = isDefined(value.title)
        ? titleDisplayMap?.[value.title]
        : '--';

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <InputSection
            title={needLabel}
            withAsteriskOnTitle
        >
            <NonFieldError error={error} />
            <InlineLayout
                after={(
                    <Button
                        name={index}
                        onClick={onRemove}
                        variant="tertiary"
                        title={strings.drefOperationalUpdateFormRemoveNeed}
                        disabled={disabled || readOnly}
                    >
                        <DeleteBinTwoLineIcon />
                    </Button>
                )}
            >
                <TextArea
                    className={styles.descriptionInput}
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

export default NeedInput;
