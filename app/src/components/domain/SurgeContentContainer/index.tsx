import { Container } from '@ifrc-go/ui';

import styles from './styles.module.css';

interface Props {
    heading: React.ReactNode;
    children: React.ReactNode;
}

function SurgeContentContainer(props: Props) {
    const {
        heading,
        children,
    } = props;

    return (
        <Container
            className={styles.surgeContentContainer}
            childrenContainerClassName={styles.content}
            heading={heading}
            withHeaderBorder
        >
            {children}
        </Container>
    );
}

export default SurgeContentContainer;
