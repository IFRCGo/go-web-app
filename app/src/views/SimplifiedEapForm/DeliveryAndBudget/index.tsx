import {
    Container,
    InfoPopup,
    InputSection,
    ListView,
    NumberInput,
    TextArea,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { useRequest } from '#utils/restRequest';

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
    isRevision?: boolean;
}

function DeliveryAndBudget(props: Props) {
    const {
        value,
        setFieldValue,
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

    return (
        <TabPage>
            <Container heading={strings.deliverHeading}>
                <ListView
                    layout="block"
                >
                    <InputSection
                        title={strings.deliverEarlyActions}
                        description={strings.deliverEarlyActionsDescription}
                        tooltip={strings.deliverEarlyActionsTooltip}
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
                        />
                    </InputSection>
                    <InputSection
                        title={strings.deliverInvolved}
                        description={strings.deliverInvolvedDescription}
                        tooltip={(
                            <ListView
                                layout="block"
                                spacing="3xs"
                            >
                                {strings.deliverInvolvedTooltipDescriptionOne}
                                <TextOutput
                                    strongLabel
                                    label={strings.deliverInvolvedTooltipDescriptionTwo}
                                    value={resolveToComponent(
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
                                />
                                {strings.deliverInvolvedTooltipDescriptionFour}
                                <ul>
                                    <li>{strings.deliverInvolvedTooltipListOne}</li>
                                    <li>{strings.deliverInvolvedTooltipListTwo}</li>
                                    <li>{strings.deliverInvolvedTooltipListThree}</li>
                                    <li>{strings.deliverInvolvedTooltipListFour}</li>
                                </ul>
                            </ListView>
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
                        <InfoPopup
                            description={(
                                <>
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
                                    <ListView
                                        layout="block"
                                        spacing="3xs"
                                    >
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
                                    </ListView>
                                </>
                            )}
                        />
                    </ListView>
                )}
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.deliverTotalBudget}
                        description={strings.deliverTotalBudgetDescription}
                        tooltip={strings.deliverTotalBudgetTooltip}
                        withAsteriskOnTitle
                    >
                        <ListView
                            layout="grid"
                            numPreferredGridColumns={4}
                        >
                            <NumberInput
                                // FIXME: total budget should be automatically calculated
                                name="total_budget"
                                value={value?.total_budget}
                                onChange={setFieldValue}
                                error={error?.total_budget}
                                disabled={disabled}
                                label={strings.deliverBudgetLabel}
                                readOnly={readOnly}
                            />
                            <NumberInput
                                label={strings.deliverReadinessLabel}
                                name="readiness_budget"
                                value={value?.readiness_budget}
                                onChange={setFieldValue}
                                error={error?.readiness_budget}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <NumberInput
                                label={strings.deliverPrepositioning}
                                name="pre_positioning_budget"
                                value={value?.pre_positioning_budget}
                                onChange={setFieldValue}
                                error={error?.pre_positioning_budget}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <NumberInput
                                label={strings.earlyAction}
                                name="early_action_budget"
                                value={value?.early_action_budget}
                                onChange={setFieldValue}
                                error={error?.early_action_budget}
                                disabled={disabled}
                                readOnly={readOnly}
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
                        >
                            <GoSingleFileInput
                                name="updated_checklist_file"
                                url="/api/v2/eap-file/"
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
