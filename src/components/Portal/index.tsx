import React from 'react';
import { createPortal } from 'react-dom';

export interface Props {
  children: React.ReactNode;
}

function Portal(props: Props) {
    const { children } = props;
    return (
        <>
            {createPortal(
                children,
                document.body,
            )}
        </>
    );
}

export default Portal;
