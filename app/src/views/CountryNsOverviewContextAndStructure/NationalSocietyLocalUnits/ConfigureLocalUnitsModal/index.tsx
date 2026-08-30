import {
    useCallback,
    useMemo,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Button,
    Container,
    ListView,
    Modal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiBody,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import SwitchWithConfirmation from './SwitchWithConfirmation';

import i18n from './i18n.json';

type ExternallyManagedLocalUnitCreateBody = GoApiBody<'/api/v2/externally-managed-local-unit/', 'POST'>
type ExternallyManagedLocalUnitUpdateBody = GoApiBody<'/api/v2/externally-managed-local-unit/{id}/', 'PUT'>

interface Props {
    onClose: () => void;
    onUpdate: () => void;
}

function ConfigureLocalUnitsModal(props: Props) {
    const {
        onClose,
        onUpdate,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();

    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const countryId = countryResponse?.id;

    const {
        response: localUnitsOptions,
        pending: localUnitsOptionsPending,
    } = useRequest({
        url: '/api/v2/local-units-options/',
    });

    const {
        response: externallyManagedResponse,
        pending: externallyManagedPending,
        retrigger: refetchExternallyManaged,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/externally-managed-local-unit/',
        query: {
            country__id: countryId,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const localUnitTypeToIdMap = useMemo(() => (
        listToMap(
            externallyManagedResponse?.results,
            ({ local_unit_type_details }) => local_unit_type_details.id,
            ({ id }) => id,
        )
    ), [externallyManagedResponse?.results]);

    const externallyManagedMapping = useMemo(() => (
        listToMap(
            externallyManagedResponse?.results,
            ({ local_unit_type_details }) => local_unit_type_details.id,
            ({ enabled }) => enabled,
        )
    ), [externallyManagedResponse?.results]);

    const {
        trigger: triggerCreateExternallyManaged,
        pending: externallyManagedCreatePending,
    } = useLazyRequest({
        url: '/api/v2/externally-managed-local-unit/',
        method: 'POST',
        body: (values: ExternallyManagedLocalUnitCreateBody) => values,
        onSuccess: () => {
            refetchExternallyManaged();
            onUpdate();
        },
        onFailure: (response) => {
            refetchExternallyManaged();
            alert.show(
                strings.updateFailureMessage,
                {
                    variant: 'danger',
                    description: response?.value?.messageForNotification,
                },
            );
        },
    });

    const {
        trigger: triggerUpdateExternallyManaged,
        pending: externallyManagedUpdatePending,
    } = useLazyRequest({
        // FIXME: we should use patch here instead
        // This might need some change in server as well
        method: 'PUT',
        url: '/api/v2/externally-managed-local-unit/{id}/',
        pathVariables: (body) => {
            const id = localUnitTypeToIdMap?.[body.local_unit_type];

            if (isNotDefined(id)) {
                return undefined;
            }

            return { id };
        },
        body: (values: ExternallyManagedLocalUnitUpdateBody) => values,
        onSuccess: () => {
            refetchExternallyManaged();
            onUpdate();
        },
        onFailure: (response) => {
            refetchExternallyManaged();
            alert.show(
                strings.updateFailureMessage,
                {
                    variant: 'danger',
                    description: response?.value?.messageForNotification,
                },
            );
        },
    });

    const handleLocalUnitSwitchChange = useCallback((value: boolean, name: number) => {
        if (isNotDefined(countryId)) {
            return;
        }

        const shouldCreateExternallyManaged = !localUnitTypeToIdMap?.[name];

        if (shouldCreateExternallyManaged) {
            triggerCreateExternallyManaged({
                country: countryId,
                local_unit_type: name,
                enabled: value,
            });
        } else {
            triggerUpdateExternallyManaged({
                country: countryId,
                local_unit_type: name,
                enabled: value,
            });
        }
    }, [
        countryId,
        localUnitTypeToIdMap,
        triggerCreateExternallyManaged,
        triggerUpdateExternallyManaged,
    ]);

    const pending = localUnitsOptionsPending
        || externallyManagedPending
        || externallyManagedCreatePending
        || externallyManagedUpdatePending;

    return (
        <Modal
            heading={resolveToString(
                strings.modalHeading,
                { countryName: countryResponse?.name ?? '--' },
            )}
            headingLevel={4}
            onClose={onClose}
            withHeaderBorder
            footerActions={(
                <Button
                    name={undefined}
                    onClick={onClose}
                >
                    {strings.closeButtonLabel}
                </Button>
            )}
        >
            <Container
                heading={strings.manageExternallyHeading}
                headerDescription={strings.externallyManagedDescription}
                headingLevel={5}
                pending={pending}
            >
                <ListView
                    layout="block"
                    spacing="2xs"
                >
                    {localUnitsOptions?.type.map((type) => (
                        <SwitchWithConfirmation
                            key={type.id}
                            name={type.id}
                            label={type.name}
                            value={externallyManagedMapping?.[type.id]}
                            onChange={handleLocalUnitSwitchChange}
                        />
                    ))}
                </ListView>
            </Container>
        </Modal>
    );
}

export default ConfigureLocalUnitsModal;
