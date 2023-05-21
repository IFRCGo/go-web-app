import React from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    PartialForm,
    ArrayError,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { IoTrash } from 'react-icons/io5';

import TextArea from '#components/TextArea';
import Button from '#components/Button';
import InputSection from '#components/InputSection';

import { StringValueOption } from '#types/common';
import { NsAction } from '../../common';

import styles from './styles.module.css';

type SetValueArg<T> = T | ((value: T) => T);

const defaultNsActionValue: PartialForm<NsAction> = {
    clientId: randomString(),
};

interface Props {
    value: PartialForm<NsAction>;
    error: ArrayError<NsAction> | undefined;
    onChange: (value: SetValueArg<PartialForm<NsAction>>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    nsActionOptions: StringValueOption[];
}

function NsActionInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        nsActionOptions,
        onRemove,
    } = props;

    const nsActionLabel = React.useMemo(() => (
        nsActionOptions.find((n) => n.value === value.title)?.label
    ), [nsActionOptions, value]);

    const onFieldChange = useFormObject(index, onChange, defaultNsActionValue);
    const error = (value && value.clientId && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.clientId])
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
                <IoTrash />
            </Button>
        </InputSection>
    );
}

export default NsActionInput;
