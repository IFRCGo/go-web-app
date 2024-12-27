import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Container,
    DescriptionText,
    Heading,
    TextOutput,
    type TextOutputProps,
} from '@ifrc-go/ui/printable';

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
    const strings = useTranslation(i18n);

    return (
        <div className={styles.pgaExport}>
            <Heading level={2}>
                {strings.imminentDREFRequestHeading}
            </Heading>
            <Heading level={4}>
                {strings.requestHeading}
            </Heading>
            <Container>
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
            <Heading level={4}>
                {strings.nationalSocietyHeading}
            </Heading>
            <Container>
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
            <Heading level={4}>
                {strings.nationalSocietyBankDetails}
            </Heading>
            <Container>
                <DescriptionText className={styles.tableDescription}>
                    {strings.nationalSocietyBankDescription}
                </DescriptionText>
                <div className={styles.bankDetails}>
                    <BlockTextOutput
                        label={strings.nationalSocietyBankName}
                        value=""
                        invalidText
                    />
                    <BlockTextOutput
                        label={strings.nationalSocietyBankAccountNumber}
                        value=""
                        invalidText
                    />
                    <BlockTextOutput
                        label={strings.nationalSocietySwiftCode}
                        value=""
                        invalidText
                    />
                    <BlockTextOutput
                        label={strings.nationalSocietyAmount}
                        value={strings.nationalSocietyAmountCHF}
                    />
                    <BlockTextOutput
                        label={strings.nationalSocietyAdvancePayment}
                        value=""
                        invalidText
                    />
                </div>
                <i>{strings.nationalSocietyBankFooter}</i>
            </Container>
            <Heading level={4}>
                {strings.imminentDrefRequest}
            </Heading>
            <Container>
                <div className={styles.drefSigned}>
                    <TextOutput
                        className={styles.drefTable}
                        label={strings.imminentDrefSigned}
                        value=""
                        invalidText
                        strongLabel
                        withoutLabelColon
                    />
                    <TextOutput
                        className={styles.drefTable}
                        label={strings.imminentIFRCSigned}
                        value=""
                        invalidText
                        strongLabel
                        withoutLabelColon
                    />
                    <TextOutput
                        className={styles.signature}
                        label={strings.imminentSignature}
                        value=""
                        invalidText
                        withoutLabelColon
                        strongLabel
                    />
                    <TextOutput
                        className={styles.signature}
                        label={strings.imminentSignature}
                        value=""
                        invalidText
                        withoutLabelColon
                        strongLabel
                    />
                    <TextOutput
                        className={styles.signature}
                        label={strings.imminentPrintedSignatory}
                        value=""
                        invalidText
                        withoutLabelColon
                        strongLabel
                    />
                    <TextOutput
                        className={styles.signature}
                        label={strings.imminentPrintedSignatory}
                        value=""
                        invalidText
                        withoutLabelColon
                        strongLabel
                    />
                    <TextOutput
                        className={styles.signature}
                        label={strings.imminentTitle}
                        value=""
                        invalidText
                        withoutLabelColon
                        strongLabel
                    />
                    <TextOutput
                        className={styles.signature}
                        label={strings.imminentTitle}
                        value=""
                        invalidText
                        withoutLabelColon
                        strongLabel
                    />
                    <TextOutput
                        className={styles.signature}
                        label={strings.imminentDate}
                        value=""
                        invalidText
                        withoutLabelColon
                        strongLabel
                    />
                    <TextOutput
                        className={styles.signature}
                        label={strings.imminentDate}
                        value=""
                        invalidText
                        withoutLabelColon
                        strongLabel
                    />
                </div>
            </Container>
        </div>
    );
}

export default PgaExport;
