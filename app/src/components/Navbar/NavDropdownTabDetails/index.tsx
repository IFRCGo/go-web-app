import {
    Description,
    ListView,
    TabPanel,
} from '@ifrc-go/ui';

interface Props {
    name: string;
    description?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
}

function NavDropdownTabDetails(props: Props) {
    const {
        name,
        description,
        footer,
        children,
    } = props;

    return (
        <TabPanel
            name={name}
            withContentsOnly
        >
            <ListView
                layout="block"
                withGrow
            >
                <ListView
                    layout="block"
                    withSpacingOpticalCorrection
                    withPadding
                    withGrow
                >
                    <Description textSize="xs">
                        {description}
                    </Description>
                    <ListView
                        layout="block"
                        withSpacingOpticalCorrection
                    >
                        {children}
                    </ListView>
                </ListView>
                {footer && (
                    <ListView
                        layout="block"
                        withSpacingOpticalCorrection
                        withDarkBackground
                        withPadding
                    >
                        {footer}
                    </ListView>
                )}
            </ListView>
        </TabPanel>
    );
}

export default NavDropdownTabDetails;
