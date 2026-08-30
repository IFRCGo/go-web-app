import { type SVGProps } from 'react';
import {
    DisasterRiskReductionIcon,
    EducationIcon,
    HealthIcon,
    LivelihoodIcon,
    MigrationIcon,
    NationalSocietyDevelopmentIcon,
    PartnershipIcon,
    ProtectionIcon,
    ShelterIcon,
    WaterSanitationAndHygieneIcon,
} from '@ifrc-go/icons';
import { isNotDefined } from '@togglecorp/fujs';

type SectorIconComponent = React.ComponentType<SVGProps<SVGSVGElement> & { title?: string }>;

// the backend has no icons for sectors, so we map them by id here; the
// sector rows (deployments.Sector) are seeded with fixed ids, stable
// across GO deployments
// NOTE: CEA uses PartnershipIcon, following the surge catalogue navigation
const iconBySectorId: Record<number, SectorIconComponent> = {
    0: WaterSanitationAndHygieneIcon, // WASH
    1: ProtectionIcon, // PGI
    2: PartnershipIcon, // CEA
    3: MigrationIcon, // Migration
    4: HealthIcon, // Health (public)
    5: DisasterRiskReductionIcon, // DRR
    6: ShelterIcon, // Shelter
    7: NationalSocietyDevelopmentIcon, // NS Strengthening
    8: EducationIcon, // Education
    9: LivelihoodIcon, // Livelihoods and basic needs
};

interface Props extends SVGProps<SVGSVGElement> {
    sectorId: number | undefined | null;
    title?: string;
}

function SectorIcon(props: Props) {
    const {
        sectorId,
        ...otherProps
    } = props;

    if (isNotDefined(sectorId)) {
        return null;
    }

    const Icon = iconBySectorId[sectorId];
    if (isNotDefined(Icon)) {
        return null;
    }

    return (
        <Icon
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        />
    );
}

export default SectorIcon;
