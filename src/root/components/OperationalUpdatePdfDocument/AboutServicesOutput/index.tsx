import React from 'react';
import {
  Text,
  View,
} from '@react-pdf/renderer';

import { Strings } from '#types';
import { DrefOperationalUpdateApiFields } from '#views/DrefOperationalUpdateForm/common';
import pdfStyles from '#utils/pdf/pdfStyles';
import {
  isDefined,
  isNotDefined,
} from '@togglecorp/fujs';

interface Props {
  data: DrefOperationalUpdateApiFields;
  strings: Strings;
  isAssessmentReport: boolean,
}

function AboutServicesOutput(props: Props) {
  const {
    data,
    strings,
    isAssessmentReport,
  } = props;

  if (isNotDefined(data.human_resource)
    && isNotDefined(data.surge_personnel_deployed)
    && isNotDefined(data.logistic_capacity_of_ns)
    && isNotDefined(data.pmer)
    && isNotDefined(data.communication)
  ) {
    return null;
  }

  return (
    <View
      style={pdfStyles.section}
      wrap={false}
      break
    >
      <Text style={pdfStyles.sectionHeading}>
        {strings.drefFormSupportServices}
      </Text>
      {isDefined(data.human_resource) && (
        <View style={pdfStyles.qna}>
          <Text style={pdfStyles.textLabelSection}>
            {strings.drefFormHumanResourceDescription}
          </Text>
          <Text style={pdfStyles.answer}>
            {data.human_resource}
          </Text>
        </View>
      )}
      {isDefined(data.surge_personnel_deployed) && (
        <View style={pdfStyles.qna}>
          <Text style={pdfStyles.textLabelSection}>
            {strings.drefFormSurgePersonnelDeployed}
            {strings.drefFormSurgePersonnelDeployedDescription}
          </Text>
          <Text style={pdfStyles.answer}>
            {data.surge_personnel_deployed}
          </Text>
        </View>
      )}
      {!isAssessmentReport && (
        <>
          {isDefined(data.logistic_capacity_of_ns) && (
            <View style={pdfStyles.qna}>
              <Text style={pdfStyles.textLabelSection}>
                {strings.drefFormLogisticCapacityOfNs}
              </Text>
              <Text style={pdfStyles.answer}>
                {data.logistic_capacity_of_ns}
              </Text>
            </View>
          )}
          {isDefined(data.pmer) && (
            <View style={pdfStyles.qna}>
              <Text style={pdfStyles.textLabelSection}>
                {strings.drefFormPmer}
              </Text>
              <Text style={pdfStyles.answer}>
                {data.pmer}
              </Text>
            </View>
          )}
          {isDefined(data.communication) && (
            <View style={pdfStyles.qna}>
              <Text style={pdfStyles.textLabelSection}>
                {strings.drefFormCommunication}
              </Text>
              <Text style={pdfStyles.answer}>
                {data.communication}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

export default AboutServicesOutput;
