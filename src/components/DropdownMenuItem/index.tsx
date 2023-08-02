import Link, { Props as LinkProps } from '#components/Link';
import Button, { Props as ButtonProps } from '#components/Button';

type ButtonTypeProps<NAME> = Omit<ButtonProps<NAME>, 'variant'> & {
    type: 'button';
}

type LinkTypeProps = Omit<LinkProps, 'variant'> & {
    type: 'link';
}

type Props<N> = (ButtonTypeProps<N> | LinkTypeProps);

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
}

export default DropdownMenuItem;
