import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  useLocation,
  useHistory,
  BrowserRouter as Router
} from "react-router-dom";
import { parse, stringify } from "qs";
import debounce from "lodash/debounce";
import "./styles.css";
const preStyle = {
  background: "#fff",
  textAlign: "left",
  color: "#000",
  padding: 10
};

// https://github.com/alibaba/hooks/blob/master/packages/use-url-state/src/index.ts
export const useUrlState = (initialState = {}, options = {}) => {
  const { navigateMode = "push" } = options;
  const location = useLocation();
  const history = useHistory();

  const queryFromUrl = useMemo(() => {
    return parse(location.search, {
      ignoreQueryPrefix: true,
      strictNullHandling: true
    });
  }, [location.search]);

  // State should be stateful instead of an inline variable
  const [state, internalSetState] = useState(() => ({
    ...initialState,
    ...queryFromUrl
  }));

  // You need a stable reference of the state and of the location hash for your setState callback.
  // We can get this by using refs that update when the deps change.
  const stateRef = useRef(state);
  const locationHashRef = useRef(location.hash);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    locationHashRef.current = location.hash;
  }, [location.hash]);

  const setState = React.useCallback(
    (newState) => {
      const state = stateRef.current;
      const hash = locationHashRef.current;
      const query = typeof newState === "function" ? newState(state) : newState;
      history[navigateMode]({
        hash,
        search: query ? stringify(query) : "?"
      });
    },
    // Since navigateMode is passed by the consuming component, it's wise
    // to keep it as a valid dependency here. The history object should be stable
    // bewtween renders, I believe. We don't need to force update here because
    // we update the query string which calls our next useEffect, which handles the update.
    [history, navigateMode]
  );

  // Update state internally when the query string changes
  useEffect(() => {
    internalSetState((prevState) => {
      // This may be too simple, e.g. you might not want to keep all
      // of the old keys from your previous state if they were removed from
      // the query string.
      return {
        ...prevState,
        ...queryFromUrl
      };
    });
  }, [queryFromUrl]);

  return [state, setState];
};

function AppInner() {
  const [urlState, setUrlState] = useUrlState();
  const [urlText, setUrlText] = useState("");
  const handleUrlChange = (event) => {
    setUrlText(event.target.value);
    debouncedHandleUrlChange(event.target.value);
  };

  const debouncedHandleUrlChange = useMemo(
    () =>
      debounce((value) => {
        setUrlState((state) => {
          return {
            ...state,
            value
          };
        });
      }, 300),
    [setUrlState]
  );

  const handleUrlClick = () => {
    setUrlState((state) => {
      return {
        ...state,
        boom: "Boom!"
      };
    });
  };
  const [commonState, setCommonState] = useState({ value: "" });
  const [commonText, setCommonText] = useState("");
  const handleCommonChnage = (event) => {
    setCommonText(event.target.value);
    debouncedhandleCommonChnage(event.target.value);
  };

  const debouncedhandleCommonChnage = useMemo(
    () =>
      debounce((value) => {
        setCommonState((state) => {
          return {
            ...state,
            value
          };
        });
      }, 300),
    []
  );

  const handleCommonClick = () => {
    setCommonState((state) => {
      return {
        ...state,
        boom: "Boom!"
      };
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Url State fields</h2>
        <input value={urlText} onChange={handleUrlChange} />
        <button onClick={handleUrlClick}>
          Boom! Click me and then type again
        </button>
        <pre style={preStyle}>{JSON.stringify(urlState, null, 2)}</pre>
        <h2>Common State fields</h2>
        <input value={commonText} onChange={handleCommonChnage} />
        <button onClick={handleCommonClick}>No Boom!</button>
        <pre style={preStyle}>{JSON.stringify(commonState, null, 2)}</pre>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
