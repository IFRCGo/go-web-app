import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    ArrowDownSmallFillIcon,
    ArrowRightSmallFillIcon,
} from '@ifrc-go/icons';
import {
    Heading,
    InlineLayout,
    Label,
    ListView,
    RawButton,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import Bar from './Bar';
import {
    type PhaseKey,
    PHASES,
    type TimelineGroup,
} from './types';
import { packLanes } from './utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function OperationalTimeline(props: Props) {
    const { className } = props;

    const strings = useTranslation(i18n);

    // Each sector is a collapsible group; they start collapsed.
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const handleGroupToggle = useCallback(
        (groupId: string) => {
            setExpandedGroups((prevValue) => ({
                ...prevValue,
                [groupId]: !prevValue[groupId],
            }));
        },
        [],
    );

    const phaseLabels: Record<PhaseKey, string> = {
        pre_disaster: strings.phasePreDisaster,
        w1: strings.phaseW1,
        w2: strings.phaseW2,
        w3: strings.phaseW3,
        w4: strings.phaseW4,
        month_2: strings.phaseMonth2,
        month_3: strings.phaseMonth3,
        month_4: strings.phaseMonth4,
        month_5_12: strings.phaseMonth5To12,
        closure: strings.phaseClosure,
    };

    // NOTE: Generated from the IFRC "Ops Toolbox Content" spreadsheet (May 2026).
    // Each sector (Category/sector column) becomes a group; bars come from its
    // timeline rows. `startPhase`/`endPhase` are mapped from the "Timeline" column
    // (Pre-disaster, Week 1-4, Month 2-4, Month 5-12, Closure); the card description
    // is the popup text and `document.url` is the row's SharePoint hyperlink.
    // Re-run the generator against an updated sheet to refresh this data.
    const groups = useMemo<TimelineGroup[]>(
        () => [
            {
                id: 'cea',
                label: strings.groupCea,
                bars: [
                    {
                        id: 'cea-pre',
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CEA/0.%20PRE-DISASTER?csf=1&web=1&e=oGl66K',
                        },
                    },
                    {
                        id: 'cea-1',
                        label: strings.barCea1,
                        startPhase: 'w1',
                        endPhase: 'w2',
                        description: strings.barCea1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CEA/W1-2.%20Identify%20a%20CEA%20surge%20focal%20point%20(NS,%20IFRC%20or%20PNS)?csf=1&web=1&e=hKNgjT',
                        },
                    },
                    {
                        id: 'cea-2',
                        label: strings.barCea2,
                        startPhase: 'w2',
                        endPhase: 'w4',
                        description: strings.barCea2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CEA/W2-W4.%20Brief%20staff%20and%20volunteers%20on%20CEA%20requirements%20%E2%80%93%20inc.%20assessment%20teams?csf=1&web=1&e=gCVNx9',
                        },
                    },
                    {
                        id: 'cea-3',
                        label: strings.barCea3,
                        startPhase: 'w2',
                        endPhase: 'month_5_12',
                        description: strings.barCea3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CEA/W2-M12.%20Regularly%20share%20information%20with%20communities%20about%20the%20response?csf=1&web=1&e=rKo84d',
                        },
                    },
                    {
                        id: 'cea-4',
                        label: strings.barCea4,
                        startPhase: 'w3',
                        endPhase: 'month_5_12',
                        description: strings.barCea4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CEA/W3-M12%20Establish%20approaches%20for%20community%20participation%E2%80%8B?csf=1&web=1&e=PmwfVE',
                        },
                    },
                    {
                        id: 'cea-5',
                        label: strings.barCea5,
                        startPhase: 'w3',
                        endPhase: 'month_5_12',
                        description: strings.barCea5Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CEA/W3-M12.%20Set%20up%20a%20community%20feedback%20mechanism.%20Use%20community%20feedback%20to%20inform%20operational%20decisions?csf=1&web=1&e=Nchoao',
                        },
                    },
                    {
                        id: 'cea-6',
                        label: strings.barCea6,
                        startPhase: 'closure',
                        endPhase: 'closure',
                        description: strings.barCea6Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CEA/Clousure%26Transition.%20Discuss%20response%20closure%20with%20communities?csf=1&web=1&e=83cErz',
                        },
                    },
                    {
                        id: 'cea-7',
                        label: strings.barCea7,
                        startPhase: 'closure',
                        endPhase: 'closure',
                        description: strings.barCea7Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CEA/Clousure%26Transition.%20Support%20NS%20long-term%20CEA%20plan?csf=1&web=1&e=BcCXQd',
                        },
                    },
                ],
            },
            {
                id: 'communications',
                label: strings.groupCommunications,
                bars: [
                    {
                        id: 'communications-pre',
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/COMMUNICATIONS/0.%20Pre-disaster?csf=1&web=1&e=LZo8QA',
                        },
                    },
                    {
                        id: 'communications-1',
                        label: strings.barCommunications1,
                        startPhase: 'w1',
                        endPhase: 'w2',
                        description: strings.barCommunications1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/COMMUNICATIONS/W1-W2.%20Identify%20spokesperson%20in%20country,%20at%20regional%20and%20global%20level?csf=1&web=1&e=Z7aaVL',
                        },
                    },
                    {
                        id: 'communications-2',
                        label: strings.barCommunications2,
                        startPhase: 'w1',
                        endPhase: 'w2',
                        description: strings.barCommunications2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/COMMUNICATIONS/W1-W2.%20Issue%20press%20release%20focusing%20on%20humanitarian%20needs%20and%20RCRC%20response?csf=1&web=1&e=eX52Ka',
                        },
                    },
                    {
                        id: 'communications-3',
                        label: strings.barCommunications3,
                        startPhase: 'w1',
                        endPhase: 'w3',
                        description: strings.barCommunications3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/COMMUNICATIONS/W1-W3.%20Define%20key%20messages%20and%20reactive%20lines%20%E2%80%8B?csf=1&web=1&e=fcOYJw',
                        },
                    },
                    {
                        id: 'communications-4',
                        label: strings.barCommunications4,
                        startPhase: 'w1',
                        endPhase: 'w4',
                        description: strings.barCommunications4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/COMMUNICATIONS/W3-W4.%20Develop%20communications%20plans%20and%20strategy?csf=1&web=1&e=47vgu8',
                        },
                    },
                    {
                        id: 'communications-5',
                        label: strings.barCommunications5,
                        startPhase: 'w1',
                        endPhase: 'month_5_12',
                        description: strings.barCommunications5Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/COMMUNICATIONS/W1-M12.%20Gather%20communication%20materials%20and%20ensure%20proper%20dissemination?csf=1&web=1&e=IpSp4H',
                        },
                    },
                    {
                        id: 'communications-6',
                        isEmpty: true,
                        label: strings.barCommunications6,
                        startPhase: 'w1',
                        endPhase: 'month_5_12',
                        description: strings.barCommunications6Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/COMMUNICATIONS/W1-M12.%20Media%20and%20social%20media%20listening%20and%20monitoring?csf=1&web=1&e=IyaT0e',
                        },
                    },
                ],
            },
            {
                id: 'cva',
                label: strings.groupCva,
                bars: [
                    {
                        id: 'cva-pre',
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CVA/0.%20Preparedness?csf=1&web=1&e=NJLjTC',
                        },
                    },
                    {
                        id: 'cva-1',
                        label: strings.barCva1,
                        startPhase: 'w1',
                        endPhase: 'w3',
                        description: strings.barCva1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CVA/W1-W3.%20Assessments?csf=1&web=1&e=tzGwpc',
                        },
                    },
                    {
                        id: 'cva-2',
                        label: strings.barCva2,
                        startPhase: 'w2',
                        endPhase: 'month_2',
                        description: strings.barCva2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CVA/W2-M2.%20Response%20Analysis?csf=1&web=1&e=hctGfG',
                        },
                    },
                    {
                        id: 'cva-3',
                        label: strings.barCva3,
                        startPhase: 'w2',
                        endPhase: 'closure',
                        description: strings.barCva3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CVA/W2-Clousure%26Transition.%20Monitoring%20and%20evaluation?csf=1&web=1&e=dtcVq6',
                        },
                    },
                    {
                        id: 'cva-4',
                        label: strings.barCva4,
                        startPhase: 'month_3',
                        endPhase: 'month_5_12',
                        description: strings.barCva4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/CVA/M3-M12.%20Implementation?csf=1&web=1&e=7wFhVQ',
                        },
                    },
                ],
            },
            {
                id: 'green-response',
                label: strings.groupGreenResponse,
                bars: [
                    {
                        id: 'green-response-1',
                        label: strings.barGreenResponse1,
                        startPhase: 'w1',
                        endPhase: 'w4',
                        description: strings.barGreenResponse1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/GREEN%20RESPONSE/W1-W4.%20Ensure%20climate%20change%20projections%20%26%20local%20environmental%20risks%20are%20considered%20in%20assessments%20%26%20planning%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%80%8B%20%20Encourage%20sector%20leads%20to%20plan%20for%20%27green%27%20innovations%20and%20solutions?csf=1&web=1&e=7EgKcQ',
                        },
                    },
                    {
                        id: 'green-response-2',
                        isEmpty: true,
                        label: strings.barGreenResponse2,
                        startPhase: 'month_2',
                        endPhase: 'month_3',
                        description: strings.barGreenResponse2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/GREEN%20RESPONSE/M2-M3%20Conduct%20Environmental%20Screening?csf=1&web=1&e=sG1Enf',
                        },
                    },
                    {
                        id: 'green-response-3',
                        label: strings.barGreenResponse3,
                        startPhase: 'month_2',
                        endPhase: 'month_4',
                        description: strings.barGreenResponse3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/GREEN%20RESPONSE/M2-M4.%20Take%20steps%20to%20reduce%20environmental%20footprint%20of%20offices,%20warehouses,%20logistics%20and%20supply%20chain%20etc%20by%20energy%20efficiency,%20clean%20energy,%20reduce%20%26%20manage%20waste,%20sustainable%20procurement%20etc?csf=1&web=1&e=3mWA7k',
                        },
                    },
                    {
                        id: 'green-response-4',
                        isEmpty: true,
                        label: strings.barGreenResponse4,
                        startPhase: 'month_4',
                        endPhase: 'month_5_12',
                        description: strings.barGreenResponse4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/GREEN%20RESPONSE/M4-M12%20Integrate%20awareness%20raising%20and%20behaviour%20change%20key%20messages%20into%20relevant%20activities,%20to%20encourage%20positive%20environmental%20practices%20in%20communities?csf=1&web=1&e=qmLRAs',
                        },
                    },
                    {
                        id: 'green-response-5',
                        label: strings.barGreenResponse5,
                        startPhase: 'closure',
                        endPhase: 'closure',
                        description: strings.barGreenResponse5Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/GREEN%20RESPONSE/Clousure%26Transition.%20Build%20on%20successes%20and%20encourage%20NS%20to%20consider%20a%20new%20or%20updated%20Environmental%20and,or%20Climate%20Policy?csf=1&web=1&e=8M42Y7',
                        },
                    },
                ],
            },
            {
                id: 'health',
                label: strings.groupHealth,
                bars: [
                    {
                        id: 'health-pre',
                        isEmpty: true,
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HEALTH/0.%20Pre-Disaster?csf=1&web=1&e=qpIKw3',
                        },
                    },
                    {
                        id: 'health-1',
                        isEmpty: true,
                        label: strings.barHealth1,
                        startPhase: 'w1',
                        endPhase: 'w1',
                        description: strings.barHealth1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HEALTH/1.%20W1.%20Identify%20HR,%20ERU,%20and%20technical%20expertise%20needed%20to%20meet%20health%20gaps?csf=1&web=1&e=Cb3AM6',
                        },
                    },
                    {
                        id: 'health-2',
                        label: strings.barHealth2,
                        startPhase: 'w1',
                        endPhase: 'w2',
                        description: strings.barHealth2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HEALTH/2.%20W1-W2.%20Conduct%20health%20assessment,%20identify%20response%20gaps%20and%20RCRC%20health%20capacities?csf=1&web=1&e=UV6b61',
                        },
                    },
                    {
                        id: 'health-3',
                        label: strings.barHealth3,
                        startPhase: 'w1',
                        endPhase: 'month_2',
                        description: strings.barHealth3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HEALTH/3.%20W1-M2.%20Adapt%20and%20scale%20up%20existing%20health%20services%20and%20implement%20new%20health%20programming%20adapted%20to%20emergency%20needs?csf=1&web=1&e=HynpUm',
                        },
                    },
                    {
                        id: 'health-4',
                        label: strings.barHealth4,
                        startPhase: 'w1',
                        endPhase: 'month_5_12',
                        description: strings.barHealth4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HEALTH/4.%20W1-M5.%20Data%20collection,%20quality%20assurance,%20M%26E%20and%20KPIs?csf=1&web=1&e=b17wv2',
                        },
                    },
                    {
                        id: 'health-5',
                        isEmpty: true,
                        label: strings.barHealth5,
                        startPhase: 'month_3',
                        endPhase: 'month_5_12',
                        description: strings.barHealth5Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HEALTH/5.%20M3-M5.%20Transition%20to%20long-term%20health%20approach%20(recovery%20or%20sustained%20response)?csf=1&web=1&e=Jc386Y',
                        },
                    },
                ],
            },
            {
                id: 'humanitarian-diplomacy',
                label: strings.groupHumanitarianDiplomacy,
                bars: [
                    {
                        id: 'humanitarian-diplomacy-pre',
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HUMANITARIAN%20DIPLOMACY/0.%20Pre-Disaster?csf=1&web=1&e=qJQIGI',
                        },
                    },
                    {
                        id: 'humanitarian-diplomacy-1',
                        label: strings.barHumanitarianDiplomacy1,
                        startPhase: 'w1',
                        endPhase: 'month_4',
                        description: strings.barHumanitarianDiplomacy1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HUMANITARIAN%20DIPLOMACY/W1-M4.%20Develop%26Update%20stakeholders%20mapping%20and%20engagement%20plan?csf=1&web=1&e=I8Nl5h',
                        },
                    },
                    {
                        id: 'humanitarian-diplomacy-2',
                        label: strings.barHumanitarianDiplomacy2,
                        startPhase: 'w1',
                        endPhase: 'month_5_12',
                        description: strings.barHumanitarianDiplomacy2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HUMANITARIAN%20DIPLOMACY/W1-M5.%20Develop%26Update%20Key%20messages%20on%20identified%20issues?csf=1&web=1&e=QMqxMk',
                        },
                    },
                    {
                        id: 'humanitarian-diplomacy-3',
                        label: strings.barHumanitarianDiplomacy3,
                        startPhase: 'w2',
                        endPhase: 'w3',
                        description: strings.barHumanitarianDiplomacy3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HUMANITARIAN%20DIPLOMACY/W2-W3%20Develop%20trackers%20of%20positions%20and%20%20engagements?csf=1&web=1&e=EdFtxo',
                        },
                    },
                    {
                        id: 'humanitarian-diplomacy-4',
                        label: strings.barHumanitarianDiplomacy4,
                        startPhase: 'w3',
                        endPhase: 'w4',
                        description: strings.barHumanitarianDiplomacy4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/HUMANITARIAN%20DIPLOMACY/W3-W4%20Set%20up%20an%20HD%20support%20group%20(Coordination)?csf=1&web=1&e=Vsyheg',
                        },
                    },
                ],
            },
            {
                id: 'idl',
                label: strings.groupIdl,
                bars: [
                    {
                        id: 'idl-pre',
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/IDL/0.%20Pre-Disaster?csf=1&web=1&e=4Ma9n5',
                        },
                    },
                    {
                        id: 'idl-1',
                        label: strings.barIdl1,
                        startPhase: 'w1',
                        endPhase: 'w1',
                        description: strings.barIdl1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/IDL/W1.%20Request%20humanitarian%20access%20to%20authorities?csf=1&web=1&e=kqD5CO',
                        },
                    },
                    {
                        id: 'idl-2',
                        label: strings.barIdl2,
                        startPhase: 'w1',
                        endPhase: 'w4',
                        description: strings.barIdl2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/IDL/W1-W4.%20Develop%20IDRL%20factsheet%20to%20inform%20log%20and%20operations%20and%20keep%20updating?csf=1&web=1&e=LM2r4C',
                        },
                    },
                ],
            },
            {
                id: 'im',
                label: strings.groupIm,
                bars: [
                    {
                        id: 'im-pre',
                        isEmpty: true,
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/IM/0.%20Pre-Disaster?csf=1&web=1&e=q70uhc',
                        },
                    },
                    {
                        id: 'im-1',
                        isEmpty: true,
                        label: strings.barIm1,
                        startPhase: 'w1',
                        endPhase: 'w4',
                        description: strings.barIm1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/IM/W1-4%20Task%20SIMS?csf=1&web=1&e=kSaVAg',
                        },
                    },
                    {
                        id: 'im-2',
                        label: strings.barIm2,
                        startPhase: 'w1',
                        endPhase: 'month_5_12',
                        description: strings.barIm2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/IM/W1-M12%20Maintain%20GO%20emergency%20page?csf=1&web=1&e=VUx4s6',
                        },
                    },
                    {
                        id: 'im-3',
                        isEmpty: true,
                        label: strings.barIm3,
                        startPhase: 'w1',
                        endPhase: 'month_5_12',
                        description: strings.barIm3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/IM/W1-M12.%20Support%20Situational%20Overview?csf=1&web=1&e=GGPvjs',
                        },
                    },
                    {
                        id: 'im-4',
                        isEmpty: true,
                        label: strings.barIm4,
                        startPhase: 'w2',
                        endPhase: 'w4',
                        description: strings.barIm4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/IM/W2-4%20Define%20IM%20strategy?csf=1&web=1&e=Jf95aJ',
                        },
                    },
                    {
                        id: 'im-5',
                        label: strings.barIm5,
                        startPhase: 'w2',
                        endPhase: 'w4',
                        description: strings.barIm5Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/IM/W2-4%20Produce%20membership%20picture?csf=1&web=1&e=QigzEE',
                        },
                    },
                ],
            },
            {
                id: 'logistics',
                label: strings.groupLogistics,
                bars: [
                    {
                        id: 'logistics-1',
                        label: strings.barLogistics1,
                        startPhase: 'w1',
                        endPhase: 'w1',
                        description: strings.barLogistics1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/W1.%20LOGISTICS%20ASSESSMENT%20INCLUDING%20INFRASTRUCTURE,%20DAMAGE%20AND%20ACCESS?csf=1&web=1&e=y4uxN2',
                        },
                    },
                    {
                        id: 'logistics-2',
                        label: strings.barLogistics2,
                        startPhase: 'w1',
                        endPhase: 'w1',
                        description: strings.barLogistics2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/W1.%20MOBILIZATION%20TABLE%20IN%20PLACE%20%26%20MODIFIED%20AS%20OPERATION%20PROGRESSES?csf=1&web=1&e=TTZcn2',
                        },
                    },
                    {
                        id: 'logistics-3',
                        label: strings.barLogistics3,
                        startPhase: 'w1',
                        endPhase: 'w1',
                        description: strings.barLogistics3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/W1.%20SUPPLY%20CHAIN%20REPORTING?csf=1&web=1&e=QLZ96n',
                        },
                    },
                    {
                        id: 'logistics-4',
                        label: strings.barLogistics4,
                        startPhase: 'w2',
                        endPhase: 'w2',
                        description: strings.barLogistics4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/W2.%20ANALYZE%20NEEDS%20FOR%20SURGE%20HR%20NEEDS?csf=1&web=1&e=0dsmsY',
                        },
                    },
                    {
                        id: 'logistics-5',
                        label: strings.barLogistics5,
                        startPhase: 'w2',
                        endPhase: 'w2',
                        description: strings.barLogistics5Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/W2.%20GATHER%20PRELIMINARY%20DATA%20OF%20THE%20NEEDS%20TO%20DEVELOP%20A%20DRAFT%20PROCUREMENT%20PLAN?csf=1&web=1&e=qEXsN3',
                        },
                    },
                    {
                        id: 'logistics-6',
                        label: strings.barLogistics6,
                        startPhase: 'w2',
                        endPhase: 'w3',
                        description: strings.barLogistics6Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/W2-3.%20SET%20UP%20FLEET%20PLAN%20(INCL.%20IN-COUNTRY%20RESOURCES%20FOR%20CAR%20RENTAL)?csf=1&web=1&e=B8lAql',
                        },
                    },
                    {
                        id: 'logistics-7',
                        label: strings.barLogistics7,
                        startPhase: 'w2',
                        endPhase: 'w4',
                        description: strings.barLogistics7Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/W2-4.%20CREATE%20LOG%20PLAN%20OF%20ACTION%20(INCL.%20IDENTIFYING%20IMPORT%20OPTIONS%20FOR%20AIR-SEA-ROAD,%20AGENTS,%20WH%26TRANSPORT)?csf=1&web=1&e=RZiOde',
                        },
                    },
                    {
                        id: 'logistics-8',
                        isEmpty: true,
                        label: strings.barLogistics8,
                        startPhase: 'w3',
                        endPhase: 'w4',
                        description: strings.barLogistics8Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/W3-4.%20DEVELOP%20A%20PROCUREMENT%20PLAN?csf=1&web=1&e=awvqma',
                        },
                    },
                    {
                        id: 'logistics-9',
                        label: strings.barLogistics9,
                        startPhase: 'w4',
                        endPhase: 'w4',
                        description: strings.barLogistics9Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/W4.%20REVISE%20PROCUREMENT%20PLAN%20(CONTINUOS%20PROCESS%20BASED%20ON%20THE%20OPERATIONAL%20NEEDS)?csf=1&web=1&e=pvRi3H',
                        },
                    },
                    {
                        id: 'logistics-10',
                        label: strings.barLogistics10,
                        startPhase: 'w4',
                        endPhase: 'w4',
                        description: strings.barLogistics10Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/W4.%20SET%20UP%20FLEET,%20START%20MOBILIZATION%20OF%20REGIONAL%20FLEET?csf=1&web=1&e=fMYGEt',
                        },
                    },
                    {
                        id: 'logistics-11',
                        label: strings.barLogistics11,
                        startPhase: 'month_2',
                        endPhase: 'month_4',
                        description: strings.barLogistics11Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/LOGISTICS/M2-4.%20REVISE%20LOG%20PLAN%20OF%20ACTION%20BASED%20ON%20THE%20LONG-TERM%20OPERATIONAL%20PLAN?csf=1&web=1&e=nxL8ek',
                        },
                    },
                ],
            },
            {
                id: 'monitoring-evaluation-reporting',
                label: strings.groupMonitoringEvaluationReporting,
                bars: [
                    {
                        id: 'monitoring-evaluation-reporting-pre',
                        isEmpty: true,
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/PRE-DISASTER?csf=1&web=1&e=5apdbA',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-1',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting1,
                        startPhase: 'w1',
                        endPhase: 'w2',
                        description: strings.barMonitoringEvaluationReporting1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/W1-2.%20Create%20sit%20reps%20every%20two%20days?csf=1&web=1&e=9NzUHx',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-2',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting2,
                        startPhase: 'w3',
                        endPhase: 'w4',
                        description: strings.barMonitoringEvaluationReporting2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/W3-4.%20Create%20sit%20reps%20weekly?csf=1&web=1&e=93SGOM',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-3',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting3,
                        startPhase: 'w3',
                        endPhase: 'w4',
                        description: strings.barMonitoringEvaluationReporting3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/W3-4.%20Develop%20Ops%20update%201?csf=1&web=1&e=pmeRgb',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-4',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting4,
                        startPhase: 'w4',
                        endPhase: 'month_2',
                        description: strings.barMonitoringEvaluationReporting4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/W4-M2.%20Develop%20Monitoring%20and%20Evaluation%20Plan?csf=1&web=1&e=jEQwE2',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-5',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting5,
                        startPhase: 'w4',
                        endPhase: 'month_2',
                        description: strings.barMonitoringEvaluationReporting5Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/W4-M2.%20Develop%20Ops%20update%202?csf=1&web=1&e=g8yyuj',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-6',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting6,
                        startPhase: 'month_2',
                        endPhase: 'month_4',
                        description: strings.barMonitoringEvaluationReporting6Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/M2-M4.%20Create%20indicator%20tracking%20table?csf=1&web=1&e=RfaIab',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-7',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting7,
                        startPhase: 'month_3',
                        endPhase: 'month_4',
                        description: strings.barMonitoringEvaluationReporting7Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/M3-4.%20Conduct%20RTE%E2%80%8B?csf=1&web=1&e=uuj5WC',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-8',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting8,
                        startPhase: 'month_3',
                        endPhase: 'month_4',
                        description: strings.barMonitoringEvaluationReporting8Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/M3-M4.%20Conduct%20Federation-Wide%20reporting?csf=1&web=1&e=z1678V',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-9',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting9,
                        startPhase: 'month_3',
                        endPhase: 'month_4',
                        description: strings.barMonitoringEvaluationReporting9Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/M3-M4.%20Revise%20Monitoring%20and%20Evaluation%20plan?csf=1&web=1&e=07h7UT',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-10',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting10,
                        startPhase: 'month_5_12',
                        endPhase: 'month_5_12',
                        description: strings.barMonitoringEvaluationReporting10Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/M5-M12.%20Communicate%20decisions%20on%20the%20future%20of%20operations%20in%20the%2012-month%20Ops%20update?csf=1&web=1&e=8Zcsh8',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-11',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting11,
                        startPhase: 'closure',
                        endPhase: 'closure',
                        description: strings.barMonitoringEvaluationReporting11Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/Closure-Transition;%20Communicate%20decisions%20on%20the%20future%20of%20%20the%20operation?csf=1&web=1&e=hqruqA',
                        },
                    },
                    {
                        id: 'monitoring-evaluation-reporting-12',
                        isEmpty: true,
                        label: strings.barMonitoringEvaluationReporting12,
                        startPhase: 'closure',
                        endPhase: 'closure',
                        description: strings.barMonitoringEvaluationReporting12Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/MONITORING,%20EVALUATION%20%26%20REPORTING/Closure-Transition;%20Use%20the%20template%20in%20the%20case%20of%20a%20final%20report%E2%80%8B?csf=1&web=1&e=uGONfq',
                        },
                    },
                ],
            },
            {
                id: 'nsd',
                label: strings.groupNsd,
                bars: [
                    {
                        id: 'nsd-pre',
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/NSD/0.%20Pre-Disaster?csf=1&web=1&e=30vbvE',
                        },
                    },
                    {
                        id: 'nsd-1',
                        label: strings.barNsd1,
                        startPhase: 'w1',
                        endPhase: 'w1',
                        description: strings.barNsd1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/NSD/W1.%20Mapping%20NSD%20support%20services?csf=1&web=1&e=T8RzpA',
                        },
                    },
                    {
                        id: 'nsd-2',
                        label: strings.barNsd2,
                        startPhase: 'w1',
                        endPhase: 'w3',
                        description: strings.barNsd2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/NSD/W1-W3.%20Run%20NSDiE%20rapid%20review%20and%20assessment?csf=1&web=1&e=Awa9oX',
                        },
                    },
                    {
                        id: 'nsd-3',
                        label: strings.barNsd3,
                        startPhase: 'w2',
                        endPhase: 'month_5_12',
                        description: strings.barNsd3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/NSD/W2-M12.%20Establish%20and%20maintain%20NSD%20Task%20Force%20(steering%20committee,%20working%20group,%20coordination%20group)?csf=1&web=1&e=6012Qq',
                        },
                    },
                    {
                        id: 'nsd-4',
                        label: strings.barNsd4,
                        startPhase: 'w3',
                        endPhase: 'month_5_12',
                        description: strings.barNsd4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/NSD/W3-M12,%20Identify%20and%20implement%20NSD%20priorities,%20develop%20or%20update%20one%20NSD%20plan?csf=1&web=1&e=eMIvMI',
                        },
                    },
                ],
            },
            {
                id: 'per',
                label: strings.groupPer,
                bars: [
                    {
                        id: 'per-pre',
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/PER/0.%20Pre-Disaster?csf=1&web=1&e=lose6D',
                        },
                    },
                    {
                        id: 'per-1',
                        label: strings.barPer1,
                        startPhase: 'w3',
                        endPhase: 'w4',
                        description: strings.barPer1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/PER/W3-W4.%20Design%20NS%20response%20capacity%20strengthening%20actions?csf=1&web=1&e=WCyNzp',
                        },
                    },
                    {
                        id: 'per-2',
                        label: strings.barPer2,
                        startPhase: 'w1',
                        endPhase: 'w2',
                        description: strings.barPer2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/PER/W1-W2.%20Analyse%20and%20verify%20NS%20response%20capacity?csf=1&web=1&e=FI3RP2',
                        },
                    },
                    {
                        id: 'per-3',
                        label: strings.barPer3,
                        startPhase: 'month_2',
                        endPhase: 'month_5_12',
                        description: strings.barPer3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/PER/M2-M12.%20Continuous%20monitoring%20of%20NS%20response%20capacity?csf=1&web=1&e=y6ZXaN',
                        },
                    },
                    {
                        id: 'per-4',
                        label: strings.barPer4,
                        startPhase: 'closure',
                        endPhase: 'closure',
                        description: strings.barPer4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/PER/Clousure%26Transition.%20Carry%20out%20operational%20learning%20review?csf=1&web=1&e=BjDBNY',
                        },
                    },
                ],
            },
            {
                id: 'safety-security',
                label: strings.groupSafetySecurity,
                bars: [
                    {
                        id: 'safety-security-pre',
                        isEmpty: true,
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SAFETY%20%26%20SECURITY/0.%20Pre-Disaster?csf=1&web=1&e=mjGY4L',
                        },
                    },
                    {
                        id: 'safety-security-1',
                        label: strings.barSafetySecurity1,
                        startPhase: 'w1',
                        endPhase: 'w1',
                        description: strings.barSafetySecurity1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SAFETY%20%26%20SECURITY/W1.%20Security%20Risk%20Assessment?csf=1&web=1&e=ff7cK3',
                        },
                    },
                    {
                        id: 'safety-security-2',
                        label: strings.barSafetySecurity2,
                        startPhase: 'w1',
                        endPhase: 'w2',
                        description: strings.barSafetySecurity2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SAFETY%20%26%20SECURITY/W1-W2.%20Develop%20Medevac%20plan?csf=1&web=1&e=DeYNjX',
                        },
                    },
                    {
                        id: 'safety-security-3',
                        label: strings.barSafetySecurity3,
                        startPhase: 'w2',
                        endPhase: 'w4',
                        description: strings.barSafetySecurity3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SAFETY%20%26%20SECURITY/W2-W4.%20Develop%20and%20update%20security%20management%20system%20according%20to%20IFRC%20minimum%20security%20requirement%20(in%20case%20no%20IFRC%20presence%20prior%20to%20disaster)?csf=1&web=1&e=XnNfO9',
                        },
                    },
                    {
                        id: 'safety-security-4',
                        label: strings.barSafetySecurity4,
                        startPhase: 'month_2',
                        endPhase: 'month_5_12',
                        description: strings.barSafetySecurity4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SAFETY%20%26%20SECURITY/M2-M12.%20Continuously%20monitoring%20of%20security%20situation%20in%20country%20and%20adjust%20accordingly?csf=1&web=1&e=SB2oOp',
                        },
                    },
                ],
            },
            {
                id: 'sprm',
                label: strings.groupSprm,
                bars: [
                    {
                        id: 'sprm-pre',
                        isEmpty: true,
                        label: strings.preparednessLabel,
                        startPhase: 'pre_disaster',
                        endPhase: 'pre_disaster',
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SPRM/Pre-disaster?csf=1&web=1&e=GNTqZY',
                        },
                    },
                    {
                        id: 'sprm-1',
                        isEmpty: true,
                        label: strings.barSprm1,
                        startPhase: 'w1',
                        endPhase: 'w1',
                        description: strings.barSprm1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SPRM/(access)%20W1.%20Create%20RM%20funding%20table?csf=1&web=1&e=UDcXGl',
                        },
                    },
                    {
                        id: 'sprm-2',
                        label: strings.barSprm2,
                        startPhase: 'w1',
                        endPhase: 'w1',
                        description: strings.barSprm2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SPRM/(access)%20W1.%20Schedule%20partners%20calls%20and%20briefings%20to%20present%20EA?csf=1&web=1&e=qud4et',
                        },
                    },
                    {
                        id: 'sprm-3',
                        label: strings.barSprm3,
                        startPhase: 'w1',
                        endPhase: 'w3',
                        description: strings.barSprm3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SPRM/W1-W3.%20Develop%20RM%20plan%20for%20emergency%20phase?csf=1&web=1&e=DV2MDv',
                        },
                    },
                    {
                        id: 'sprm-4',
                        label: strings.barSprm4,
                        startPhase: 'w2',
                        endPhase: 'w4',
                        description: strings.barSprm4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SPRM/(access)%20W2-W4.%20Schedule%20partner%20calls%20and%20briefings%20to%20present%20OS?csf=1&web=1&e=woPPba',
                        },
                    },
                    {
                        id: 'sprm-5',
                        label: strings.barSprm5,
                        startPhase: 'w2',
                        endPhase: 'closure',
                        description: strings.barSprm5Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SPRM/(access)%20W2-Transition.%20Manage%20the%20update%20of%20RM%20funding%20table%20and%20pledge%20status?csf=1&web=1&e=FoXblQ',
                        },
                    },
                    {
                        id: 'sprm-6',
                        label: strings.barSprm6,
                        startPhase: 'w2',
                        endPhase: 'closure',
                        description: strings.barSprm6Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SPRM/(access)%20W2-Transition.%20Support%20the%20appeal%20and%20operations%20manager%20to%20monitor%20pledges,%20donor%20requirements%20and%20interest?csf=1&web=1&e=EEv9fS',
                        },
                    },
                    {
                        id: 'sprm-7',
                        label: strings.barSprm7,
                        startPhase: 'month_2',
                        endPhase: 'closure',
                        description: strings.barSprm7Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SPRM/M2-Transition.%20Schedule%20regular%20partners%20calls%20and%20briefings%20to%20update%20EA%20and%20OS%20revisions?csf=1&web=1&e=B6wWMO',
                        },
                    },
                    {
                        id: 'sprm-8',
                        label: strings.barSprm8,
                        startPhase: 'month_2',
                        endPhase: 'month_5_12',
                        description: strings.barSprm8Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SPRM/M3-M12.%20Update%20RM%20Plan%20and%20Strategy%20regularly?csf=1&web=1&e=HirHGn',
                        },
                    },
                ],
            },
            {
                id: 'surge-hr',
                label: strings.groupSurgeHr,
                bars: [
                    {
                        id: 'surge-hr-1',
                        label: strings.barSurgeHr1,
                        startPhase: 'w1',
                        endPhase: 'month_2',
                        description: strings.barSurgeHr1Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SURGE%20%26%20HR/W1-M2.%20Send%20Surge%20alerts%20and%20mobilize%20Surge%20personnel?csf=1&web=1&e=ZSejly',
                        },
                    },
                    {
                        id: 'surge-hr-2',
                        label: strings.barSurgeHr2,
                        startPhase: 'w1',
                        endPhase: 'closure',
                        description: strings.barSurgeHr2Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SURGE%20%26%20HR/W1-Transition.%20Managing%20staff%20well-being?csf=1&web=1&e=sDDt4A',
                        },
                    },
                    {
                        id: 'surge-hr-3',
                        label: strings.barSurgeHr3,
                        startPhase: 'w1',
                        endPhase: 'closure',
                        description: strings.barSurgeHr3Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SURGE%20%26%20HR/W1-Transition.%20Safeguarding%20%26%20reporting%20concerns?csf=1&web=1&e=2B80SE',
                        },
                    },
                    {
                        id: 'surge-hr-4',
                        label: strings.barSurgeHr4,
                        startPhase: 'w2',
                        endPhase: 'month_5_12',
                        description: strings.barSurgeHr4Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SURGE%20%26%20HR/W2-M12.%20Workforce%20planning%20%26%20identifying%20HR%20priorities%20with%20NS?csf=1&web=1&e=1gsLL9',
                        },
                    },
                    {
                        id: 'surge-hr-5',
                        label: strings.barSurgeHr5,
                        startPhase: 'w3',
                        endPhase: 'month_5_12',
                        description: strings.barSurgeHr5Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SURGE%20%26%20HR/W3-M2.%20Staff%20recruitment%20%26%20contracting%20approaches?csf=1&web=1&e=kjdfoj',
                        },
                    },
                    {
                        id: 'surge-hr-6',
                        label: strings.barSurgeHr6,
                        startPhase: 'month_2',
                        endPhase: 'closure',
                        description: strings.barSurgeHr6Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SURGE%20%26%20HR/M2-Transition.%20Complete%20End%20of%20Mission%20(EOM)%20requirements?csf=1&web=1&e=pm7kep',
                        },
                    },
                    {
                        id: 'surge-hr-7',
                        label: strings.barSurgeHr7,
                        startPhase: 'month_3',
                        endPhase: 'month_4',
                        description: strings.barSurgeHr7Desc,
                        document: {
                            label: strings.openResourceLabel,
                            url: 'https://ifrcorg.sharepoint.com/:f:/r/sites/IFRCSharing/Shared%20Documents/GLOBAL%20SURGE/Operational%20Toolbox/SURGE%20%26%20HR/M3-M4.%20Inductions%20%26%20onboarding?csf=1&web=1&e=OzkXlw',
                        },
                    },
                ],
            },
        ],
        [strings],
    );

    return (
        <div className={_cs(styles.operationalTimeline, className)}>
            <ListView
                className={styles.timeline}
                layout="block"
                spacing="2xs"
            >
                <div className={styles.headerRow}>
                    <div className={styles.phaseHeader}>
                        {PHASES.map((phase) => (
                            <Label
                                key={phase}
                                strong
                                withUppercaseLetters
                                className={styles.phaseHeaderCell}
                            >
                                {phaseLabels[phase]}
                            </Label>
                        ))}
                    </div>
                </div>
                {groups.map((group) => {
                    const expanded = expandedGroups[group.id] ?? false;
                    const { positioned, laneCount } = packLanes(group.bars);

                    return (
                        <div
                            key={group.id}
                            className={styles.group}
                        >
                            <RawButton
                                name={group.id}
                                onClick={handleGroupToggle}
                                className={styles.groupHeader}
                                aria-expanded={expanded}
                            >
                                <InlineLayout
                                    spacing="2xs"
                                    before={expanded
                                        ? <ArrowDownSmallFillIcon className={styles.arrowIcon} />
                                        : <ArrowRightSmallFillIcon className={styles.arrowIcon} />}
                                >
                                    <Heading level={5}>
                                        {group.label}
                                    </Heading>
                                </InlineLayout>
                            </RawButton>
                            {expanded && (
                                <div
                                    className={styles.phaseArea}
                                    style={{
                                        gridTemplateRows: `repeat(${laneCount}, auto)`,
                                    }}
                                >
                                    {positioned.map((bar) => (
                                        <Bar
                                            key={bar.id}
                                            bar={bar}
                                            lastUpdateLabel={strings.lastUpdateLabel}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </ListView>
        </div>
    );
}

export default OperationalTimeline;
