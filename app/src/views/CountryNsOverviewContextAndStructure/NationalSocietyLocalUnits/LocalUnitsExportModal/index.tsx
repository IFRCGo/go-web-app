import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Button,
    Description,
    ListView,
    Modal,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToString,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import {
    encodeDate,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import useAlert from '#hooks/useAlert';
import { downloadFile } from '#utils/common';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

interface Props {
    onClose: () => void;
}

function LocalUnitsExportModal(props: Props) {
    const { onClose } = props;

    const strings = useTranslation(i18n);

    const alert = useAlert();

    // FIXME: country response should come from props
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const countryId = countryResponse?.id;

    const [selectedLocalUnitType, setSelectedLocalUnitType] = useState<number>();

    const { response: localUnitsOptions } = useRequest({
        url: '/api/v2/local-units-options/',
    });

    const localUnitNameMap = listToMap(
        localUnitsOptions?.type,
        ({ id }) => id,
        ({ name }) => name,
    );

    const {
        pending: pendingExport,
        trigger: triggerExport,
        error: exportError,
    } = useLazyRequest({
        url: '/api/v2/export-local-unit/',
        isExcelRequest: true,
        query: isDefined(countryId) && selectedLocalUnitType
            ? ({
                country: countryId,
                local_unit_type: selectedLocalUnitType,
            })
            : undefined,
        onSuccess: (response) => {
            try {
                const countryName = countryResponse?.name ?? 'IFRC GO';
                const localUnitName = isDefined(selectedLocalUnitType)
                    ? localUnitNameMap?.[selectedLocalUnitType] ?? ''
                    : '';
                const now = new Date();
                const formattedDate = encodeDate(now);

                downloadFile(
                    response as Blob,
                    `${countryName} ${localUnitName} Local Units ${formattedDate}`,
                    'xlsx',
                );

                alert.show(
                    strings.exportSuccessMessage,
                    { variant: 'success' },
                );
                onClose();
            } catch {
                alert.show(
                    strings.exportFailedToSaveMessage,
                    { variant: 'danger' },
                );
            }
        },
    });

    return (
        <Modal
            heading={resolveToString(strings.modalHeading, {
                countryName: countryResponse?.name ?? '--',
            })}
            headingLevel={4}
            withHeaderBorder
            onClose={onClose}
            size="sm"
            pending={pendingExport}
            pendingMessage="Generating export..."
        >
            <ListView layout="block">
                <Description>
                    {strings.modalDescription}
                </Description>
                <SelectInput
                    required
                    nonClearable
                    label={strings.localUnitTypeInputLabel}
                    value={selectedLocalUnitType}
                    onChange={setSelectedLocalUnitType}
                    name="local_unit_type"
                    options={localUnitsOptions?.type}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                />
                <ListView withCenteredContents>
                    <Button
                        name={null}
                        disabled={isNotDefined(countryId) || isNotDefined(selectedLocalUnitType)}
                        styleVariant="filled"
                        onClick={triggerExport}
                    >
                        {strings.generateExportButtonLabel}
                    </Button>
                </ListView>
                <NonFieldError error={exportError?.value.messageForNotification} />
                <div />
            </ListView>
        </Modal>
    );
}

export default LocalUnitsExportModal;
