import { useMemo } from 'react';
import {
    Container,
    InputSection,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import {
    type FormType,
    type PartialActionTaken,
} from '../schema';
import ActionInput from './ActionInput';

import i18n from './i18n.json';

type ActionsResponse = GoApiResponse<'/api/v2/flash-update-action/'>;
type Action = NonNullable<ActionsResponse['results']>[number];

interface Props {
    error: Error<FormType> | undefined;
    onValueChange: (...entries: EntriesAsList<FormType>) => void;
    value: FormType;
    disabled?: boolean;
}

function ActionsInput(props: Props) {
    const strings = useTranslation(i18n);
    const {
        error: formError,
        onValueChange,
        value,
        disabled,
    } = props;

    const {
        response: actionsResponse,
    } = useRequest({
        url: '/api/v2/flash-update-action/',
        query: {
            limit: 9999,
        },
    });

    const actionOptionsMap = useMemo(() => {
        if (!actionsResponse?.results?.length) {
            return {
                NTLS: [],
                PNS: [],
                FDRN: [],
                GOV: [],
            };
        }

        const actionList = actionsResponse.results;
        const getFilterOrganization = (organizationType: string) => (
            (actionTaken: Action) => (
                actionTaken.organizations?.findIndex(
                    (frt: string) => frt === organizationType,
                ) !== -1
            )
        );

        const actionMap = {
            NTLS: actionList.filter(getFilterOrganization('NTLS')),
            PNS: actionList.filter(getFilterOrganization('PNS')),
            FDRN: actionList.filter(getFilterOrganization('FDRN')),
            GOV: actionList.filter(getFilterOrganization('GOV')),
        };

        return actionMap;
    }, [actionsResponse?.results]);

    const {
        setValue,
    } = useFormArray<'actions_taken', PartialActionTaken>(
        'actions_taken',
        onValueChange,
    );

    const error = getErrorObject(formError);

    const placeholder = useMemo(() => ({
        NTLS: strings.flashUpdateFormActionTakenByNationalSocietyPlaceholder,
        PNS: strings.flashUpdateFormActionTakenByRcrcPlaceholder,
        FDRN: strings.flashUpdateFormActionTakenByIfrcPlaceholder,
        GOV: strings.flashUpdateFormActionTakenByGovernmentPlaceholder,
    } as const), [
        strings.flashUpdateFormActionTakenByNationalSocietyPlaceholder,
        strings.flashUpdateFormActionTakenByRcrcPlaceholder,
        strings.flashUpdateFormActionTakenByIfrcPlaceholder,
        strings.flashUpdateFormActionTakenByGovernmentPlaceholder,
    ]);

    const title = useMemo(() => ({
        NTLS: strings.flashUpdateFormActionTakenByNationalSocietyLabel,
        PNS: strings.flashUpdateFormActionTakenByRcrcLabel,
        FDRN: strings.flashUpdateFormActionTakenByIfrcLabel,
        GOV: strings.flashUpdateFormActionTakenByGovernmentLabel,
    } as const), [
        strings.flashUpdateFormActionTakenByNationalSocietyLabel,
        strings.flashUpdateFormActionTakenByRcrcLabel,
        strings.flashUpdateFormActionTakenByIfrcLabel,
        strings.flashUpdateFormActionTakenByGovernmentLabel,
    ]);

    const description = useMemo(() => ({
        NTLS: strings.flashUpdateFormActionTakenByNationalSocietyDescription,
        PNS: strings.flashUpdateFormActionTakenByRcrcDescription,
        FDRN: strings.flashUpdateFormActionTakenByIfrcDescription,
        GOV: strings.flashUpdateFormActionTakenByGovernmentDescription,
    } as const), [
        strings.flashUpdateFormActionTakenByNationalSocietyDescription,
        strings.flashUpdateFormActionTakenByRcrcDescription,
        strings.flashUpdateFormActionTakenByIfrcDescription,
        strings.flashUpdateFormActionTakenByGovernmentDescription,
    ]);

    return (
        <Container
            heading={strings.flashUpdateFormActionTakenTitle}
        >
            <NonFieldError error={getErrorObject(error?.actions_taken)} />
            {value?.actions_taken?.map((actionTaken, index) => (
                actionTaken.organization ? (
                    <InputSection
                        key={actionTaken.client_id}
                        title={title[actionTaken.organization]}
                        description={description[actionTaken.organization]}
                    >
                        <ActionInput
                            error={getErrorObject(error?.actions_taken)}
                            index={index}
                            placeholder={actionTaken.organization
                                ? placeholder[actionTaken.organization] : undefined}
                            value={actionTaken}
                            onChange={setValue}
                            options={actionOptionsMap[actionTaken.organization]}
                            disabled={disabled}
                        />
                    </InputSection>
                ) : null
            ))}
        </Container>
    );
}

export default ActionsInput;
