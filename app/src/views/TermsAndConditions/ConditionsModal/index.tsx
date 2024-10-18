import { useMemo } from 'react';
import {
    Modal,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { createStringColumn } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import i18n from './i18n.json';

interface Props {
    onClose: () => void;
}

interface TableData {
    id: number;
    srcDbCode: string;
    srcDbLab: string;
    srcOrgCode: string;
    srcOrgLab: string;
    srcOrgtypeCode: string;
}
const keySelector = (d: TableData) => d.id;

function ConditionalModal(props: Props) {
    const strings = useTranslation(i18n);

    const { onClose } = props;

    const tableData: TableData[] = useMemo(() => [
        {
            srcDbCode: strings.srcDbCodeDescriptionOne,
            srcDbLab: strings.srcDbLabDescriptionOne,
            srcOrgCode: strings.srcOrgCodeDescriptionOne,
            srcOrgLab: strings.srcOrgLabDescriptionOne,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionOne,
            id: 1,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionTwo,
            srcDbLab: strings.srcDbLabDescriptionTwo,
            srcOrgCode: strings.srcOrgCodeDescriptionTwo,
            srcOrgLab: strings.srcOrgLabDescriptionTwo,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionTwo,
            id: 2,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionThree,
            srcDbLab: strings.srcDbLabDescriptionThree,
            srcOrgCode: strings.srcOrgCodeDescriptionThree,
            srcOrgLab: strings.srcOrgLabDescriptionThree,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionThree,
            id: 3,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionFour,
            srcDbLab: strings.srcDbLabDescriptionFour,
            srcOrgCode: strings.srcOrgCodeDescriptionFour,
            srcOrgLab: strings.srcOrgLabDescriptionFour,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionFour,
            id: 4,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionFive,
            srcDbLab: strings.srcDbLabDescriptionFive,
            srcOrgCode: strings.srcOrgCodeDescriptionFive,
            srcOrgLab: strings.srcOrgLabDescriptionFive,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionFive,
            id: 5,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionSix,
            srcDbLab: strings.srcDbLabDescriptionSix,
            srcOrgCode: strings.srcOrgCodeDescriptionSix,
            srcOrgLab: strings.srcOrgLabDescriptionSix,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionSix,
            id: 6,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionSeven,
            srcDbLab: strings.srcDbLabDescriptionSeven,
            srcOrgCode: strings.srcOrgCodeDescriptionSeven,
            srcOrgLab: strings.srcOrgLabDescriptionSeven,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionSeven,
            id: 7,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionEight,
            srcDbLab: strings.srcDbLabDescriptionEight,
            srcOrgCode: strings.srcOrgCodeDescriptionEight,
            srcOrgLab: strings.srcOrgLabDescriptionEight,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionEight,
            id: 8,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionNine,
            srcDbLab: strings.srcDbLabDescriptionNine,
            srcOrgCode: strings.srcOrgCodeDescriptionNine,
            srcOrgLab: strings.srcOrgLabDescriptionNine,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionNine,
            id: 9,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionTen,
            srcDbLab: strings.srcDbLabDescriptionTen,
            srcOrgCode: strings.srcOrgCodeDescriptionTen,
            srcOrgLab: strings.srcOrgLabDescriptionTen,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionTen,
            id: 10,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionEleven,
            srcDbLab: strings.srcDbLabDescriptionEleven,
            srcOrgCode: strings.srcOrgCodeDescriptionEleven,
            srcOrgLab: strings.srcOrgLabDescriptionEleven,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionEleven,
            id: 11,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionTwelve,
            srcDbLab: strings.srcDbLabDescriptionTwelve,
            srcOrgCode: strings.srcOrgCodeDescriptionTwelve,
            srcOrgLab: strings.srcOrgLabDescriptionTwelve,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionTwelve,
            id: 12,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionThirteen,
            srcDbLab: strings.srcDbLabDescriptionThirteen,
            srcOrgCode: strings.srcOrgCodeDescriptionThirteen,
            srcOrgLab: strings.srcOrgLabDescriptionThirteen,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionThirteen,
            id: 13,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionFourteen,
            srcDbLab: strings.srcDbLabDescriptionFourteen,
            srcOrgCode: strings.srcOrgCodeDescriptionFourteen,
            srcOrgLab: strings.srcOrgLabDescriptionFourteen,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionFourteen,
            id: 14,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionFifteen,
            srcDbLab: strings.srcDbLabDescriptionFifteen,
            srcOrgCode: strings.srcOrgCodeDescriptionFifteen,
            srcOrgLab: strings.srcOrgLabDescriptionFifteen,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionFifteen,
            id: 15,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionSixteen,
            srcDbLab: strings.srcDbLabDescriptionSixteen,
            srcOrgCode: strings.srcOrgCodeDescriptionSixteen,
            srcOrgLab: strings.srcOrgLabDescriptionSixteen,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionSixteen,
            id: 16,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionSeventeen,
            srcDbLab: strings.srcDbLabDescriptionSeventeen,
            srcOrgCode: strings.srcOrgCodeDescriptionSeventeen,
            srcOrgLab: strings.srcOrgLabDescriptionSeventeen,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionSeventeen,
            id: 17,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionEighteen,
            srcDbLab: strings.srcDbLabDescriptionEighteen,
            srcOrgCode: strings.srcOrgCodeDescriptionEighteen,
            srcOrgLab: strings.srcOrgLabDescriptionEighteen,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionEighteen,
            id: 18,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionNineteen,
            srcDbLab: strings.srcDbLabDescriptionNineteen,
            srcOrgCode: strings.srcOrgCodeDescriptionNineteen,
            srcOrgLab: strings.srcOrgLabDescriptionNineteen,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionNineteen,
            id: 19,
        },
        {
            srcDbCode: strings.srcDbCodeDescriptionTwenty,
            srcDbLab: strings.srcDbLabDescriptionTwenty,
            srcOrgCode: strings.srcOrgCodeDescriptionTwenty,
            srcOrgLab: strings.srcOrgLabDescriptionTwenty,
            srcOrgtypeCode: strings.srcOrgtypeCodeDescriptionTwenty,
            id: 20,
        },
    ], [strings]);

    const columns = useMemo(
        () => ([
            createStringColumn<TableData, number>(
                'src_db_code',
                // NOTE: This string does not need translation
                'src_db_code',
                (item) => item.srcDbCode,
            ),
            createStringColumn<TableData, number>(
                'src_db_lab',
                // NOTE: This string does not need translation
                'src_db_lab',
                (item) => item.srcDbLab,
            ),
            createStringColumn<TableData, number>(
                'src_org_code',
                // NOTE: This string does not need translation
                'src_org_code',
                (item) => item.srcOrgCode,
            ),
            createStringColumn<TableData, number>(
                'src_org_lab',
                // NOTE: This string does not need translation
                'src_org_lab',
                (item) => item.srcOrgLab,
            ),
            createStringColumn<TableData, number>(
                'src_orgtype_code',
                // NOTE: This string does not need translation
                'src_orgtype_code',
                (item) => item.srcOrgtypeCode,
            ),
        ].filter(isDefined)),
        [],
    );

    return (
        <Modal
            heading={strings.hereConditionTitle}
            onClose={onClose}
            size="full"
            withOverflowInContent
        >
            <Table
                filtered={false}
                columns={columns}
                keySelector={keySelector}
                data={tableData}
                pending={false}
            />
        </Modal>
    );
}

export default ConditionalModal;
