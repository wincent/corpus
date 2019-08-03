/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react';

import ContentEditable from './ContentEditable.react';

type Props = {|
  note: $FlowFixMe,
|};

export default class Note extends React.Component<Props> {
  render() {
    const {note} = this.props;
    if (note) {
      return <ContentEditable note={note} tabIndex={3} />;
    }
    return null;
  }
}
