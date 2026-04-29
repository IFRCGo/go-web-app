import {
    useMemo,
    useState,
} from 'react';
import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import OpsLearningKeyInsights from '#components/domain/OpsLearningKeyInsights';
import Link from '#components/Link';
import { PER_LEARNING_LESSONS_LEARNED } from '#utils/constants';
import {
    SUMMARY_NO_EXTRACT_AVAILABLE,
    SUMMARY_STATUS_FAILED,
    SUMMARY_STATUS_PENDING,
    SUMMARY_STATUS_SUCCESS,
} from '#utils/domain/opsLearning';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type OpsLearningSummaryResponse = GoApiResponse<'/api/v2/ops-learning/summary/'>;

interface Props {
    disasterType: number;
    country: number;
}

function EmergencyLessonsLearnedFromPreviousOperations(props: Props) {
    const {
        disasterType,
        country,
    } = props;

    const strings = useTranslation(i18n);

    const [tmpResponse, setTmpResponse] = useState<OpsLearningSummaryResponse | undefined>(
        undefined,
    );

    const {
        response: summaryResponse = tmpResponse,
        pending: summaryPending,
    } = useRequest({
        url: '/api/v2/ops-learning/summary/',
        query: {
            appeal_code__country: country,
            appeal_code__dtype: disasterType,
            type_validated: PER_LEARNING_LESSONS_LEARNED,
        },
        shouldPoll: (poll) => {
            const { errored, value } = poll;

            const stopPolling = errored
                || value?.status === SUMMARY_STATUS_FAILED
                || value?.status === SUMMARY_STATUS_SUCCESS
                || value?.status === SUMMARY_NO_EXTRACT_AVAILABLE;

            if (stopPolling) {
                setTmpResponse(value as OpsLearningSummaryResponse);
                return -1;
            }

            return 5000;
        },
        preserveResponse: true,
    });

    const emptyMessage = useMemo(
        () => resolveToComponent(
            strings.emptyMessage,
            {
                link: (
                    <Link
                        to="operationalLearning"
                        withUnderline
                    >
                        {strings.emptyMessageLinkLabel}
                    </Link>
                ),
            },
        ),
        [strings.emptyMessage, strings.emptyMessageLinkLabel],
    );

    return (
        <Container
            heading={strings.heading}
            withHeaderBorder
            pending={summaryPending || summaryResponse?.status === SUMMARY_STATUS_PENDING}
            errored={summaryResponse?.status === SUMMARY_STATUS_FAILED}
            // FIXME(frozenhelium): it should be enough to only check insight 1
            empty={isNotDefined(summaryResponse?.insights1_title)
                && isNotDefined(summaryResponse?.insights2_title)
                && isNotDefined(summaryResponse?.insights3_title)}
            emptyMessage={emptyMessage}
        >
            <OpsLearningKeyInsights
                opsLearningSummaryResponse={summaryResponse}
            />
        </Container>
    );
}

export default EmergencyLessonsLearnedFromPreviousOperations;
