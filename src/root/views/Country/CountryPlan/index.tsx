import React from 'react';
import { IoDownload } from 'react-icons/io5';
import {
  _cs,
  isNotDefined,
} from '@togglecorp/fujs';

// import LanguageContext from '#root/languageContext';

import ButtonLikeLink from '#components/ButtonLikeLink';
import Card from '#components/Card';
import KeyFigure from '#components/KeyFigure';
import Header from '#components/Header';
import Translate from '#components/Translate';
import BlockLoading from '#components/block-loading';
import { useRequest } from '#utils/restRequest';
import { Country } from '#types';

import StrategicPrioritiesTable, { StrategicPriority } from './StrategicPrioritiesTable';
import MembershipCoordinationTable, { MembershipCoordination } from './MembershipCoordinationTable';

import styles from './styles.module.scss';

interface CountryPlanApiResponse {
  country: number;
  id: number;
  internal_plan_file: string | null;
  public_plan_file: string | null;

  // FIXME: should be is_published
  is_publish: boolean;

  // FIXME: typo
  membership_coordinationes: MembershipCoordination[];
  people_targeted: number | null;
  requested_amount: number | null;
  strategic_priorities: StrategicPriority[];
}

interface Props {
  className?: string;
  countryDetails?: Country;
}

function CountryPlan(props: Props) {
  const {
    className,
    countryDetails,
  } = props;

  const {
    pending: countryPlanPending,
    response: countryPlanResponse,
  } = useRequest<CountryPlanApiResponse>({
    skip: isNotDefined(countryDetails?.id),
    url: 'api/v2/country-plan/1',
  });

  if (!countryDetails) {
    return null;
  }

  return (
    <div className={_cs(styles.countryPlan, className)}>
      {countryPlanPending && (
        <BlockLoading />
      )}
      {!countryPlanPending && !countryPlanResponse && (
        <div className={styles.errored}>
          <Translate
            stringId="countryPlanLoadFailureMessage"
          />
        </div>
      )}
      {!countryPlanPending && countryPlanResponse && (
        <>
          <Header
            className={styles.header}
            headingContainerClassName={styles.headingContainer}
            headingClassName={styles.heading}
            heading={(
              <Translate
                stringId="countryPlanTitle"
                params={{ countryName: countryDetails.name }}
              />
            )}
            actions={undefined}
            headingSize="extraLarge"
          />
          <div className={styles.downloadLinks}>
            {countryPlanResponse.internal_plan_file && (
              <ButtonLikeLink
                external
                variant="secondary"
                to={countryPlanResponse.internal_plan_file}
                className={styles.downloadLink}
                icons={<IoDownload />}
              >
                <Translate
                  stringId="countryPlanDownloadPlanInternal"
                />
              </ButtonLikeLink>
            )}
            {countryPlanResponse.public_plan_file && (
              <ButtonLikeLink
                external
                variant="secondary"
                to={countryPlanResponse.public_plan_file}
                className={styles.downloadLink}
                icons={<IoDownload />}
              >
                <Translate
                  stringId="countryPlanDownloadPlan"
                />
              </ButtonLikeLink>
            )}
          </div>
          <div className={styles.stats}>
            <Card multiColumn>
              <KeyFigure
                value={countryPlanResponse.requested_amount}
                description={(
                  <Translate
                    stringId="countryPlanKeyFigureRequestedAmount"
                  />
                )}
              />
              <KeyFigure
                value={countryPlanResponse.people_targeted}
                description={(
                  <Translate
                    stringId="countryPlanKeyFigurePeopleTargeted"
                  />
                )}
              />
            </Card>
          </div>
          <div className={styles.tablesSection}>
            <StrategicPrioritiesTable
              className={styles.strategicPriorityTable}
              data={countryPlanResponse.strategic_priorities}
            />
            <MembershipCoordinationTable
              className={styles.coordinationTable}
              data={countryPlanResponse.membership_coordinationes}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default CountryPlan;
