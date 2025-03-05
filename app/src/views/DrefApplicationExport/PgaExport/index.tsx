import { useParams } from 'react-router-dom';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Container,
    DescriptionText,
    Heading,
    Signature,
    TextOutput,
    type TextOutputProps,
} from '@ifrc-go/ui/printable';
import {
    isDefined,
    isFalsyString,
} from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

export function BlockTextOutput(props: TextOutputProps
    & { variant?: never, withoutLabelColon?: never }) {
    return (
        <TextOutput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            variant="contents"
            withoutLabelColon
        />
    );
}

function PgaExport() {
    const { drefId } = useParams<{ drefId: string }>();
    const strings = useTranslation(i18n);

    const {
        response: drefResponse,
    } = useRequest({
        skip: isFalsyString(drefId),
        url: '/api/v2/dref/{id}/',
        pathVariables: isDefined(drefId) ? {
            id: drefId,
        } : undefined,
    });

    return (
        <div className={styles.pgaExport}>
            <Heading level={2}>
                {strings.imminentDREFRequestHeading}
            </Heading>
            <Container
                heading={strings.requestHeading}
                headingLevel={4}
            >
                <DescriptionText>
                    <ol
                        className={styles.description}
                        type="1"
                    >
                        <li>
                            {strings.requestDescription}
                        </li>
                    </ol>
                </DescriptionText>
            </Container>
            <Container
                heading={strings.nationalSocietyHeading}
                headingLevel={4}
            >
                <DescriptionText>
                    <ol
                        className={styles.description}
                        start={2}
                    >
                        <li>
                            {strings.nationalSocietyDescriptionOne}
                        </li>
                        <li>
                            {strings.nationalSocietyDescriptionTwo}
                        </li>
                        <li>
                            {strings.nationalSocietyDescriptionThree}
                            <ol
                                className={styles.description}
                                type="a"
                            >
                                <li>
                                    {strings.nationalSocietyDescriptionFour}
                                </li>
                                <li>
                                    {strings.nationalSocietyDescriptionFive}
                                </li>
                                <li>
                                    {strings.nationalSocietyDescriptionSix}
                                </li>
                                <li>
                                    {strings.nationalSocietyDescriptionSeven}
                                    <ol type="i">
                                        <li>
                                            {strings.nationalSocietyDescriptionEight}
                                            <br />
                                            <i>{strings.nationalSocietyDescriptionNine}</i>
                                        </li>
                                        <li>
                                            {strings.nationalSocietyDescriptionTen}
                                            <br />
                                            <i>{strings.nationalSocietyDescriptionEleven}</i>
                                        </li>
                                    </ol>
                                </li>
                            </ol>
                        </li>
                        <li>
                            {strings.nationalSocietyDescriptionTwelve}
                            <ol type="i">
                                <li>
                                    <i>{strings.nationalSocietyDescriptionThirteen}</i>
                                </li>
                            </ol>
                        </li>
                        <li>
                            {strings.nationalSocietyDescriptionFourteen}
                            <ol type="i">
                                <li>
                                    <i>{strings.nationalSocietyDescriptionThirteen}</i>
                                </li>
                                <li>
                                    <i>{strings.nationalSocietyDescriptionFifteen}</i>
                                </li>
                            </ol>
                        </li>
                    </ol>
                </DescriptionText>
            </Container>
            <Container>
                <DescriptionText>
                    {strings.nationalSocietyDescriptionSixteen}
                </DescriptionText>
            </Container>
            <Container
                heading={strings.nationalSocietyBankDetails}
                headingLevel={4}
            >
                <DescriptionText className={styles.tableDescription}>
                    {strings.nationalSocietyBankDescription}
                </DescriptionText>
                <div className={styles.bankDetails}>
                    <BlockTextOutput
                        label={strings.nationalSocietyBankName}
                        invalidText={null}
                    />
                    <BlockTextOutput
                        label={strings.nationalSocietyBankAccountNumber}
                        invalidText={null}
                    />
                    <BlockTextOutput
                        label={strings.nationalSocietySwiftCode}
                        invalidText={null}
                    />
                    <BlockTextOutput
                        label={strings.nationalSocietyAmount}
                        value={drefResponse?.total_cost}
                        valueType="number"
                    />
                    <BlockTextOutput
                        label={strings.nationalSocietyAdvancePayment}
                        invalidText={null}
                    />
                </div>
                <i>{strings.nationalSocietyBankFooter}</i>
            </Container>
            <Container
                heading={strings.imminentDrefRequest}
                headingLevel={4}
            >
                <div className={styles.drefSigned}>
                    <TextOutput
                        className={styles.drefTable}
                        label={strings.imminentDrefSigned}
                        invalidText={null}
                        strongLabel
                        withoutLabelColon
                    />
                    <TextOutput
                        className={styles.drefTable}
                        label={strings.imminentIFRCSigned}
                        invalidText={null}
                        strongLabel
                        withoutLabelColon
                    />
                    <Signature label={strings.imminentSignature} />
                    <Signature label={strings.imminentSignature} />
                    <Signature label={strings.imminentPrintedSignatory} />
                    <Signature label={strings.imminentPrintedSignatory} />
                    <Signature label={strings.imminentTitle} />
                    <Signature label={strings.imminentTitle} />
                    <Signature label={strings.imminentDate} />
                    <Signature label={strings.imminentDate} />
                </div>
            </Container>
        </div>
    );
}

export default PgaExport;
