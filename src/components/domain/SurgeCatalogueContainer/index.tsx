import Container from '#components/Container';

import styles from './styles.module.css';

interface Props {
    heading: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
}

function SurgeCatalogueContainer(props: Props) {
    const {
        heading,
        description,
        children,
    } = props;

    return (
        <Container
            headingLevel={2}
            className={styles.surgeCatalogueContainer}
            childrenContainerClassName={styles.content}
            heading={heading}
            headerDescription={description}
            headerDescriptionContainerClassName={styles.description}
        >
            {children}
        </Container>
    );
}

export default SurgeCatalogueContainer;
