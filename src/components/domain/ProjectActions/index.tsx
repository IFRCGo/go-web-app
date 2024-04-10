import {
    MoreFillIcon,
    SearchLineIcon,
    PencilFillIcon,
    CopyLineIcon,
    HistoryLineIcon,
    DeleteBinLineIcon,
} from '@ifrc-go/icons';

import { resolveUrl } from '#utils/resolveUrl';
import { useLazyRequest } from '#utils/restRequest';
import BlockLoading from '#components/BlockLoading';
import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import ConfirmButton from '#components/ConfirmButton';
import useAlert from '#hooks/useAlert';
import { adminUrl } from '#config';
import { type GoApiResponse } from '#utils/restRequest';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];

export interface Props {
    className?: string;
    onProjectDeletionSuccess: () => void;
    project: Project;
}

function ProjectActions(props: Props) {
    const strings = useTranslation(i18n);
    const alert = useAlert();

    const {
        className,
        project,
        onProjectDeletionSuccess,
    } = props;

    const {
        pending: projectDeletionPending,
        trigger: requestProjectDeletion,
    } = useLazyRequest({
        url: '/api/v2/project/{id}/',
        method: 'DELETE',
        pathVariables: { id: project.id },
        onSuccess: onProjectDeletionSuccess,
        onFailure: ({ value }) => {
            alert.show(
                resolveToString(strings.projectDeleteFailureMessage, {
                    message: value.messageForNotification,
                }),
                { variant: 'danger' },
            );
        },
    });

    return (
        <>
            {/* FIXME: this BlockLoading doesn't look good */}
            {projectDeletionPending && <BlockLoading />}

            <DropdownMenu
                className={className}
                variant="tertiary"
                withoutDropdownIcon
                label={<MoreFillIcon className={styles.icon} />}
                persistent
            >
                <DropdownMenuItem
                    type="link"
                    to="threeWProjectDetail"
                    urlParams={{ projectId: project.id }}
                    icons={<SearchLineIcon />}
                >
                    {strings.projectViewDetails}
                </DropdownMenuItem>
                <DropdownMenuItem
                    type="link"
                    to="threeWProjectEdit"
                    urlParams={{ projectId: project.id }}
                    icons={<PencilFillIcon />}
                >
                    {strings.actionDropdownEditLabel}
                </DropdownMenuItem>
                <DropdownMenuItem
                    type="link"
                    to="newThreeWProject"
                    state={{ projectId: project.id }}
                    icons={<CopyLineIcon />}
                >
                    {strings.projectDuplicate}
                </DropdownMenuItem>
                <DropdownMenuItem
                    type="link"
                    icons={<HistoryLineIcon />}
                    href={resolveUrl(adminUrl, `deployments/project/${project.id}/history/`)}
                    external
                >
                    {strings.projectHistory}
                </DropdownMenuItem>
                <ConfirmButton
                    name={null}
                    confirmHeading={strings.deleteProject}
                    confirmMessage={strings.deleteProjectMessage}
                    onConfirm={requestProjectDeletion}
                    disabled={projectDeletionPending}
                    variant="dropdown-item"
                    icons={<DeleteBinLineIcon />}
                >
                    {strings.deleteProject}
                </ConfirmButton>
            </DropdownMenu>
        </>
    );
}

export default ProjectActions;