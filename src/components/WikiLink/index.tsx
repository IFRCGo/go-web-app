import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';

import Link from '#components/Link';
import type { Props as LinkProps } from '#components/Link';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';
import { _cs } from '@togglecorp/fujs';

type Props<OMISSION extends string = never> = Omit<LinkProps, 'to' | OMISSION> & {
    icons?: React.ReactNode;
    href: string | undefined | null;
    className?: string;
}

function WikiLink<N extends string>(props: Props<N>) {
    const {
        icons,
        href,
        className,
        ...otherProps
    } = props;

    const strings = useTranslation(i18n);
    const lang = useCurrentLanguage();

    return (
        <Link
            className={_cs(styles.wikiLink, className)}
            href={`https://go-wiki.ifrc.org/${lang}/${href}`}
            title={strings.goWikiLabel}
            icons={icons}
            external
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            <WikiHelpSectionLineIcon />
        </Link>
    );
}

export default WikiLink;
