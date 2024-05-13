import useBasicLayout, { type Props as BasicLayoutProps } from '#hooks/useBasicLayout';

export interface Props {
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    children: React.ReactNode;
    childrenContainerClassName?: string;
    className?: string;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
    spacing?: BasicLayoutProps['spacing'];
    withoutWrap?: boolean;
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
        withoutWrap,
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
        withoutWrap,
    });

    return (
        <div className={containerClassName}>
            {content}
        </div>
    );
}

export default Footer;
