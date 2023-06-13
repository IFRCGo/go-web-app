// FIXME: don't use it directly
import { Link, LinkProps } from 'react-router-dom';

import useButtonFeatures, {
    Props as ButtonFeatureProps,
} from '#hooks/useButtonFeatures';

function ButtonLikeLink(props: ButtonFeatureProps & {
  to: LinkProps['to'];
  external?: boolean;
}) {
    const {
        external,
        to,
        ...buttonFeatureProps
    } = props;

    const {
        className,
        children,
    } = useButtonFeatures(buttonFeatureProps);

    if (external) {
        return (
            <a
                target="_blank"
                rel="noopener noreferrer"
                href={to as string}
                className={className}
            >
                {children}
            </a>
        );
    }

    return (
        <Link
            to={to}
            className={className}
        >
            {children}
        </Link>
    );
}

export default ButtonLikeLink;
