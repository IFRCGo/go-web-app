import {
    Container,
    Description,
    ExpandableContainer,
    Label,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import OperationalTimeline from '#components/domain/OperationalTimeline';
import Link from '#components/Link';
import TabPage from '#components/TabPage';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const fundingCoverageDescription = resolveToComponent(
        strings.weAreLookingFor,
        {
            here: (
                <Link
                    href="https://ifrcorg.sharepoint.com/:x:/s/IFRCSharing/EZrYT-ysYfFFn9skPZxClN8B2sQPuY-GVvi3ddwdc5ZPHw"
                    external
                >
                    {strings.here}
                </Link>
            ),
            emailOne: (
                <Link
                    href="mailto:antoine.belair@ifrc.org"
                    external
                >
                    antoine.belair@ifrc.org
                </Link>
            ),
            emailTwo: (
                <Link
                    href="mailto:marshal.mukuvare@ifrc.org"
                    external
                >
                    marshal.mukuvare@ifrc.org
                </Link>
            ),
        },
    );

    const perSectionHeading = resolveToComponent(
        strings.perSectionHeading,
        {
            per: (
                <Link
                    href="https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EkiQndccd4ZIqMyUn983XiUBRfA14qW_CojCjibdG_Tmcw?e=My2KYE"
                    external
                >
                    {strings.per}
                </Link>
            ),
        },
    );

    const perSectionThree = resolveToComponent(
        strings.perSectionThree,
        {
            bottlenecks: (
                <Link
                    to="preparednessGlobalCatalogue"
                >
                    {strings.bottlenecks}
                </Link>
            ),
        },
    );

    const perSectionFive = resolveToComponent(
        strings.perSectionFive,
        {
            learnings: (
                <Link
                    to="operationalLearning"
                >
                    {strings.learnings}
                </Link>
            ),
            framework: (
                <Link
                    href="https://eur02.safelinks.protection.outlook.com/ap/w-59584e83/?url=https%3A%2F%2Fifrcorg.sharepoint.com%2F%3Aw%3A%2Fr%2Fsites%2FIFRCSharing%2F_layouts%2F15%2FDoc.aspx%3Fsourcedoc%3D%257B649265AA-DCEE-467D-99FC-EEA27C53B2B1%257D%26file%3D3.4%2520Discussion%2520points%2520for%2520DREF%2520operations%2520Lessons%2520Learnt%2520exercise.docx%26action%3Ddefault%26mobileredirect%3Dtrue&data=04%7C01%7CAnaMaria.ESCOBAR%40ifrc.org%7Ced517ec29d684796fe4908d99aefff43%7Ca2b53be5734e4e6cab0dd184f60fd917%7C0%7C0%7C637711177887192449%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=Qgqny5AAgYRT4jV5mrfSxXZENXUMO4ufXeexPr0Dkg8%3D&reserved=0"
                    external
                >
                    {strings.framework}
                </Link>
            ),
        },
    );

    const perSectionFooter = resolveToComponent(
        strings.perSectionFooter,
        {
            here: (
                <Link
                    href="https://www.ifrc.org/disaster-preparedness"
                    external
                >
                    {strings.here}
                </Link>
            ),
            information: (
                <Link
                    to="preparednessGlobalSummary"
                >
                    {strings.information}
                </Link>
            ),
            capacity: (
                <Link
                    to="preparednessGlobalPerformance"
                >
                    {strings.capacity}
                </Link>
            ),
            emailThree: (
                <Link
                    href="mailto:Marjorie.sotofranco@ifrc.org"
                    external
                >
                    Marjorie.sotofranco@ifrc.org
                </Link>
            ),
        },
    );

    return (
        <TabPage>
            <Label
                strong
                textSize="lg"
            >
                {strings.surgeOperationalToolboxHeadingDescription}
            </Label>
            <ListView layout="block">
                <ExpandableContainer
                    heading={strings.operationalToolboxOverviewHeading}
                    initiallyExpanded
                    withDarkBackground
                    withPadding
                    spacing="lg"
                    headerDescription={strings.overviewSectionHeader}
                >
                    <Container
                        heading={strings.overviewNavigationHowTo}
                        headingLevel={5}
                        withContentWell
                    >
                        <ListView layout="block">
                            <TextOutput
                                value={strings.toolboxValue}
                                label={strings.toolboxLabel}
                                strongLabel
                                withBlockLayout
                            />
                            <TextOutput
                                value={strings.timelineValue}
                                label={strings.timelineLabel}
                                withBlockLayout
                                strongLabel
                            />
                        </ListView>
                    </Container>
                    <Description>{strings.overviewSectionFooter}</Description>
                </ExpandableContainer>
                <OperationalTimeline />
                <ListView
                    layout="block"
                    withSpacingOpticalCorrection
                    withPadding
                    withDarkBackground
                >
                    <div>{fundingCoverageDescription}</div>
                    <div>{perSectionHeading}</div>
                    <ul>
                        <li>{strings.perSectionOne}</li>
                        <li>{strings.perSectionTwo}</li>
                        <li>{perSectionThree}</li>
                        <li>{strings.perSectionFour}</li>
                        <li>{perSectionFive}</li>
                        <li>{strings.perSectionSix}</li>
                    </ul>
                    <div>{perSectionFooter}</div>
                </ListView>
            </ListView>
        </TabPage>
    );
}

Component.displayName = 'SurgeOperationalToolbox';
