import {
    faBars,
    faCircleUser,
} from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    Heading,
    ListView,
    PageContainer,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
  className?: string;
}

function NrwNavbar(props: Props) {
    const { className } = props;

    const strings = useTranslation(i18n);

    return (
        <nav className={_cs(styles.nrwNavbar, className)}>
            <PageContainer
                className={styles.pageContainer}
                contentClassName={styles.content}
            >
                <ListView withWrap withSpaceBetweenContents>
                    <div className={styles.brand}>
                        <FontAwesomeIcon icon={faBars} className={styles.icon} />
                        <Heading level={3} className={styles.heading}>
                            {strings.nrwNavbarTitle}
                        </Heading>
                    </div>
                    <FontAwesomeIcon icon={faCircleUser} className={styles.iconUser} />
                </ListView>
            </PageContainer>
        </nav>
    );
}

export default NrwNavbar;
