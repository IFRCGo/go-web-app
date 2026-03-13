import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    Chip,
    Container,
    HtmlOutput,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import {
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import TabPage from '#components/TabPage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    type CategoryType,
    DISASTER_TYPE_EPIDEMIC,
    FIELD_REPORT_STATUS_EARLY_WARNING,
    type ReportType,
} from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { fieldReportId } = useParams<{ fieldReportId: string }>();

    const {
        api_action_org,
    } = useGlobalEnums();

    const organizationMap = listToMap(
        api_action_org,
        (option) => option.key,
        (option) => option.value,
    );

    const {
        pending: fetchingFieldReport,
        response: fieldReportResponse,
    } = useRequest({
        skip: isNotDefined(fieldReportId),
        url: '/api/v2/field-report/{id}/',
        pathVariables: {
            id: Number(fieldReportId),
        },
    });

    const actionsTaken = fieldReportResponse?.actions_taken;
    const notesHealth = fieldReportResponse?.notes_health;
    const notesNs = fieldReportResponse?.notes_ns;
    const notesSocioeco = fieldReportResponse?.notes_socioeco;
    const actionsOthers = fieldReportResponse?.actions_others;

    const reportType: ReportType = useMemo(() => {
        if (fieldReportResponse?.status === FIELD_REPORT_STATUS_EARLY_WARNING) {
            return 'EW';
        }

        if (fieldReportResponse?.is_covid_report) {
            return 'COVID';
        }

        if (fieldReportResponse?.dtype === DISASTER_TYPE_EPIDEMIC) {
            return 'EPI';
        }

        return 'EVT';
    }, [fieldReportResponse]);

    return (
        <TabPage
            pending={fetchingFieldReport}
        >
            <Container
                heading={strings.actionsTakenHeader}
                withHeaderBorder
            >
                <ListView
                    layout="block"
                    spacing="2xl"
                >
                    {actionsTaken?.map((actionTaken) => {
                        if (
                            actionTaken.actions_details.length <= 0
                            && isFalsyString(actionTaken.summary)
                        ) {
                            return null;
                        }

                        const actionsGroupedByCategory = listToGroupList(
                            actionTaken.actions_details,
                            (item) => item.category ?? '<no-key>',
                            (item) => item,
                        );
                        const categoryItems = mapToList(
                            actionsGroupedByCategory,
                            (item, key) => ({
                                category: key as CategoryType,
                                actions: item,
                            }),
                        );

                        return (
                            <Container
                                key={actionTaken.id}
                                headingLevel={4}
                                heading={resolveToComponent(
                                    strings.actionsTakenHeading,
                                    {
                                        organization: organizationMap
                                            ?.[actionTaken.organization],
                                    },
                                )}
                            >
                                <ListView
                                    layout="block"
                                    withSpacingOpticalCorrection
                                >
                                    {categoryItems?.map((value) => (
                                        <Container
                                            key={value.category}
                                            heading={value.category}
                                            headingLevel={5}
                                        >
                                            <ListView
                                                layout="inline"
                                                withSpacingOpticalCorrection
                                                spacing="sm"
                                            >
                                                {value.actions.map((action) => (
                                                    <ListView
                                                        key={action.id}
                                                    >
                                                        <Chip
                                                            name={undefined}
                                                            variant="tertiary"
                                                            label={action.name}
                                                        />
                                                    </ListView>
                                                ))}
                                                {reportType === 'COVID' && value.category === 'Health' && (
                                                    <TextOutput
                                                        label={strings.notesLabel}
                                                        value={notesHealth}
                                                    />
                                                )}
                                                {reportType === 'COVID' && value.category === 'NS Institutional Strengthening' && (
                                                    <TextOutput
                                                        label={strings.notesLabel}
                                                        value={notesNs}
                                                    />
                                                )}
                                                {reportType === 'COVID' && value.category === 'Socioeconomic Interventions' && (
                                                    <TextOutput
                                                        label={strings.notesLabel}
                                                        value={notesSocioeco}
                                                    />
                                                )}
                                            </ListView>
                                        </Container>
                                    ))}
                                    <TextOutput
                                        strongLabel
                                        label={strings.descriptionLabel}
                                        value={actionTaken.summary}
                                        withoutLabelColon
                                    />
                                </ListView>
                            </Container>
                        );
                    })}
                    {isTruthyString(actionsOthers) && (
                        <Container
                            heading={strings.actionsTakenByOthersHeading}
                            headingLevel={4}
                        >
                            <HtmlOutput
                                value={actionsOthers}
                            />
                        </Container>
                    )}
                </ListView>
            </Container>
        </TabPage>
    );
}

Component.displayName = 'ActionsSummary';
