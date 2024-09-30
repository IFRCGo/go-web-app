import {
    Switch as PureSwitch,
    type SwitchProps,
} from '@ifrc-go/ui';

function Switch<N extends string>(props: SwitchProps<N>) {
    return (
        <PureSwitch
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default Switch;
