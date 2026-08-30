import { useCallback } from 'react';
import { CopyLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Description,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

interface Props {
    data: GoApiResponse<'/api/v2/external-token/{id}/'> | undefined;
    withoutPadding?: boolean;
}

function TokenDetails(props: Props) {
    const {
        data,
        withoutPadding,
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
            heading={data?.title}
            headingLevel={5}
            headerActions={isDefined(data?.token) && (
                <Button
                    name={data?.token}
                    styleVariant="action"
                    title={strings.copyButtonLabel}
                    onClick={handleCopyButtonClick}
                >
                    <CopyLineIcon />
                </Button>
            )}
            headerDescription={(
                <ListView
                    withSpacingOpticalCorrection
                    spacing="3xs"
                    layout="block"
                >
                    <TextOutput
                        label={strings.createdAtLabel}
                        value={data?.created_at}
                        valueType="date"
                        textSize="sm"
                    />
                    <TextOutput
                        label={strings.expiresOnLabel}
                        value={data?.expire_timestamp}
                        valueType="date"
                        textSize="sm"
                    />
                </ListView>
            )}
            withBackground={!withoutPadding}
            withPadding={!withoutPadding}
        >
            {isDefined(data?.token) && (
                <Description
                    textSize="sm"
                    withLightText
                >
                    {data?.token}
                </Description>
            )}
        </Container>
    );
}

export default TokenDetails;
