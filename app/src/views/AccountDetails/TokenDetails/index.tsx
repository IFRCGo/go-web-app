import { useCallback } from 'react';
import { CopyLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
    data: GoApiResponse<'/api/v2/external-token/{id}/'> | undefined;
}

function TokenDetails(props: Props) {
    const {
        data,
        className,
    } = props;

    const alert = useAlert();
    const strings = useTranslation(i18n);

    const handleCopyButtonClick = useCallback(
        (token: string | undefined) => {
            if (isDefined(token)) {
                window.navigator.clipboard.writeText(token);
                alert.show(strings.copySuccessMessage);
            }
        },
        [alert, strings],
    );

    return (
        <Container
            className={_cs(styles.tokenDetails, className)}
            heading={data?.title}
            headingLevel={5}
            actions={isDefined(data?.token) && (
                <Button
                    name={data?.token}
                    variant="tertiary"
                    title={strings.copyButtonLabel}
                    onClick={handleCopyButtonClick}
                >
                    <CopyLineIcon />
                </Button>
            )}
            headerDescription={(
                <>
                    <TextOutput
                        label={strings.createdAtLabel}
                        value={data?.created_at}
                        valueType="date"
                        className={styles.createdAt}
                    />
                    <TextOutput
                        label={strings.expiresOnLabel}
                        value={data?.expire_timestamp}
                        valueType="date"
                        className={styles.expiresOn}
                    />
                </>
            )}
        >
            {isDefined(data?.token) && (
                <div className={styles.token}>
                    {data?.token}
                </div>
            )}
        </Container>
    );
}

export default TokenDetails;
