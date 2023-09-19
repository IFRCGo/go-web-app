import { isDefined } from '@togglecorp/fujs';
import {
    type PartialForm,
    type ArrayError,
    useFormObject,
    getErrorObject,
    type SetValueArg,
} from '@togglecorp/toggle-form';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';

import NonFieldError from '#components/NonFieldError';
import TextArea from '#components/TextArea';
import Button from '#components/Button';
import InputSection from '#components/InputSection';

import { type PartialFinalReport } from '../../schema';

import styles from './styles.module.css';

type NeedFormFields = NonNullable<PartialFinalReport['needs_identified']>[number];
const defaultNeedValue: NeedFormFields = {
    client_id: '-1',
};

interface Props {
    value: PartialForm<NeedFormFields>;
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
        disabled,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultNeedValue);

    const needLabel = isDefined(value.title)
        ? titleDisplayMap?.[value.title]
        : '--';

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <InputSection
            className={styles.needInput}
            title={needLabel}
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
                // FIXME: use translations
                title="Remove Need"
                disabled={disabled}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </InputSection>
    );
}

export default NeedInput;
