import React, { useState } from 'react';
import {
    unique,
    listToMap,
    compareNumber,
    listToGroupList,
    _cs,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import BlockLoading from '#components/BlockLoading';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import Tab from '#components/Tabs/Tab';
import TabPanel from '#components/Tabs/TabPanel';
import Container from '#components/Container';
import ExpandableContainer from '#components/ExpandableContainer';
import ProgressBar from '#components/ProgressBar';
import Button from '#components/Button';
import {
    ListResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import useAlert from '#hooks/useAlert';
import useTranslation from '#hooks/useTranslation';

import {
    Area,
    PerFormQuestionItem,
} from '../common';
import {
    assessmentSchema2,
    PartialAssessment,
    Assessment,
} from '../usePerProcessOptions';
import AreaInput from './AreaInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    perId?: number;
}

function AssessmentForm(props: Props) {
    const { perId } = props;

    const {
        // value,
        // error,
        // setError,
        // setValue,
        value,
        validate,
        setFieldValue,
        setError: onErrorSet,
    } = useForm(
        assessmentSchema2,
        // TODO: move this to separate variable
        {
            value: {
                // overview_id:
                is_draft: true,
                area_responses: [],
            },
        },
    );

    const {
        setValue: setAreaResponsesValue,
    } = useFormArray('area_responses', setFieldValue);

    const strings = useTranslation(i18n);

    const alert = useAlert();

    const [areas, setAreas] = useState<Area[]>([]);
    const [currentArea, setCurrentArea] = useState<number | undefined>();

    const {
        pending: questionsPending,
        response: questionsResponse,
    } = useRequest<ListResponse<PerFormQuestionItem>>({
        url: 'api/v2/per-formquestion/',
        query: {
            limit: 500,
        },
        onSuccess: (response) => {
            const responseAreas = response?.results.map(
                (question) => question.component.area,
            );
            const uniqueAreas = unique(responseAreas ?? [], (area) => area.id);
            const sortedUniqueAreas = uniqueAreas.sort(
                (area1, area2) => compareNumber(area1.area_num, area2.area_num),
            );

            setAreas(sortedUniqueAreas);
            setCurrentArea(sortedUniqueAreas[0]?.id);
        },
    });

    const minArea = 1;
    const maxArea = areas.length;

    const {
        trigger: submitRequest,
    } = useLazyRequest({
        url: perId ? `api/v2/updatemultipleperforms/${perId}/` : 'api/v2/updatemultipleperforms/',
        method: perId ? 'PUT' : 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            alert.show(
                strings.perFormSaveRequestSuccessMessage,
                { variant: 'success' },
            );
        },
        onFailure: ({
            value: {
                messageForNotification,
                // formErrors,
            },
            debugMessage,
        }) => {
            alert.show(
                <p>
                    {strings.perFormSaveRequestFailureMessage}
                    &nbsp;
                    <strong>
                        {messageForNotification}
                    </strong>
                </p>,
                {
                    variant: 'danger',
                    debugMessage,
                },
            );
        },
    });

    const handleSubmit = React.useCallback((finalValues: PartialAssessment) => {
        console.log('Final values', finalValues as Assessment);
        // TODO: transform the values
    }, []);
    const handleNextTab = () => {
        setCurrentArea(Math.min((currentArea ?? 0) + 1, areas.length));
    };

    const handlePrevTab = () => {
        setCurrentArea(Math.max((currentArea ?? 0) - 1, 1));
    };

    const areaResponseMapping = listToMap(
        value?.area_responses ?? [],
        (areaResponse) => areaResponse.area_id,
        (areaResponse, _, index) => ({
            index,
            value: areaResponse,
        }),
    );

    const areaIdGroupedQuestion = listToGroupList(
        questionsResponse?.results ?? [],
        (question) => question.component.area.id,
    );

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            className={styles.assessmentForm}
        >
            {questionsPending && (
                <BlockLoading />
            )}
            {!questionsPending && (
                <ExpandableContainer
                    className={_cs(styles.customActivity, styles.errored)}
                    componentRef={undefined}
                    actions="Show Summary"
                >
                    <Container
                        className={styles.inputSection}
                    >
                        <ProgressBar
                            title="Answered 20/100"
                            value={50}
                            totalValue={100}
                        />
                    </Container>
                </ExpandableContainer>
            )}
            {!questionsPending && currentArea && (
                <Tabs
                    disabled={undefined}
                    onChange={setCurrentArea}
                    value={currentArea}
                    variant="primary"
                >
                    <TabList
                        className={styles.tabList}
                    >
                        {areas.map((area) => (
                            <Tab
                                key={area.id}
                                name={area.id}
                                step={area?.area_num}
                                errored={undefined}
                            >
                                {`${area.area_num}. ${area.title}`}
                            </Tab>
                        ))}
                    </TabList>
                    {areas.map((area) => (
                        <TabPanel
                            name={area.id}
                            key={area.id}
                        >
                            <AreaInput
                                key={area.id}
                                area={area}
                                questions={areaIdGroupedQuestion[area.id]}
                                index={areaResponseMapping[area.id]?.index}
                                value={areaResponseMapping[area.id]?.value}
                                onChange={setAreaResponsesValue}
                            />
                        </TabPanel>
                    ))}
                    <div className={styles.actions}>
                        {currentArea !== undefined && currentArea > minArea
                            && (
                                <Button
                                    name={undefined}
                                    variant="secondary"
                                    onClick={handlePrevTab}
                                    disabled={undefined}
                                >
                                    Back
                                </Button>
                            )}
                        {currentArea !== undefined && currentArea < maxArea
                            && (
                                <Button
                                    name="next"
                                    variant="secondary"
                                    onClick={handleNextTab}
                                    disabled={undefined}
                                >
                                    Next
                                </Button>
                            )}
                        <Button
                            type="submit"
                            name="submit"
                            variant="secondary"
                        >
                            Submit
                        </Button>
                    </div>
                </Tabs>
            )}
        </form>
    );
}

export default AssessmentForm;
