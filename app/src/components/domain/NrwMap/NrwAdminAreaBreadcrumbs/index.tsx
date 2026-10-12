import { useContext } from 'react';
import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    Breadcrumbs,
    RawButton,
} from '@ifrc-go/ui';

import NrwAdminAreasContext from '#views/CountryProfileNationalRiskWatch/NrwAdminAreasProvider/NrwAdminAreasContext';
import {
    type AdminLevel,
    type NrwEvent,
} from '#views/CountryProfileNationalRiskWatch/types';

import styles from './styles.module.css';

export type NrwAdminAreaBreadcrumbsEvent = Pick<NrwEvent, 'eventLabel'>;

function NrwAdminAreaBreadcrumbs(props: {
    event: NrwAdminAreaBreadcrumbsEvent;
}) {
    const { event } = props;

    const {
        initialAdminLevel,
        drillPath,
        pending,
        drillUpTo,
    } = useContext(NrwAdminAreasContext);

    // Each crumb jumps to the level it opened: the first exposed level for
    // the event, the level below each admin area drilled into.
    const crumbs = [
        {
            key: 'event',
            adminLevel: initialAdminLevel,
            label: event.eventLabel,
        },
        ...drillPath.map((adminArea, index) => ({
            key: adminArea.placeCode,
            adminLevel: (initialAdminLevel + index + 1) as AdminLevel,
            label: adminArea.name,
        })),
    ];

    const lastCrumb = crumbs.pop();

    return (
        <Breadcrumbs
            className={styles.nrwAdminAreaBreadcrumbs}
            separator={(
                <FontAwesomeIcon
                    className={styles.separatorIcon}
                    icon={faChevronRight}
                />
            )}
        >
            {crumbs.map((crumb) => (
                <RawButton
                    key={crumb.key}
                    className={styles.crumbButton}
                    name={crumb.adminLevel}
                    disabled={pending}
                    onClick={drillUpTo}
                >
                    {crumb.label}
                </RawButton>
            ))}
            {lastCrumb && (
                <span
                    key={lastCrumb.key}
                    className={styles.currentCrumb}
                    aria-current="location"
                >
                    {lastCrumb.label}
                </span>
            )}
        </Breadcrumbs>
    );
}

export default NrwAdminAreaBreadcrumbs;
