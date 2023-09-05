import { isDefined } from '@togglecorp/fujs';
import {
    type ArrayError,
    useFormObject,
    getErrorObject,
    type SetValueArg,
} from '@togglecorp/toggle-form';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';

import TextArea from '#components/TextArea';
import Button from '#components/Button';
import InputSection from '#components/InputSection';

import { type PartialDref } from '../../schema';

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
        >
            <TextArea
                className={styles.descriptionInput}
                name="description"
                value={value.description}
                onChange={onFieldChange}
                error={error?.description}
                disabled={disabled}
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                variant="tertiary"
                // TODO: use translations
                title="Remove Action"
                disabled={disabled}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </InputSection>
    );
}

export default NsActionInput;
