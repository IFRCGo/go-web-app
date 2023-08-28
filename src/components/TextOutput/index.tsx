import { _cs } from '@togglecorp/fujs';

import NumberOutput, { Props as NumberOutputProps } from '#components/NumberOutput';
import BooleanOutput, { Props as BooleanOutputProps } from '#components/BooleanOutput';
import DateOutput, { Props as DateOutputProps } from '#components/DateOutput';

import styles from './styles.module.css';

interface BaseProps {
    className?: string;
    icon?: React.ReactNode;
    label?: React.ReactNode;
    description?: React.ReactNode;
    labelClassName?: string;
    descriptionClassName?: string;
    valueClassName?: string;
    strongValue?: boolean;
    strongLabel?: boolean;
    strongDescription?: boolean;
    withoutLabelColon?: boolean;
    invalidText?: React.ReactNode;
}

interface BooleanProps extends BooleanOutputProps {
    valueType: 'boolean',
}

interface NumberProps extends NumberOutputProps {
    valueType: 'number',
}

interface DateProps extends DateOutputProps {
    valueType: 'date',
}

interface NodeProps {
    valueType?: never;
    value?: React.ReactNode;
}

type Props = BaseProps & (
    NodeProps | DateProps | NumberProps | BooleanProps
);

function TextOutput(props: Props) {
    const {
        className,
        label,
        icon,
        description,
        labelClassName,
        descriptionClassName,
        valueClassName,
        strongLabel,
        strongValue,
        strongDescription,
        withoutLabelColon,
        invalidText = '-',
        ...otherProps
    } = props;

    const { value: propValue } = props;
    let valueComponent: React.ReactNode = propValue || invalidText;

    if (otherProps.valueType === 'number') {
        valueComponent = (
            <NumberOutput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                invalidText={invalidText}
            />
        );
    } else if (otherProps.valueType === 'date') {
        valueComponent = (
            <DateOutput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                invalidText={invalidText}
            />
        );
    } else if (otherProps.valueType === 'boolean') {
        valueComponent = (
            <BooleanOutput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                invalidText={invalidText}
            />
        );
    }

    return (
        <div className={_cs(styles.textOutput, className)}>
            {icon}
            <div className={styles.container}>
                {label && (
                    <div
                        className={_cs(
                            styles.label,
                            strongLabel && styles.strong,
                            labelClassName,
                            !withoutLabelColon && styles.withColon,
                        )}
                    >
                        {label}
                    </div>
                )}
                <div
                    className={_cs(
                        styles.value,
                        strongValue && styles.strong,
                        valueClassName,
                    )}
                >
                    {valueComponent}
                </div>
                {description && (
                    <div
                        className={_cs(
                            styles.description,
                            strongDescription && styles.strong,
                            descriptionClassName,
                        )}
                    >
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TextOutput;
