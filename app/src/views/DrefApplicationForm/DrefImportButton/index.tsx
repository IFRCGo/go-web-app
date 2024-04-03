import { useCallback } from 'react';
import { RawFileInput } from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';
import xlsx from 'exceljs';

import { SHEET_OPERATION_OVERVIEW } from '#utils/domain/dref';

import { DrefRequestBody } from '../schema';

interface Props {
    onImport?: (formFields?: DrefRequestBody) => void;
}

function DrefImportButton(props: Props) {
    const { onImport } = props;

    const handleChange = useCallback((file: File | undefined) => {
        if (isNotDefined(file)) {
            return;
        }

        async function loadFile(excelFile: File) {
            const workbook = new xlsx.Workbook();
            const buffer = await excelFile.arrayBuffer();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.getWorksheet(SHEET_OPERATION_OVERVIEW);
            worksheet?.eachRow((row) => {
                const fieldName = row.getCell(1)?.name;
                console.info(fieldName);
            });

            if (onImport) {
                onImport();
            }
        }

        loadFile(file);
    }, [onImport]);

    return (
        <RawFileInput
            name={undefined}
            accept=".xlsx"
            onChange={handleChange}
            variant="secondary"
        >
            Import
        </RawFileInput>
    );
}

export default DrefImportButton;
