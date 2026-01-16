import {
    Container,
    InputSection,
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
import Link from '#components/Link';
import TabPage from '#components/TabPage';

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
        <TabPage spacingOffset={-2}>
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
                        tooltip={(
                            <ListView
                                layout="block"
                                spacing="3xs"
                            >
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
                            </ListView>
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
                        tooltip={(
                            <ListView
                                layout="block"
                                spacing="3xs"
                            >
                                {resolveToComponent(
                                    strings.selectedEarlyActionTooltipDescriptionOne,
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
                                {strings.selectedEarlyActionTooltipDescriptionTwo}
                                <ul>
                                    <li>
                                        {strings.selectedEarlyActionTooltipDescriptionListOne}
                                    </li>
                                    <li>
                                        {strings.selectedEarlyActionTooltipDescriptionListTwo}
                                    </li>
                                    <li>
                                        {strings.selectedEarlyActionTooltipDescriptionListThree}
                                    </li>
                                    <li>
                                        {strings.selectedEarlyActionTooltipDescriptionListFour}
                                    </li>
                                    <li>
                                        {strings.selectedEarlyActionTooltipDescriptionListFive}
                                    </li>
                                </ul>
                                {strings.selectedEarlyActionTooltipDescriptionThree}
                            </ListView>
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
