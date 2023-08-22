import { useMemo } from 'react';
import {
    EntriesAsList,
    Error,
    useFormArray,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import InputSection from '#components/InputSection';
import { useRequest } from '#utils/restRequest';
import { type GoApiResponse } from '#utils/restRequest';

import {
    type FormType,
    type PartialActionTaken,
} from '../schema';
import i18n from './i18n.json';

import ActionInput from './ActionInput';

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
            limit: 500,
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

    const [
        placeholder,
        title,
        description,
    ] = useMemo(() => ([
        {
            NTLS: strings.flashUpdateFormActionTakenByNationalSocietyPlaceholder,
            PNS: strings.flashUpdateFormActionTakenByRcrcPlaceholder,
            FDRN: strings.flashUpdateFormActionTakenByIfrcPlaceholder,
            GOV: strings.flashUpdateFormActionTakenByGovernmentPlaceholder,
        },
        {
            NTLS: strings.flashUpdateFormActionTakenByNationalSocietyLabel,
            PNS: strings.flashUpdateFormActionTakenByRcrcLabel,
            FDRN: strings.flashUpdateFormActionTakenByIfrcLabel,
            GOV: strings.flashUpdateFormActionTakenByGovernmentLabel,
        },
        {
            NTLS: strings.flashUpdateFormActionTakenByNationalSocietyDescription,
            PNS: strings.flashUpdateFormActionTakenByRcrcDescription,
            FDRN: strings.flashUpdateFormActionTakenByIfrcDescription,
            GOV: strings.flashUpdateFormActionTakenByGovernmentDescription,
        },
    ] as const), [strings]);

    return (
        <Container
            heading={strings.flashUpdateFormActionTakenTitle}
        >
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
                            actionOptions={actionOptionsMap[actionTaken.organization]}
                            disabled={disabled}
                        />
                    </InputSection>
                ) : null
            ))}
        </Container>
    );
}

export default ActionsInput;
