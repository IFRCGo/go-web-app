import { _cs } from '@togglecorp/fujs';

import GoLink, {
    type CommonLinkProps,
    type ExternalLinkProps,
} from '#components/Link';

import styles from './styles.module.css';

type Props = CommonLinkProps<'withUnderline'> & Omit<ExternalLinkProps, 'external'>;

function Link(props: Props) {
    const {
        className,
        ...otherProps
    } = props;

    return (
        <GoLink
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            external
            withUnderline
            className={_cs(styles.link, className)}
        />
    );
}

export default Link;
