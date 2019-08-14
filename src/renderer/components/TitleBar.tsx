/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';
import ConfigContext from '../contexts/ConfigContext';
import simplifyPath from '../util/simplifyPath';

const {useContext} = React;

const styles: Styles = {
  root: {
    WebkitAppRegion: 'drag',
    WebkitUserSelect: 'none',
    bottom: '36px',
    cursor: 'default',
    fontFamily: 'BlinkMacSystemFont',
    fontSize: '14px',
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
  },
};

function TitleBar() {
  const config = useContext(ConfigContext);

  const notesDirectory = config ? config.notesDirectory : null;
  const title = notesDirectory ? simplifyPath(notesDirectory) : 'Corpus';

  return (
    <div style={styles.root}>
      <span>{title}</span>
    </div>
  );
}

export default React.memo(TitleBar);
