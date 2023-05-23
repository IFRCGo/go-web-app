import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import fieldReportStrings from '#strings/fieldReport';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('fieldReport', fieldReportStrings);

    return (
        <Page
            title={strings.fieldReportTitle}
        >
            Field Report Form
        </Page>
    );
}

Component.displayName = 'FieldReportForm';
