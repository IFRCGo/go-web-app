import { _cs } from '@togglecorp/fujs';

import Heading, { Props as HeadingProps } from '#components/Heading';
import useBasicLayout from '#hooks/useBasicLayout';

import styles from './styles.module.css';

interface Props {
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    heading: React.ReactNode;
    headingLevel?: HeadingProps['level'];
    className?: string;
}

function Header(props: Props) {
    const {
        icons,
        actions,
        heading,
        className,
        headingLevel,
    } = props;

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        icons,
        actions,
        children: (
            <Heading
                level={headingLevel}
            >
                {heading}
            </Heading>
        ),
        className,
    });

    return (
        <header
            className={_cs(styles.header, containerClassName)}
        >
            {content}
        </header>
    );
}

export default Header;
