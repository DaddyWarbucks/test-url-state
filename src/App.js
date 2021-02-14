import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { parse, stringify } from 'qs';
import debounce from 'lodash/debounce';
import './App.css';

const preStyle = { background: '#fff', textAlign: 'left', color: '#000', padding: 10 }

export const useUrlState = (initialState = {}, options = {}) => {
  const { navigateMode = 'push' } = options;
  const location = useLocation();
  const history = useHistory();

  const [, update] = useState(false);

  // const initialStateRef = useRef(initialState);

  const queryFromUrl = useMemo(() => {
    return parse(location.search, {
      ignoreQueryPrefix: true,
      strictNullHandling: true
    });
  }, [location.search]);

  const state = {
    // ...initialStateRef.current,
    ...queryFromUrl
  };

  // TODO: Memoize this. Needs to have the same function reference on
  // every render, else when using thing function in a memo/callback
  // its loses its place.
  const setState = (newState) => {
    const query = typeof newState === 'function' ? newState(state) : newState;
    update((v) => !v);
    history[navigateMode]({
      hash: location.hash,
      search: query ? stringify(query) : '?'
    });
  };

  // Blah... using ref.current doesn't seem to work
  // const setState = useRef((newState) => {
  //   const query = typeof newState === 'function' ? newState(state) : newState;
  //   update((v) => !v);
  //   history[navigateMode]({
  //     hash: location.hash,
  //     search: query ? stringify(query) : '?'
  //   });
  // });

  // Blah...I don't want `state` as a dependency...that defeats the point
  // const setState = useCallback(() => (newState) => {
  //   const query = typeof newState === 'function' ? newState(state) : newState;
  //   update((v) => !v);
  //   history[navigateMode]({
  //     hash: location.hash,
  //     search: query ? stringify(query) : '?'
  //   });
  // }, []);

  // Hmmm...this has merit, but I still can't quite get it.
  // const setState = useMemo(() => (newState) => {
  //   const query = typeof newState === 'function' ? newState(state) : newState;
  //   update((v) => !v);
  //   history[navigateMode]({
  //     hash: location.hash,
  //     search: query ? stringify(query) : '?'
  //   });
  // }, []);

  return [state, setState]
};

function App() {

  const [urlState, setUrlState] = useUrlState();
  const [urlText, setUrlText] = useState('');

  const handleUrlChange = (event) => {
    setUrlText(event.target.value);
    debouncedHandleUrlChange(event.target.value)
  }

  const debouncedHandleUrlChange = useCallback(
    debounce((value) => {
      setUrlState(state => {
        return {
          ...state,
          value
        }
      })
    }, 300),
    []
  )

  const handleUrlClick = () => {
    setUrlState(state => {
      return {
        ...state,
        boom: 'Boom!'
      }
    });
  }

  const [commonState, setCommonState] = useState({ value: '' });
  const [commonText, setCommonText] = useState('');

  const handleCommonChnage = (event) => {
    setCommonText(event.target.value);
    debouncedhandleCommonChnage(event.target.value)
  }

  const debouncedhandleCommonChnage = useCallback(
    debounce((value) => {
      setCommonState(state => {
        return {
          ...state,
          value
        }
      })
    }, 300),
    []
  )

  const handleCommonClick = () => {
    setCommonState(state => {
      return {
        ...state,
        boom: 'Boom!'
      }
    });
  }


  return (
    <div className="App">
      <header className="App-header">
        <h2>Url State fields</h2>
        <input value={urlText} onChange={handleUrlChange} />
        <button onClick={handleUrlClick}>Boom! CLick me and then type again</button>
        <pre style={preStyle}>{JSON.stringify(urlState, null, 2)}</pre>

        <h2>Common State fields</h2>
        <input value={commonText} onChange={handleCommonChnage} />
        <button onClick={handleCommonClick}>No Boom!</button>
        <pre style={preStyle}>{JSON.stringify(commonState, null, 2)}</pre>
      </header>
    </div>
  );
}

export default App;
