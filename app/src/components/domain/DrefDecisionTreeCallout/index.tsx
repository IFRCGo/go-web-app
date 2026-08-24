import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import DrefDecisionTreeButton from '#components/domain/DrefDecisionTreeButton';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function DrefDecisionTreeCallout(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);

    return (
        <Container
            className={_cs(styles.drefDecisionTreeCallout, className)}
            heading={strings.decisionTreeCalloutHeading}
            headerActions={<DrefDecisionTreeButton />}
            withPadding
            withDarkBackground
            spacing="lg"
            headingLevel={4}
        >
            {strings.decisionTreeCalloutDescription}
        </Container>
    );
}

export default DrefDecisionTreeCallout;
