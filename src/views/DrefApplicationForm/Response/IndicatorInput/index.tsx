import React from 'react';
import { IoTrash } from 'react-icons/io5';
import {
    ArrayError,
    getErrorObject,
    PartialForm,
    useFormObject,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';

import Button from '#components/Button';
import NumberInput from '#components/NumberInput';
import TextInput from '#components/TextInput';
import { SetValueArg } from '#utils/common';
import { Indicator } from '#views/DrefApplicationForm/common';
import languageContext from '#root/languageContext';

import styles from './styles.module.scss';

const defaultIndicatorValue: PartialForm<Indicator> = {
    clientId: randomString(),
};

interface Props {
  value: PartialForm<Indicator>;
  error: ArrayError<Indicator> | undefined;
  onChange: (value: SetValueArg<PartialForm<Indicator>>, index: number) => void;
  onRemove: (index: number) => void;
  index: number;
  showNewFieldOperational?: boolean;
}

function IndicatorInput(props: Props) {
    const { strings } = React.useContext(languageContext);

    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        showNewFieldOperational,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultIndicatorValue);
    const error = (value && value.clientId && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.clientId])
        : undefined;

    return (
        <div className={styles.indicator}>
            <div className={styles.inputs}>
                <TextInput
                    label={strings.drefFormIndicatorTitleLabel}
                    name="title"
                    value={value.title}
                    onChange={onFieldChange}
                    error={error?.title}
                />
                <NumberInput
                    label={strings.drefFormIndicatorTargetLabel}
                    name="target"
                    value={value.target}
                    onChange={onFieldChange}
                    error={error?.target}
                />

                {
                    showNewFieldOperational && (
                        <NumberInput
                            label={strings.drefOperationalUpdateIndicatorActualLabel}
                            name="actual"
                            value={value.actual}
                            onChange={onFieldChange}
                            error={error?.actual}
                        />
                    )
                }
            </div>
            <div>
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="action"
                >
                    <IoTrash />
                </Button>
            </div>
        </div>
    );
}

export default IndicatorInput;
