import { useCallback } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
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
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import MultiFileObjectInput from '#components/domain/MultiFileObjectInput';
import ExplanatoryNote from '#components/ExplanatoryNote';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import { EAP_ACCEPTED_FILE_FORMATS } from '#utils/constants';

import { wordLimits } from '../common';
import GuidanceSeap from '../GuidanceSeap';
import { type PartialSimplifiedEapType } from '../schema';
import EarlyActionInput from './EarlyActionInput';
import PotentialRiskInput from './PotentialRiskInput';

import i18n from './i18n.json';

type PotentialRiskFormFields = NonNullable<
    PartialSimplifiedEapType['potential_risks']
>[number];
type EarlyActionFormFields = NonNullable<
    PartialSimplifiedEapType['early_actions']
>[number];

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

    const {
        setValue: onPotentialRiskChange,
        removeValue: onPotentialRiskRemove,
    } = useFormArray<'potential_risks', PotentialRiskFormFields>(
        'potential_risks',
        setFieldValue,
    );

    const {
        setValue: onEarlyActionChange,
        removeValue: onEarlyActionRemove,
    } = useFormArray<'early_actions', EarlyActionFormFields>(
        'early_actions',
        setFieldValue,
    );

    const handlePotentialRiskAdd = useCallback(() => {
        const newPotentialRiskItem: PotentialRiskFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: PotentialRiskFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newPotentialRiskItem,
            ],
            'potential_risks' as const,
        );
    }, [setFieldValue]);

    const handleEarlyActionAdd = useCallback(() => {
        const newEarlyActionItem: EarlyActionFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: EarlyActionFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newEarlyActionItem,
            ],
            'early_actions' as const,
        );
    }, [setFieldValue]);

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
                            maxWords={wordLimits.prioritized_hazard_and_impact}
                        />
                        <MultiFileObjectInput
                            name="hazard_impact_files"
                            url="/api/v2/eap-file/multiple/"
                            accept={EAP_ACCEPTED_FILE_FORMATS}
                            value={value?.hazard_impact_files}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.hazard_impact_files)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.uploadFileLabel}
                        >
                            {strings.selectFilesLabel}
                        </MultiFileObjectInput>
                    </InputSection>
                    <InputSection
                        title={strings.riskProtocol}
                        description={strings.riskProtocolDescription}
                        withAsteriskOnTitle
                    >
                        <Container
                            heading={strings.prioritisedRisksLabel}
                            headingLevel={6}
                            headerDescription={(
                                <NonFieldError
                                    error={getErrorObject(error?.potential_risks)}
                                />
                            )}
                            empty={isNotDefined(value?.potential_risks)
                                || value.potential_risks.length === 0}
                            emptyMessage={strings.prioritisedRisksEmptyMessage}
                            withPadding
                            withBorder
                            withCompactMessage
                        >
                            <ListView layout="block">
                                {value?.potential_risks?.map((potentialRisk, index) => (
                                    <PotentialRiskInput
                                        key={potentialRisk.client_id}
                                        index={index}
                                        value={potentialRisk}
                                        onChange={onPotentialRiskChange}
                                        onRemove={onPotentialRiskRemove}
                                        error={getErrorObject(error?.potential_risks)}
                                        disabled={disabled}
                                        readOnly={readOnly}
                                    />
                                ))}
                            </ListView>
                        </Container>
                        <Button
                            name={undefined}
                            onClick={handlePotentialRiskAdd}
                            disabled={disabled || readOnly}
                            before={<AddLineIcon />}
                        >
                            {strings.addButtonLabel}
                        </Button>
                        <TextArea
                            label={strings.riskDescriptionLabel}
                            name="risks_selected_protocols"
                            value={value?.risks_selected_protocols}
                            onChange={setFieldValue}
                            error={error?.risks_selected_protocols}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxWords={wordLimits.risks_selected_protocols}
                        />
                        <MultiFileObjectInput
                            name="risk_selected_protocols_files"
                            url="/api/v2/eap-file/multiple/"
                            accept={EAP_ACCEPTED_FILE_FORMATS}
                            value={value?.risk_selected_protocols_files}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.risk_selected_protocols_files)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.uploadFileLabel}
                        >
                            {strings.selectFilesLabel}
                        </MultiFileObjectInput>
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
                        <Container
                            heading={strings.prioritisedEarlyActionsLabel}
                            headingLevel={6}
                            headerDescription={(
                                <NonFieldError
                                    error={getErrorObject(error?.early_actions)}
                                />
                            )}
                            empty={isNotDefined(value?.early_actions)
                                || value.early_actions.length === 0}
                            emptyMessage={strings.prioritisedEarlyActionsEmptyMessage}
                            withPadding
                            withBorder
                            withCompactMessage
                        >
                            <ListView layout="block">
                                {value?.early_actions?.map((earlyAction, index) => (
                                    <EarlyActionInput
                                        key={earlyAction.client_id}
                                        index={index}
                                        value={earlyAction}
                                        onChange={onEarlyActionChange}
                                        onRemove={onEarlyActionRemove}
                                        error={getErrorObject(error?.early_actions)}
                                        disabled={disabled}
                                        readOnly={readOnly}
                                    />
                                ))}
                            </ListView>
                        </Container>
                        <Button
                            name={undefined}
                            onClick={handleEarlyActionAdd}
                            disabled={disabled || readOnly}
                            before={<AddLineIcon />}
                        >
                            {strings.addButtonLabel}
                        </Button>
                        <TextArea
                            label={strings.riskDescriptionLabel}
                            name="selected_early_actions"
                            value={value?.selected_early_actions}
                            onChange={setFieldValue}
                            error={error?.selected_early_actions}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxWords={wordLimits.selected_early_actions}
                        />
                        <MultiFileObjectInput
                            name="selected_early_actions_files"
                            url="/api/v2/eap-file/multiple/"
                            accept={EAP_ACCEPTED_FILE_FORMATS}
                            value={value?.selected_early_actions_files}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.selected_early_actions_files)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.uploadFileLabel}
                        >
                            {strings.selectFilesLabel}
                        </MultiFileObjectInput>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default RiskAnalysis;
