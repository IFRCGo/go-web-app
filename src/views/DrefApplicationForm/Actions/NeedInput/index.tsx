import { useMemo } from 'react';
import { isDefined, randomString } from '@togglecorp/fujs';
import {
    PartialForm,
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

type NeedFormFields = NonNullable<PartialDref['needs_identified']>[number];
const defaultNeedValue: NeedFormFields = {
    client_id: randomString(),
};

interface Props {
    value: PartialForm<NeedFormFields>;
    error: ArrayError<NeedFormFields> | undefined;
    onChange: (value: SetValueArg<NeedFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    titleDisplayMap: Record<string, string> | undefined;
}

function NeedInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        titleDisplayMap,
        onRemove,
    } = props;

    const needLabel = useMemo(() => (
        isDefined(value.title) ? titleDisplayMap?.[value.title] : '--'
    ), [titleDisplayMap, value]);

    const onFieldChange = useFormObject(index, onChange, defaultNeedValue);
    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <InputSection
            title={needLabel}
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

export default NeedInput;
