import {
    Switch as PureSwitch,
    SwitchProps as PureSwitchProps,
} from '@ifrc-go/ui';

interface SwitchProps<N extends string> extends PureSwitchProps<N> {}

function WrappedSwitch<N extends string>(props: SwitchProps<N>) {
    return (
        <PureSwitch {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedSwitch;
