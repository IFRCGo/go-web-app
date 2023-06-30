import { useMemo } from 'react';
import { isDefined, randomString } from '@togglecorp/fujs';
import {
    ArrayError,
    useFormObject,
    getErrorObject,
    SetValueArg,
} from '@togglecorp/toggle-form';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';

import TextArea from '#components/TextArea';
import Button from '#components/Button';
import InputSection from '#components/InputSection';

import { PartialDref } from '../../schema';

import styles from './styles.module.css';

type NsActionFormFields = NonNullable<PartialDref['national_society_actions']>[number];
const defaultNsActionValue: NsActionFormFields = {
    client_id: randomString(),
};

interface Props {
    value: NsActionFormFields;
    error: ArrayError<NsActionFormFields> | undefined;
    onChange: (value: SetValueArg<NsActionFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    titleDisplayMap: Record<string, string> | undefined;
}

function NsActionInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        titleDisplayMap,
        onRemove,
    } = props;

    const nsActionLabel = useMemo(() => (
        isDefined(value.title) ? titleDisplayMap?.[value.title] : '--'
    ), [titleDisplayMap, value]);

    const onFieldChange = useFormObject(index, onChange, defaultNsActionValue);
    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <InputSection
            title={nsActionLabel}
            contentSectionClassName={styles.content}
        >
            <TextArea
                name="description"
                value={value.description}
                onChange={onFieldChange}
                error={error?.description}
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                variant="tertiary"
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </InputSection>
    );
}

export default NsActionInput;
