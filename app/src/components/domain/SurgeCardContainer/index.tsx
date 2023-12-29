import { Container } from '@ifrc-go/ui';

import styles from './styles.module.css';

interface Props {
    heading: React.ReactNode;
    children: React.ReactNode;
}

function SurgeCardContainer(props: Props) {
    const {
        heading,
        children,
    } = props;

    return (
        <Container
            className={styles.surgeCardContainer}
            childrenContainerClassName={styles.content}
            heading={heading}
            withHeaderBorder
        >
            {children}
        </Container>
    );
}

export default SurgeCardContainer;
