import { _cs } from '@togglecorp/fujs';

import Heading, { type HeadingLevel } from '#components/printable/Heading';

import styles from './styles.module.css';

export interface Props {
    heading?: React.ReactNode;
    headingLevel?: HeadingLevel;
    children?: React.ReactNode;
    childrenContainerClassName?: string;
}

function Container(props: Props) {
    const {
        heading,
        headingLevel = 3,
        children,
        childrenContainerClassName,
    } = props;

    return (
        <>
            {heading && (
                <Heading level={headingLevel}>
                    {heading}
                </Heading>
            )}
            <div className={_cs(styles.content, childrenContainerClassName)}>
                {children}
            </div>
        </>
    );
}

export default Container;
