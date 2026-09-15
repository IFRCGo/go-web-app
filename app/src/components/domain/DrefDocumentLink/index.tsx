import {
    Button,
    type ButtonLayoutProps,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';

interface Props {
    className?: string;
    // Only consumed by the disabled-button fallback.
    name: string;
    label: React.ReactNode;
    url: string | undefined;
    styleVariant?: ButtonLayoutProps['styleVariant'];
    colorVariant?: ButtonLayoutProps['colorVariant'];
}

// A missing url degrades to a disabled button rather than an inert anchor.
function DrefDocumentLink(props: Props) {
    const {
        className,
        name,
        label,
        url,
        styleVariant = 'outline',
        colorVariant = 'primary',
    } = props;

    if (isDefined(url)) {
        return (
            <Link
                className={className}
                external
                href={url}
                styleVariant={styleVariant}
                colorVariant={colorVariant}
                withLinkIcon
                withUnderline={styleVariant === 'transparent'}
            >
                {label}
            </Link>
        );
    }

    return (
        <Button
            className={className}
            name={name}
            disabled
            styleVariant={styleVariant}
            colorVariant={colorVariant}
        >
            {label}
        </Button>
    );
}

export default DrefDocumentLink;
