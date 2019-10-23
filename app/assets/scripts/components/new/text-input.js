'use strict';
import React from 'react';
import _cs from 'classnames';
import { FaramInputElement } from '@togglecorp/faram';

import RawInput from './raw-input';

class TextInput extends React.PureComponent {
  render() {
    return (
      <RawInput
        {...this.props}
        type='text'
      />
    );
  }
}

export default FaramInputElement(TextInput);
