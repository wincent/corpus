/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import ContentEditable from './ContentEditable.react';

export default class Note extends React.Component {
  static propTypes = {
    // TODO: better shape for this
    note: React.PropTypes.object,
  };

  render() {
    if (this.props.note) {
      return (
        <ContentEditable
        note={this.props.note}
        tabIndex={3}
        />
      );
    }

    return null;
  }
}
