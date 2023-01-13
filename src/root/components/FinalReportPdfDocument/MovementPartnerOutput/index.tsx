import React from 'react';
import { Strings } from '#types';
import {
  Text,
  View,
} from '@react-pdf/renderer';
import { isNotDefined } from '@togglecorp/fujs';

import pdfStyles from '#utils/pdf/pdfStyles';
import { DrefFinalReportApiFields } from '#views/FinalReportForm/common';

interface Props {
  data: DrefFinalReportApiFields;
  strings: Strings;
}

function MovementPartnerOutput(props: Props) {
  const {
    data,
    strings,
  } = props;

  if (isNotDefined(data.ifrc)
    && isNotDefined(data.icrc)
    && isNotDefined(data.partner_national_society)
  ) {
    return null;
  }

  return (
    <View
      style={pdfStyles.section}
    >
      <Text
        style={pdfStyles.sectionHeading}
        minPresenceAhead={20}
      >
        {strings.finalReportMovementPartners}
      </Text>
      <View>
        <View style={pdfStyles.row}>
          <View style={pdfStyles.niHeaderCell}>
            <Text>{strings.drefFormIfrc}</Text>
          </View>
          <View style={pdfStyles.niContentCell}>
            <Text>{data.ifrc}</Text>
          </View>
        </View>
        <View style={pdfStyles.row}>
          <View style={pdfStyles.niHeaderCell}>
            <Text>{strings.drefFormIcrc}</Text>
          </View>
          <View style={pdfStyles.niContentCell}>
            <Text>{data.icrc}</Text>
          </View>
        </View>
        <View style={pdfStyles.row}>
          <View style={pdfStyles.niHeaderCell}>
            <Text>{strings.drefFormPartnerNationalSociety}</Text>
          </View>
          <View style={pdfStyles.niContentCell}>
            <Text>{data.partner_national_society}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default MovementPartnerOutput;
