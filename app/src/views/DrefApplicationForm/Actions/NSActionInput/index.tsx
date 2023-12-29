import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
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
import styles from './styles.module.css';

type NsActionFormFields = NonNullable<PartialDref['national_society_actions']>[number];

const defaultNsActionValue: NsActionFormFields = {
    client_id: '-1',
};

interface Props {
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
            className={styles.nsActionInput}
            title={nsActionLabel}
            contentSectionClassName={styles.content}
            withAsteriskOnTitle
        >
            <NonFieldError error={error} />
            <TextArea
                className={styles.descriptionInput}
                name="description"
                value={value.description}
                onChange={onFieldChange}
                error={error?.description}
                disabled={disabled}
                // withAsterisk
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                variant="tertiary"
                title={strings.drefApplicationNSActionRemoveNeed}
                disabled={disabled}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </InputSection>
    );
}

export default NsActionInput;
