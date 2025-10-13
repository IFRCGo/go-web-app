import {
    Container,
    Description,
    Heading,
    InputSection,
    Label,
    ListView,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';
import ExplanatoryNote from '#components/ExplanatoryNote';
import Link from '#components/Link';
import TabPage from '#components/TabPage';

import { charLimits } from '../common';
import GuidanceSeap from '../GuidanceSeap';
import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';

interface Props {
    value: PartialSimplifiedEapType;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    readOnly?: boolean;
}

function RiskAnalysis(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    return (
        <TabPage
            spacingOffset={-2}
            headerAction={(
                <GuidanceSeap
                    heading={strings.riskSectionHeading}
                    content={(
                        <ListView layout="block" withSpacingOpticalCorrection>
                            <Heading level={5}>
                                {strings.riskHeading}
                            </Heading>
                            <Label strong>
                                {strings.riskSectionCriteriaIntroduction1}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.riskSectionCriteriaComment11}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment12}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment13}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.riskSectionCriteriaIntroduction2}
                            </Label>
                            <Description>
                                {strings.riskSectionCriteriaComment2}
                            </Description>
                            <Heading level={5}>
                                {strings.earlyActionSectionCriteriaHeading}
                            </Heading>
                            <Label strong>
                                {strings.riskSectionCriteriaIntroduction3}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.riskSectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment32}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment33}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.riskSectionCriteriaIntroduction4}
                            </Label>
                            <Description>
                                {strings.riskSectionCriteriaComment4}
                            </Description>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={strings.riskHeading}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.historicalImpact}
                        description={strings.riskDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.historicalImpact}
                                ariaLabel={strings.historicalImpact}
                                title={strings.historicalImpact}
                                content={(
                                    <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                        <Description>
                                            {resolveToComponent(
                                                strings.riskTooltipDescription,
                                                {
                                                    drefOperationsLink: (
                                                        <Link
                                                            href="https://www.ifrc.org/appeals"
                                                            styleVariant="action"
                                                            external
                                                            withLinkIcon
                                                        >
                                                            {strings.drefOperationsLink}
                                                        </Link>
                                                    ),
                                                    goPlatformLink: (
                                                        <Link
                                                            href="https://go.ifrc.org/"
                                                            styleVariant="action"
                                                            external
                                                            withLinkIcon
                                                        >
                                                            {strings.goPlatformLink}
                                                        </Link>
                                                    ),
                                                    reliefwebLink: (
                                                        <Link
                                                            href="https://reliefweb.int/countries"
                                                            styleVariant="action"
                                                            external
                                                            withLinkIcon
                                                        >
                                                            {strings.reliefwebLink}
                                                        </Link>
                                                    ),
                                                    desinventarLink: (
                                                        <Link
                                                            href="https://www.desinventar.net/DesInventar/index.jsp"
                                                            styleVariant="action"
                                                            external
                                                            withLinkIcon
                                                        >
                                                            {strings.desinventarLink}
                                                        </Link>
                                                    ),
                                                    eMdATLink: (
                                                        <Link
                                                            href="https://public.emdat.be/"
                                                            styleVariant="action"
                                                            external
                                                            withLinkIcon
                                                        >
                                                            {strings.eMdATLink}
                                                        </Link>
                                                    ),
                                                    idmcLink: (
                                                        <Link
                                                            href="https://www.internal-displacement.org/"
                                                            styleVariant="action"
                                                            external
                                                            withLinkIcon
                                                        >
                                                            {strings.idmcLink}
                                                        </Link>
                                                    ),
                                                },
                                            )}
                                        </Description>
                                    </ListView>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.riskDescriptionLabel}
                            name="prioritized_hazard_and_impact"
                            value={value?.prioritized_hazard_and_impact}
                            onChange={setFieldValue}
                            error={error?.prioritized_hazard_and_impact}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.prioritized_hazard_and_impact}
                        />
                        <MultiImageWithCaptionInput
                            name="hazard_impact_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.hazard_impact_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.hazard_impact_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.uploadImageLabel}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.riskProtocol}
                        description={strings.riskProtocolDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.riskDescriptionLabel}
                            name="risks_selected_protocols"
                            value={value?.risks_selected_protocols}
                            onChange={setFieldValue}
                            error={error?.risks_selected_protocols}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.risks_selected_protocols}
                        />
                        <MultiImageWithCaptionInput
                            name="risk_selected_protocols_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.risk_selected_protocols_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.risk_selected_protocols_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.uploadImageLabel}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <Container
                heading={strings.earlyActionSelection}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.selectedEarlyAction}
                        description={strings.selectedEarlyActionDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.selectedEarlyAction}
                                ariaLabel={strings.selectedEarlyAction}
                                title={strings.selectedEarlyAction}
                                content={(
                                    <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                        <Description>
                                            {resolveToComponent(
                                                strings.selectedEarlyActionDescription1,
                                                {
                                                    earlyActionsLink: (
                                                        <Link
                                                            href="https://manual.forecast-based-financing.org/en/chapter/select-early-actions/"
                                                            styleVariant="action"
                                                            external
                                                            withLinkIcon
                                                        >
                                                            {strings.earlyActionsLink}
                                                        </Link>
                                                    ),
                                                },
                                            )}
                                        </Description>
                                        <Description>
                                            {strings.selectedEarlyActionDescription2}
                                        </Description>
                                        <Description>
                                            <ul>
                                                <li>
                                                    {strings.selectedEarlyActionDescription21}
                                                </li>
                                                <li>
                                                    {strings.selectedEarlyActionDescription22}
                                                </li>
                                                <li>
                                                    {strings.selectedEarlyActionDescription23}
                                                </li>
                                                <li>
                                                    {strings.selectedEarlyActionDescription24}
                                                </li>
                                                <li>
                                                    {strings.selectedEarlyActionDescription25}
                                                </li>
                                            </ul>
                                        </Description>
                                        <Description>
                                            {strings.selectedEarlyActionDescription3}
                                        </Description>
                                    </ListView>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.riskDescriptionLabel}
                            name="selected_early_actions"
                            value={value?.selected_early_actions}
                            onChange={setFieldValue}
                            error={error?.selected_early_actions}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.selected_early_actions}
                        />
                        <MultiImageWithCaptionInput
                            name="selected_early_actions_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.selected_early_actions_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.selected_early_actions_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.uploadImageLabel}
                        />
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default RiskAnalysis;
