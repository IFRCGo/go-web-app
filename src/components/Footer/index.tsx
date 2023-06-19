import useBasicLayout from '#hooks/useBasicLayout';

interface Props {
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    children: React.ReactNode;
    childrenContainerClassName?: string;
    className?: string;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
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
    });

    return (
        <div className={containerClassName}>
            {content}
        </div>
    );
}

export default Footer;
