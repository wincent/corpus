/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';

import TitleBar from './TitleBar';

const {useEffect, useRef, useState} = React;

interface State {
  foreground: boolean;
  showError: boolean;
  value: string;
}

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

function getStyles({foreground, showError, value}: State) {
  const rightInputPadding = 0 + (value ? 18 : 0) + (showError ? 18 : 0) + 'px';

  return {
    attention: {
      color: '#fe2310',
      fontSize: '13px',
      position: 'absolute',
      right: value ? '24px' : '10px',
      top: '33px',
    } as React.CSSProperties,
    cancel: {
      color: '#bfbfbf',
      fontSize: '13px',
      position: 'absolute',
      right: '10px',
      top: '33px',
    } as React.CSSProperties,
    icon: {
      color: '#565656',
      fontSize: '14px',
      left: '10px',
      position: 'absolute',
      top: '33px',
    } as React.CSSProperties,
    input: {
      WebkitAppRegion: 'no-drag',
      WebkitAppearance: 'none', // only with this can we override padding
      border: '1px solid #a0a0a0',
      borderRadius: '4px',
      fontFamily: 'Helvetica Neue',
      lineHeight: '16px',
      padding: `2px ${rightInputPadding} 1px 20px`,
      width: '100%',
    } as React.CSSProperties,
    root: {
      WebkitAppRegion: 'drag',
      WebkitUserSelect: 'none',
      background: foreground ? 'linear-gradient(#d3d3d3, #d0d0d0)' : '#f6f6f6',
      borderBottom: '1px solid #d1d1d1',
      flexGrow: 0,
      padding: '30px 8px 14px',
      position: 'relative',
      minHeight: '60px',
    } as React.CSSProperties,
  };
}

export default function OmniBar() {
  const inputRef = useRef<HTMLInputElement>(null!);
  const shouldFocus = useRef(true);

  const [foreground, setForeground] = useState(true);
  const [value, setValue] = useState('some phony value for now');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (shouldFocus.current) {
      inputRef.current.focus();
      shouldFocus.current = false;
    }
  });

  const styles = getStyles({
    foreground,
    value,
    showError,
  });

  // TODO: use real implementation; not sure how we are going to manage data
  // yet.
  const selectionSize = 1;

  const iconClass = selectionSize === 1 ? 'icon-pencil' : 'icon-search';

  function onAttentionClick() {}

  function onCancelClick() {
    shouldFocus.current = true;
    setValue('');
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
        value={value}
      />
      {showError ? (
        <span
          className="icon-attention"
          onClick={onAttentionClick}
          style={styles.attention}
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
