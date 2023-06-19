import { generatePath } from 'react-router-dom';
import { useContext } from 'react';
import { IoChevronForwardOutline } from 'react-icons/io5';

import Container from '#components/Container';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface RegionResult {
  id: number;
  name: string;
  score: number;
}

interface Props {
  data: RegionResult[] | undefined;
  actions: React.ReactNode;
}

function RegionList(props: Props) {
    const {
        data,
        actions,
    } = props;

    const strings = useTranslation(i18n);
    const { region: regionRoute } = useContext(RouteContext);

    if (!data) {
        return null;
    }

    return (
        <Container
            actions={actions}
            heading={strings.searchIfrcRegion}
        >
            {data.map((region) => (
                <Link
                    to={generatePath(regionRoute.absolutePath, { regionId: String(region.id) })}
                    className={styles.regionName}
                    key={region.id}
                    actions={<IoChevronForwardOutline />}
                    withUnderline
                >
                    {region.name}
                </Link>
            ))}
        </Container>
    );
}

export default RegionList;
