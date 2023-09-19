import useBasicLayout, { type Props as BasicLayoutProps } from '#hooks/useBasicLayout';

interface Props {
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    children: React.ReactNode;
    childrenContainerClassName?: string;
    className?: string;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
    spacing?: BasicLayoutProps['spacing'];
}

function Footer(props: Props) {
    const {
        actions,
        actionsContainerClassName,
        children,
        childrenContainerClassName,
        className,
        icons,
        iconsContainerClassName,
        spacing,
    } = props;

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        actions,
        actionsContainerClassName,
        children,
        childrenContainerClassName,
        className,
        icons,
        iconsContainerClassName,
        spacing,
        variant: 'large',
    });

    return (
        <div className={containerClassName}>
            {content}
        </div>
    );
}

export default Footer;
