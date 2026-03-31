import Container from '#components/Container';
import Description from '#components/Description';
import InfoPopup from '#components/InfoPopup';
import ListView from '#components/ListView';

type NumColumn = 1 | 2 | 3 | 4;
export interface Props {
    // className?: string;
    title?: React.ReactNode;
    children?: React.ReactNode;
    description?: React.ReactNode;
    // contentSectionClassName?: string;
    tooltip?: string;
    withoutTitleSection?: boolean;
    withFullWidthContent?: boolean;
    withoutPadding?: boolean;
    withoutBackground?: boolean;
    withAsteriskOnTitle?: boolean;
    numPreferredColumns?: NumColumn;
    withShadow?: boolean;
}

function InputSection(props: Props) {
    const {
        // className,
        title,
        children,
        description,
        tooltip,
        // contentSectionClassName,
        withoutTitleSection = false,
        withoutPadding = false,
        withoutBackground = false,
        withAsteriskOnTitle,
        numPreferredColumns = 1,
        withFullWidthContent,
        withShadow,
    } = props;

    const content = (
        <>
            {!withoutTitleSection && (
                <Container
                    heading={(
                        <>
                            {title}
                            {withAsteriskOnTitle && (
                                <span aria-hidden>*</span>
                            )}
                        </>
                    )}
                    // headingDescription={withAsteriskOnTitle && (
                    //     <span aria-hidden className={styles.asterisk}>
                    //         *
                    //     </span>
                    // )}
                    headerActions={tooltip && <InfoPopup description={tooltip} />}
                    headingLevel={6}
                >
                    <Description withLightText>
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                        >
                            {description}
                        </ListView>
                    </Description>
                </Container>
            )}
            <ListView
                layout="grid"
                numPreferredGridColumns={numPreferredColumns}
            >
                {children}
            </ListView>
        </>
    );

    return (
        <Container
            withPadding={!withoutPadding}
            withBackground={!withoutBackground}
            withShadow={withShadow}
            spacing="lg"
            // className={_cs(
            //     styles.inputSection,
            //     withoutTitleSection && styles.withoutTitleSection,
            //     !withoutPadding && styles.withPadding,
            //     withCompactTitleSection && styles.withCompactTitleSection,
            //     className,
            // )}
        >
            {withFullWidthContent && (
                <ListView
                    layout="block"
                    withSpacingOpticalCorrection
                >
                    {content}
                </ListView>
            )}
            {!withFullWidthContent && !withoutTitleSection && (
                <ListView
                    layout="grid"
                    withSidebar
                    sidebarPosition="start"
                >
                    {content}
                </ListView>
            )}
            {!withFullWidthContent && withoutTitleSection && content}
        </Container>
    );
}

export default InputSection;
