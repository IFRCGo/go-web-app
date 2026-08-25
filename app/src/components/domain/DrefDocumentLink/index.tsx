import { Button } from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';

interface Props {
    className?: string;
    // Only consumed by the disabled-button fallback.
    name: string;
    label: React.ReactNode;
    url: string | undefined;
}

// A missing url degrades to a disabled button rather than an inert anchor.
function DrefDocumentLink(props: Props) {
    const {
        className,
        name,
        label,
        url,
    } = props;

    if (isDefined(url)) {
        return (
            <Link
                className={className}
                external
                href={url}
                styleVariant="outline"
                colorVariant="primary"
                withLinkIcon
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
            styleVariant="outline"
            colorVariant="primary"
        >
            {label}
        </Button>
    );
}

export default DrefDocumentLink;
