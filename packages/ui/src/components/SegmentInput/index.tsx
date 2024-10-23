import { _cs } from '@togglecorp/fujs';

import Button, { Props as ButtonProps } from '#components/Button';
import RadioInput, { Props as RadioInputProps } from '#components/RadioInput';
import { Props as RadioProps } from '#components/RadioInput/Radio';

import styles from './styles.module.css';

// Note: more props can be picked as per requirement
type ExtraSegmentProps<N> = Pick<ButtonProps<N>, 'icons' | 'iconsContainerClassName' | 'actions' | 'actionsContainerClassName'>;
export interface SegmentProps<N, IN> extends RadioProps<N, IN>, ExtraSegmentProps<N> {
  variant?: 'primary' | 'secondary',
}

function Segment<N, IN>(props: SegmentProps<N, IN>) {
    const {
        label,
        name,
        onClick,
        value,
        className,
        variant = 'primary',
        inputName, // eslint-disable-line @typescript-eslint/no-unused-vars
        ...otherProps
    } = props;

    return (
        <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(
                styles.segment,
                value && styles.active,
                variant === 'secondary' && styles.secondaryVariant,
                className,
            )}
            name={name}
            onClick={onClick}
            variant="tertiary"
        >
            {label}
        </Button>
    );
}

export type Props<
    N,
    O,
    V,
    RRP extends RadioProps<V, N>,
> = RadioInputProps<N, O, V, RRP, 'rendererParams' | 'renderer' | 'listContainerClassName' | 'keySelector' | 'labelSelector'> & {
    rendererParams?: RadioInputProps<N, O, V, RRP, never>['rendererParams'];
    listContainerClassName?: RadioInputProps<N, O, V, RRP, never>['listContainerClassName'];
    keySelector: RadioInputProps<N, O, V, RRP, never>['keySelector'];
    labelSelector: RadioInputProps<N, O, V, RRP, never>['labelSelector'];
}

function SegmentInput<
    const N,
    O extends object,
    V extends string | number | boolean,
    RRP extends RadioProps<V, N>,
>(props: Props<N, O, V, RRP>) {
    const {
        rendererParams,
        listContainerClassName,
        keySelector,
        labelSelector,
        className,
        ...otherProps
    } = props;

    return (
        <RadioInput
            className={_cs(className, styles.segmentInput)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            renderer={Segment}
            rendererParams={rendererParams}
            listContainerClassName={_cs(listContainerClassName, styles.segmentList)}
            keySelector={keySelector}
            labelSelector={labelSelector}
        />
    );
}

export default SegmentInput;
