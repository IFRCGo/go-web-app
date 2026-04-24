import { useCallback } from 'react';
import {
    Container,
    Description,
    Heading,
    InputSection,
    Label,
    ListView,
    NumberInput,
    TextArea,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToComponent,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
    type SetBaseValueArg,
} from '@togglecorp/toggle-form';

import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import ExplanatoryNote from '#components/ExplanatoryNote';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { useRequest } from '#utils/restRequest';

import { charLimits } from '../common';
import GuidanceSeap from '../GuidanceSeap';
import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';

interface Props {
    value: PartialSimplifiedEapType;
    setValue: (value: SetBaseValueArg<PartialSimplifiedEapType>) => void;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    readOnly?: boolean;
    isRevision?: boolean;
}

function DeliveryAndBudget(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
        isRevision,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    const {
        pending: globalFilesLoading,
        response: globalFilesResponse,
    } = useRequest({
        url: '/api/v2/eap/global-files/{template_type}/',
        pathVariables: {
            template_type: 'budget_template',
        },
    });

    const setBudgetValue = useCallback(
        (budgetValue: number | undefined, name: 'readiness_budget' | 'pre_positioning_budget' | 'early_action_budget') => {
            setValue((prevValue) => {
                const newBudgetValue = {
                    readiness_budget: prevValue.readiness_budget,
                    pre_positioning_budget: prevValue.pre_positioning_budget,
                    early_action_budget: prevValue.early_action_budget,
                    [name]: budgetValue,
                };

                return {
                    ...prevValue,
                    [name]: budgetValue,
                    total_budget: sumSafe([
                        newBudgetValue.readiness_budget,
                        newBudgetValue.pre_positioning_budget,
                        newBudgetValue.early_action_budget,
                    ]),
                };
            });
        },
        [setValue],
    );

    return (
        <TabPage
            spacingOffset={-2}
            headerAction={(
                <GuidanceSeap
                    heading={strings.deliverSectionHeading}
                    content={(
                        <ListView layout="block" withSpacingOpticalCorrection>
                            <Heading level={5}>
                                {strings.nationalSocietySectionHeading}
                            </Heading>
                            <Label strong>
                                {strings.deliverSectionCriteriaIntroduction1}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.deliverSectionCriteriaComment11}
                                </Description>
                                <Description>
                                    {strings.deliverSectionCriteriaComment12}
                                </Description>
                            </ListView>
                            <Heading level={5}>
                                {strings.budgetHeading}
                            </Heading>
                            <Label strong>
                                {strings.deliverSectionCriteriaIntroduction2}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.deliverSectionCriteriaComment21}
                                </Description>
                                <Description>
                                    {strings.deliverSectionCriteriaComment22}
                                </Description>
                                <Description>
                                    {strings.deliverSectionCriteriaComment23}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.deliverSectionCriteriaIntroduction3}
                            </Label>
                            <Description>
                                {strings.deliverSectionCriteriaComment3}
                            </Description>
                            <Heading level={5}>
                                {strings.coordinationSectionCriteriaHeading}
                            </Heading>
                            <Label strong>
                                {strings.deliverSectionCriteriaIntroduction4}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.deliverSectionCriteriaComment41}
                                </Description>
                                <Description>
                                    {strings.deliverSectionCriteriaComment42}
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={strings.deliverHeading}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.deliverEarlyActions}
                        description={strings.deliverEarlyActionsDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.deliverEarlyActions}
                                ariaLabel={strings.deliverEarlyActions}
                                title={strings.deliverEarlyActions}
                                content={(
                                    <Description>
                                        {strings.deliverEarlyActionsTooltip}
                                    </Description>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.deliverDescription}
                            name="early_action_capability"
                            value={value?.early_action_capability}
                            onChange={setFieldValue}
                            error={error?.early_action_capability}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.early_action_capability}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.deliverInvolved}
                        description={strings.deliverInvolvedDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.deliverInvolved}
                                ariaLabel={strings.deliverInvolved}
                                title={strings.deliverInvolved}
                                content={(
                                    <ListView layout="block">
                                        <Description>
                                            {strings.deliverInvolvedTooltipDescriptionOne}
                                        </Description>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.deliverInvolvedTooltipDescriptionTwo}
                                            </Label>
                                            <Description>
                                                {resolveToComponent(
                                                    strings.deliverInvolvedTooltipDescriptionThree,
                                                    {
                                                        guideLink: (
                                                            <Link
                                                                href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQn1ca51QIBCgok06lTQUFUBdmFAz3k28QkRMzbxMnRv1A?e=uBzYht"
                                                                styleVariant="action"
                                                                external
                                                                withLinkIcon
                                                            >
                                                                {strings.guideLink}
                                                            </Link>
                                                        ),
                                                    },
                                                )}
                                            </Description>
                                            <Description>
                                                {strings.deliverInvolvedTooltipDescriptionFour}
                                            </Description>
                                            <Description>
                                                <ul>
                                                    <li>{strings.deliverInvolvedTooltip1}</li>
                                                    <li>{strings.deliverInvolvedTooltip2}</li>
                                                    <li>{strings.deliverInvolvedTooltip3}</li>
                                                    <li>{strings.deliverInvolvedTooltip4}</li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.deliverDescription}
                            name="rcrc_movement_involvement"
                            value={value?.rcrc_movement_involvement}
                            onChange={setFieldValue}
                            error={error?.rcrc_movement_involvement}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.rcrc_movement_involvement}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <Container
                heading={(
                    <ListView
                        layout="inline"
                        spacing="sm"
                    >
                        {strings.budgetHeading}
                        <ExplanatoryNote
                            heading={strings.budgetHeading}
                            ariaLabel={strings.budgetHeading}
                            title={strings.budgetHeading}
                            content={(
                                <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                    <Description>
                                        {resolveToComponent(
                                            strings.deliverTotalBudgetTooltipDescription,
                                            {
                                                hereLink: (
                                                    <Link
                                                        href="https://ifrcorg.sharepoint.com/:x:/s/IFRCSharing/EYPXxZjKUdNJrifrpPBDAEgB0gWWyzb5SayqJqU56HvEnQ?e=GAiaFP"
                                                        styleVariant="action"
                                                        external
                                                        withLinkIcon
                                                    >
                                                        {strings.hereLink}
                                                    </Link>
                                                ),
                                            },
                                        )}
                                    </Description>
                                    <Description>
                                        <ul>
                                            <li>
                                                {strings.deliverTotalBudgetTooltipListOne}
                                            </li>
                                            <li>
                                                {strings.deliverTotalBudgetTooltipListTwo}
                                            </li>
                                            <li>
                                                {strings.deliverTotalBudgetTooltipListThree}
                                            </li>
                                            <li>
                                                {strings.deliverTotalBudgetTooltipListFour}
                                            </li>
                                            <li>
                                                {strings.deliverTotalBudgetTooltipListFive}
                                            </li>
                                            <li>
                                                {strings.deliverTotalBudgetTooltipListSix}
                                            </li>
                                            <li>
                                                {strings.deliverTotalBudgetTooltipListSeven}
                                            </li>
                                            <li>
                                                {strings.deliverTotalBudgetTooltipListEight}
                                            </li>
                                            <li>
                                                {strings.deliverTotalBudgetTooltipListNine}
                                            </li>
                                        </ul>
                                    </Description>
                                </ListView>
                            )}
                        />
                    </ListView>
                )}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.deliverTotalBudget}
                        description={strings.deliverTotalBudgetDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.deliverTotalBudget}
                                ariaLabel={strings.deliverTotalBudget}
                                title={strings.deliverTotalBudget}
                                content={(
                                    <Description>
                                        {strings.deliverTotalBudgetTooltip}
                                    </Description>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <TextOutput
                            valueType="number"
                            strongLabel
                            label={strings.totalBudgetLabel}
                            value={value?.total_budget}
                            suffix="CHF"
                        />
                        <ListView
                            layout="grid"
                            numPreferredGridColumns={3}
                        >
                            <NumberInput
                                label={strings.deliverReadinessLabel}
                                name="readiness_budget"
                                value={value?.readiness_budget}
                                onChange={setBudgetValue}
                                error={error?.readiness_budget}
                                disabled={disabled}
                                readOnly={readOnly}
                                required
                            />
                            <NumberInput
                                label={strings.deliverPrepositioning}
                                name="pre_positioning_budget"
                                value={value?.pre_positioning_budget}
                                onChange={setBudgetValue}
                                error={error?.pre_positioning_budget}
                                disabled={disabled}
                                readOnly={readOnly}
                                required
                            />
                            <NumberInput
                                label={strings.earlyAction}
                                name="early_action_budget"
                                value={value?.early_action_budget}
                                onChange={setBudgetValue}
                                error={error?.early_action_budget}
                                disabled={disabled}
                                readOnly={readOnly}
                                required
                            />
                        </ListView>
                    </InputSection>
                    <InputSection
                        title={strings.deliverBudgetDetails}
                        description={(
                            <>
                                {strings.deliverBudgetDetailsDescription}
                                <Link
                                    href={globalFilesResponse?.url}
                                    withLinkIcon
                                    external
                                    disabled={globalFilesLoading || !globalFilesResponse?.url}
                                >
                                    {strings.downloadBudgetTemplate}
                                </Link>
                            </>
                        )}
                        withAsteriskOnTitle
                    >
                        <GoSingleFileInput
                            name="budget_file"
                            url="/api/v2/eap-file/"
                            accept=".pdf, .docx, .pptx, .xlsx, .xlsm"
                            value={value?.budget_file}
                            onChange={setFieldValue}
                            error={getErrorString(error?.budget_file)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            disabled={disabled}
                            readOnly={readOnly}
                        >
                            {strings.upload}
                        </GoSingleFileInput>
                    </InputSection>
                    {isRevision && (
                        <InputSection
                            title={strings.updatedChecklistTitle}
                            withAsteriskOnTitle
                        >
                            <GoSingleFileInput
                                name="updated_checklist_file"
                                url="/api/v2/eap-file/"
                                accept=".pdf, .docx, .pptx, .xlsx, .xlsm"
                                value={value?.updated_checklist_file}
                                onChange={setFieldValue}
                                error={getErrorString(error?.updated_checklist_file)}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                disabled={disabled}
                                readOnly={readOnly}
                            >
                                {strings.upload}
                            </GoSingleFileInput>
                        </InputSection>
                    )}
                </ListView>
            </Container>
        </TabPage>
    );
}

export default DeliveryAndBudget;
