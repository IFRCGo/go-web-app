import { _cs } from '@togglecorp/fujs';

import NumberOutput, { Props as NumberOutputProps } from '#components/NumberOutput';
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
    NodeProps | DateProps | NumberProps
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
        ...otherProps
    } = props;

    const { value: propValue } = props;
    let valueComponent: React.ReactNode = propValue;

    if (otherProps.valueType === 'number') {
        valueComponent = (
            <NumberOutput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
            />
        );
    } else if (otherProps.valueType === 'date') {
        valueComponent = (
            <DateOutput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
            />
        );
    }

    return (
        <div className={_cs(styles.textOutput, className)}>
            {icon}
            {label && (
                <div
                    className={_cs(
                        styles.label,
                        strongLabel && styles.strong,
                        labelClassName,
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
    );
}

export default TextOutput;
