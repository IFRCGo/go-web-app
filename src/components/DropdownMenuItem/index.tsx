import { useCallback, useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';

import Link, { Props as LinkProps } from '#components/Link';
import Button, { Props as ButtonProps } from '#components/Button';
import ConfirmButton, { Props as ConfirmButtonProps } from '#components/ConfirmButton';
import DropdownMenuContext from '#contexts/dropdown-menu';

type CommonProp = {
    persist?: boolean;
}

type ButtonTypeProps<NAME> = Omit<ButtonProps<NAME>, 'variant' | 'type'> & {
    type: 'button';
}

type LinkTypeProps = LinkProps<'variant'> & {
    type: 'link';
}

type ConfirmButtonTypeProps<NAME> = Omit<ConfirmButtonProps<NAME>, 'variant' | 'type'> & {
    type: 'confirm-button',
}

type Props<N> = CommonProp & (ButtonTypeProps<N> | LinkTypeProps | ConfirmButtonTypeProps<N>);

function DropdownMenuItem<NAME>(props: Props<NAME>) {
    const {
        type,
        onClick,
        persist = false,
    } = props;
    const { setShowDropdown } = useContext(DropdownMenuContext);

    const handleLinkClick = useCallback(
        () => {
            if (!persist) {
                setShowDropdown(false);
            }
            // TODO: maybe add onClick here?
        },
        [setShowDropdown, persist],
    );

    const handleButtonClick = useCallback(
        (name: NAME, e: React.MouseEvent<HTMLButtonElement>) => {
            if (!persist) {
                setShowDropdown(false);
            }
            if (isDefined(onClick) && type !== 'link') {
                onClick(name, e);
            }
        },
        [setShowDropdown, type, onClick, persist],
    );

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
                onClick={handleLinkClick}
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
                onClick={handleButtonClick}
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
                onClick={handleButtonClick}
            />
        );
    }
}

export default DropdownMenuItem;
