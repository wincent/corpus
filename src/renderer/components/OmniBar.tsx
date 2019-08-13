/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import {remote} from 'electron';
import * as React from 'react';
import NotesDispatch from '../contexts/NotesDispatch';
import useStyles from '../hooks/useStyles';
import * as log from '../util/log';
import TitleBar from './TitleBar';

const {useContext, useEffect, useRef, useState} = React;

const LOG_LEVEL = {
  DEBUG: 0,
  INFORMATIONAL: 1,
  WARNING: 2,
  ERROR: 3,
};

function getMaxLength() {
  const systemNameMax = 1000; // TODO really implement

  // Save room for file extension and to disambiguate up to 1,000
  // duplicate titles.
  const maxLength = systemNameMax - '.md'.length - '.000'.length;

  return Math.max(
    0, // Sanity: never return a negative number.
    maxLength,
  );
}

export default function OmniBar() {
  const dispatch = useContext(NotesDispatch);

  const inputRef = useRef<HTMLInputElement>(null!);
  const shouldFocus = useRef(true);

  const [foreground, setForeground] = useState(true);
  const [value, setValue] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const styles = useStyles<
    'cancel' | 'error' | 'icon' | 'input' | 'root' | 'warning'
  >(() => {
    const rightInputPadding =
      0 + (value ? 18 : 0) + (showError || showWarning ? 18 : 0) + 'px';

    return {
      cancel: {
        color: '#bfbfbf',
        fontSize: '13px',
        position: 'absolute',
        right: '10px',
        top: '33px',
      },

      error: {
        color: '#fe2310',
        fontSize: '13px',
        position: 'absolute',
        right: value ? '24px' : '10px',
        top: '33px',
      },

      icon: {
        color: '#565656',
        fontSize: '14px',
        left: '10px',
        position: 'absolute',
        top: '33px',
      },

      input: {
        WebkitAppRegion: 'no-drag',
        WebkitAppearance: 'none', // only with this can we override padding
        border: '1px solid #a0a0a0',
        borderRadius: '4px',
        fontFamily: 'Helvetica Neue',
        lineHeight: '16px',
        padding: `2px ${rightInputPadding} 1px 20px`,
        width: '100%',
      },

      root: {
        WebkitAppRegion: 'drag',
        WebkitUserSelect: 'none',
        background: foreground
          ? 'linear-gradient(#d3d3d3, #d0d0d0)'
          : '#f6f6f6',
        borderBottom: '1px solid #d1d1d1',
        flexGrow: 0,
        padding: '30px 8px 14px',
        position: 'relative',
        minHeight: '60px',
      },

      warning: {
        color: '#f3bc2b',
        fontSize: '13px',
        position: 'absolute',
        right: value ? '24px' : '10px',
        top: '33px',
      },
    };
  });

  useEffect(() => {
    remote
      .getCurrentWindow()
      .webContents.on('console-message', (_event: Event, level: number) => {
        if (level >= LOG_LEVEL.ERROR) {
          setShowError(true);
        } else if (level >= LOG_LEVEL.WARNING) {
          setShowWarning(true);
        }
      });
  }, []);

  useEffect(() => {
    if (shouldFocus.current) {
      inputRef.current.focus();
      shouldFocus.current = false;
    }
  });

  // TODO: use real implementation; not sure how we are going to manage data
  // yet.
  const selectionSize = 1;

  const iconClass = selectionSize === 1 ? 'icon-pencil' : 'icon-search';

  function onAttentionClick() {
    remote.getCurrentWindow().webContents.openDevTools();

    setShowError(false);
    setShowWarning(false);
  }

  function onCancelClick() {
    shouldFocus.current = true;
    dispatch({
      query: null,
      type: 'filter',
    });

    // TODO figure out whether to manage this as local state or pull it from
    // context (probably want textual value from context and things like text
    // selection to be local state)
    setValue(null);
  }

  const onChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    setValue(event.currentTarget.value);
  };

  function onFocus() {}

  function onKeyDown() {}

  return (
    <div style={styles.root}>
      <TitleBar />
      <span className={iconClass} style={styles.icon} />
      <input
        maxLength={getMaxLength()}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder="Search or Create"
        ref={inputRef}
        style={styles.input}
        tabIndex={1}
        type="text"
        value={value ? value : ''}
      />
      {showError ? (
        <span
          className="icon-attention"
          onClick={onAttentionClick}
          style={styles.error}
        />
      ) : showWarning ? (
        <span
          className="icon-attention"
          onClick={onAttentionClick}
          style={styles.warning}
        />
      ) : null}
      {value ? (
        <span
          className="icon-cancel-circled"
          onClick={onCancelClick}
          style={styles.cancel}
        />
      ) : null}
    </div>
  );
}
