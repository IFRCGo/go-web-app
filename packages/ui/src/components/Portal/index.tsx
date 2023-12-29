import { createPortal } from 'react-dom';

export interface Props {
    portalKey?: string;
    container?: Element | DocumentFragment;
    children: React.ReactNode;
}

function Portal(props: Props) {
    const {
        children,
        container = document.body,
        portalKey,
    } = props;
    return (
        <>
            {createPortal(
                children,
                container,
                portalKey,
            )}
        </>
    );
}

export default Portal;
