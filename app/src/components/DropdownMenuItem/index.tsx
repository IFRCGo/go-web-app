import {
    useCallback,
    useContext,
} from 'react';
import {
    Button,
    type ButtonProps,
    ConfirmButton,
    type ConfirmButtonProps,
} from '@ifrc-go/ui';
import { DropdownMenuContext } from '@ifrc-go/ui/contexts';
import { isDefined } from '@togglecorp/fujs';

import Link, { type Props as LinkProps } from '#components/Link';

type CommonProp = {
    persist?: boolean;
}

type ButtonTypeProps<NAME> = Omit<ButtonProps<NAME>, 'type'> & {
    type: 'button';
}

type LinkTypeProps = LinkProps & {
    type: 'link';
}

type ConfirmButtonTypeProps<NAME> = Omit<ConfirmButtonProps<NAME>, 'type'> & {
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            persist: __,
            variant = 'dropdown-item',
            ...otherProps
        } = props;

        return (
            <Link
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                variant={variant}
                onClick={handleLinkClick}
            />
        );
    }

    if (type === 'button') {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type: _,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            persist: __,
            variant = 'dropdown-item',
            ...otherProps
        } = props;

        return (
            <Button
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                variant={variant}
                onClick={handleButtonClick}
            />
        );
    }

    if (type === 'confirm-button') {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type: _,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            persist: __,
            variant = 'dropdown-item',
            ...otherProps
        } = props;

        return (
            <ConfirmButton
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                variant={variant}
                onClick={handleButtonClick}
            />
        );
    }
}

export default DropdownMenuItem;
