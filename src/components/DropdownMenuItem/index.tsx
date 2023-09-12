import Link, { Props as LinkProps } from '#components/Link';
import Button, { Props as ButtonProps } from '#components/Button';
import ConfirmButton, { Props as ConfirmButtonProps } from '#components/ConfirmButton';

type ButtonTypeProps<NAME> = Omit<ButtonProps<NAME>, 'variant' | 'type'> & {
    type: 'button';
}

type LinkTypeProps = LinkProps<'variant'> & {
    type: 'link';
}

type ConfirmButtonTypeProps<NAME> = Omit<ConfirmButtonProps<NAME>, 'variant' | 'type'> & {
    type: 'confirm-button',
}

type Props<N> = (ButtonTypeProps<N> | LinkTypeProps | ConfirmButtonTypeProps<N>);

function DropdownMenuItem<NAME>(props: Props<NAME>) {
    const { type } = props;

    if (type === 'link') {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type: _,
            ...otherProps
        } = props;

        return (
            <Link
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                variant="dropdown-item"
            />
        );
    }

    if (type === 'button') {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type: _,
            ...otherProps
        } = props;

        return (
            <Button
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                variant="dropdown-item"
            />
        );
    }

    if (type === 'confirm-button') {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type: _,
            ...otherProps
        } = props;

        return (
            <ConfirmButton
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                variant="dropdown-item"
            />
        );
    }
}

export default DropdownMenuItem;
