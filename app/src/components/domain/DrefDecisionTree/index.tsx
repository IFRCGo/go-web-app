import {
    type ComponentProps,
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    ButtonLayout,
    Description,
    InlineLayout,
    ListView,
    Modal,
    RadioInput,
    RawButton,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';

import {
    answer,
    resolve,
    restart,
} from './engine';
import drefDecisionTree from './tree';
import {
    type AnswerPath,
    type ContentKey,
    type Option,
} from './types';

import i18n from './i18n.json';
import styles from './styles.module.css';

const optionKeySelector = (option: Option) => option.value;

interface LayoutProps {
    children: React.ReactNode;
    hasSummary: boolean;
}

function BodyLayout(props: LayoutProps) {
    const {
        hasSummary,
        children,
    } = props;

    if (hasSummary) {
        return (
            <ListView
                layout="grid"
                withSidebar
                sidebarPosition="start"
                spacing="lg"
            >
                {children}
            </ListView>
        );
    }

    return (
        <ListView layout="block">
            {children}
        </ListView>
    );
}

interface Props {
    onClose: () => void;
}

function DrefDecisionTreeModal(props: Props) {
    const { onClose } = props;
    const strings = useTranslation(i18n);

    // Abstract content key -> translated string. Kept in this index.tsx (not in tree.ts) so the
    // i18n-usage lint rule — which only scans the co-located index.tsx — sees every key as used.
    const content = useMemo<Record<ContentKey, string>>(
        () => ({
            'q.eventOccurred': strings.questionEventOccurred,
            'q.nature': strings.questionNature,
            'q.size': strings.questionSize,
            'q.enoughInfo': strings.questionEnoughInfo,
            'q.droughtFocusResponse': strings.questionDroughtFocusResponse,
            'q.droughtFocusAnticipatory': strings.questionDroughtFocusAnticipatory,
            'q.hasEap': strings.questionHasEap,
            'q.eapTrigger': strings.questionEapTrigger,
            'q.riskThreshold': strings.questionRiskThreshold,
            'q.geoCoverage': strings.questionGeoCoverage,
            'q.alertIssued': strings.questionAlertIssued,
            'q.alertRelated': strings.questionAlertRelated,

            'opt.nature.sudden': strings.optionNatureSudden,
            'opt.nature.slow': strings.optionNatureSlow,
            'opt.size.large': strings.optionSizeLarge,
            'opt.size.small': strings.optionSizeSmall,
            'opt.yes': strings.optionYes,
            'opt.no': strings.optionNo,

            'note.emergencyAppealUnavailable': strings.noteEmergencyAppealUnavailable,
            'note.advancePayment': strings.noteAdvancePayment,
            'note.recurrentEvents': strings.noteRecurrentEvents,
            'note.conductAssessment': strings.noteConductAssessment,
            'note.insufficientEvidence': strings.noteInsufficientEvidence,
            'note.eapActivationByEmail': strings.noteEapActivationByEmail,
            'note.justifyExceptionalApproval': strings.noteJustifyExceptionalApproval,
            'note.link.learnMore': strings.noteLinkLearnMore,
            'note.link.followingResources': strings.noteLinkFollowingResources,

            'outcome.responseDref': strings.outcomeResponseDref,
            'outcome.assessmentDref': strings.outcomeAssessmentDref,
            'outcome.droughtDref': strings.outcomeDroughtDref,
            'outcome.imminentDref': strings.outcomeImminentDref,
            'outcome.eapActivation': strings.outcomeEapActivation,
            'outcome.exceptionalApproval': strings.outcomeExceptionalApproval,
            'outcome.emergencyAppeal': strings.outcomeEmergencyAppeal,
            'outcome.developEap': strings.outcomeDevelopEap,

            'cta.drefApplicationForm': strings.drefApplicationFormButton,
            'cta.drefGuidelines': strings.drefGuidelinesButton,
            'cta.eapDevelopmentRegistration': strings.eapDevelopmentRegistrationButton,
        }),
        [strings],
    );

    const t = useCallback(
        (key: ContentKey | undefined): string => (isDefined(key) ? (content[key] ?? key) : ''),
        [content],
    );

    const [path, setPath] = useState<AnswerPath>([]);
    // The option chosen for the active question, not yet committed (committed on "Next").
    const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

    const state = useMemo(() => resolve(drefDecisionTree, path), [path]);
    const {
        steps,
        activeQuestion,
        outcome,
    } = state;

    const handleNext = useCallback(
        () => {
            if (isNotDefined(selectedValue)) {
                return;
            }
            setPath((prev) => answer(drefDecisionTree, prev, selectedValue));
            setSelectedValue(undefined);
        },
        [selectedValue],
    );

    const handleBack = useCallback(
        () => {
            setPath((prev) => prev.slice(0, -1));
            setSelectedValue(undefined);
        },
        [],
    );

    const handleJumpTo = useCallback(
        (index: number) => {
            setPath((prev) => prev.slice(0, index));
            setSelectedValue(undefined);
        },
        [],
    );

    const handleRestart = useCallback(
        () => {
            setPath(restart());
            setSelectedValue(undefined);
        },
        [],
    );

    const labelSelector = useCallback(
        (option: Option) => t(option.labelKey),
        [t],
    );

    const hasSummary = steps.length > 0;

    return (
        <Modal
            heading={strings.title}
            headerDescription={strings.disclaimer}
            headerActions={(
                <Button
                    name="restart"
                    onClick={handleRestart}
                    styleVariant="outline"
                    colorVariant="primary"
                >
                    {strings.restartButton}
                </Button>
            )}
            onClose={onClose}
            withHeaderBorder
            size="auto"
            className={styles.drefDecisionTree}
            spacing="lg"
        >
            <BodyLayout hasSummary={hasSummary}>
                {hasSummary && (
                    <ListView
                        layout="block"
                        className={styles.summarySection}
                        spacing="xs"
                    >
                        {steps.map((step, index) => (
                            <RawButton
                                key={step.nodeId}
                                className={styles.summaryStep}
                                name={index}
                                onClick={handleJumpTo}
                            >
                                <InlineLayout
                                    before={(
                                        <div className={styles.circle} />
                                    )}
                                    contentAlignment="baseline"
                                    spacing="xs"
                                >
                                    <ListView
                                        layout="block"
                                        withSpacingOpticalCorrection
                                        spacing="xs"
                                        className={styles.details}
                                    >
                                        <div className={styles.summaryQuestion}>
                                            {t(step.questionKey)}
                                        </div>
                                        <div className={styles.summaryAnswer}>
                                            {t(step.selectedLabelKey)}
                                        </div>
                                        {isDefined(step.noteKey) && (
                                            <Description
                                                withLightText
                                                textSize="sm"
                                            >
                                                {t(step.noteKey)}
                                            </Description>
                                        )}
                                    </ListView>
                                </InlineLayout>
                            </RawButton>
                        ))}
                    </ListView>
                )}
                <ListView
                    layout="block"
                    spacing="2xl"
                    withCenteredContents
                    className={styles.questionSection}
                >
                    <div />
                    {isDefined(activeQuestion) && (
                        <ListView
                            spacing="xl"
                            layout="block"
                            withPadding
                        >
                            <div className={styles.activeQuestion}>
                                {t(activeQuestion.questionKey)}
                            </div>
                            <ListView
                                layout="block"
                                withPadding
                                withCenteredContents
                            >
                                <RadioInput
                                    className={styles.options}
                                    name="decisionTreeOption"
                                    options={activeQuestion.options}
                                    keySelector={optionKeySelector}
                                    labelSelector={labelSelector}
                                    value={selectedValue}
                                    onChange={setSelectedValue}
                                    withPadding
                                    spacing="2xl"
                                />
                            </ListView>
                            <ListView withCenteredContents>
                                {hasSummary && (
                                    <Button
                                        name="back"
                                        onClick={handleBack}
                                        styleVariant="outline"
                                        colorVariant="primary"
                                    >
                                        {strings.backButton}
                                    </Button>
                                )}
                                <Button
                                    name="next"
                                    onClick={handleNext}
                                    disabled={isNotDefined(selectedValue)}
                                    styleVariant="filled"
                                    colorVariant="primary"
                                >
                                    {strings.nextButton}
                                </Button>
                            </ListView>
                        </ListView>
                    )}
                    {isDefined(outcome) && (
                        <>
                            <div />
                            <div />
                            <ButtonLayout
                                styleVariant="translucent"
                                colorVariant="primary"
                                textSize="lg"
                                readOnly
                            >
                                {t(outcome.outcomeKey)}
                            </ButtonLayout>
                            <div />
                            {outcome.notes?.map((note) => (
                                <p className={styles.note} key={note.textKey}>
                                    {t(note.textKey)}
                                    {isDefined(note.link) && (
                                        <>
                                            &nbsp;
                                            <Link
                                                external
                                                href={note.link.url}
                                                withUnderline
                                            >
                                                {t(note.link.labelKey)}
                                            </Link>
                                        </>
                                    )}
                                </p>
                            ))}
                            <ListView withCenteredContents withWrap>
                                <Button
                                    name="back"
                                    onClick={handleBack}
                                    styleVariant="outline"
                                    colorVariant="primary"
                                >
                                    {strings.backButton}
                                </Button>
                                {outcome.actions.map((action) => (
                                    action.type === 'navigate' ? (
                                        <Link
                                            key={action.route}
                                            // Routes are typed by name; the graph
                                            // stores them as plain strings.
                                            to={action.route as ComponentProps<typeof Link>['to']}
                                            urlParams={action.urlParams}
                                            state={action.state}
                                            styleVariant="filled"
                                            colorVariant="primary"
                                        >
                                            {t(action.labelKey ?? outcome.outcomeKey)}
                                        </Link>
                                    ) : (
                                        <Link
                                            key={action.url}
                                            external
                                            href={action.url}
                                            styleVariant="outline"
                                            colorVariant="primary"
                                            withLinkIcon
                                        >
                                            {t(action.labelKey)}
                                        </Link>
                                    )
                                ))}
                            </ListView>
                        </>
                    )}
                    {state.isDeadEnd && isNotDefined(outcome) && (
                        <>
                            <p className={styles.note}>{strings.deadEndMessage}</p>
                            {hasSummary && (
                                <Button
                                    name="back"
                                    onClick={handleBack}
                                    styleVariant="outline"
                                    colorVariant="primary"
                                >
                                    {strings.backButton}
                                </Button>
                            )}
                        </>
                    )}
                </ListView>
            </BodyLayout>
        </Modal>
    );
}

export default DrefDecisionTreeModal;
