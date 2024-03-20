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
    type PartialForm,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import { type PartialDref } from '../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type NeedFormFields = NonNullable<PartialDref['needs_identified']>[number];
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
            className={styles.needInput}
            title={needLabel}
            contentSectionClassName={styles.content}
            withAsteriskOnTitle
        >
            <NonFieldError error={error} />
            <TextArea
                // FIXME Add condition with Type imminent
                label={strings.drefApplicationLabel}
                className={styles.descriptionInput}
                name="description"
                value={value.description}
                onChange={onFieldChange}
                error={error?.description}
                disabled={disabled}
            />
            <TextArea
                label={strings.drefExpectedNeedLabel}
                className={styles.descriptionInput}
                name="expected_need"
                value={value.expected_need}
                onChange={onFieldChange}
                error={error?.expected_need}
                disabled={disabled}
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                variant="tertiary"
                title={strings.drefApplicationRemoveNeed}
                disabled={disabled}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </InputSection>
    );
}

export default NeedInput;
