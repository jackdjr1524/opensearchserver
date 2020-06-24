/*
 * Copyright 2017-2020 Emmanuel Keller / Jaeksoft
 *  <p>
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  <p>
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  <p>
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {hot} from 'react-hot-loader/root';
import React, {useState, useEffect} from 'react';
import Status from './Status';
import JsonEditor from './JsonEditor';
import {fetchJson} from "./fetchJson.js"

const QueryView = (props) => {

  const [error, setError] = useState(null);
  const [task, setTask] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [resultJson, setResultJson] = useState('');

  useEffect(() => {
  }, [props.selectedIndex])

  return (
    <div className="border p-0 mt-1 ml-1 bg-light rounded flex-fill d-flex flex-column">
      <div className="bg-light text-secondary p-1">QUERYING&nbsp;
        <Status task={task} error={error} spinning={spinning}/>
      </div>
      <div className="d-flex flex-fill">
        <div className="w-50 flex-fill">
          <JsonEditor value={props.queryJson}
                      setValue={props.setQueryJson}
          />
        </div>
        <div className="w-50 flex-fill">
          <JsonEditor value={resultJson}/>
        </div>
      </div>
      <form className="form-inline pr-1 pb-1">
        <div className="pt-1 pl-1">
          <button className="btn btn-primary" onClick={() => doQuery()}>QUERY</button>
        </div>
      </form>
    </div>
  )

  function parseJson() {
    const notParsed = props.queryJson;
    if (notParsed === null || notParsed === '') {
      throw 'Nothing to index';
    }
    return JSON.parse(notParsed);
  }

  function doQuery() {
    if (props.selectedIndex == null || props.selectedIndex === '') {
      setError('Please select an index.');
      return;
    }
    setError(null);
    setTask('Parsing...');
    setSpinning(true);
    var parsedJson = null;
    try {
      parsedJson = parseJson();
      props.setQueryJson(JSON.stringify(parsedJson, undefined, 2))
    } catch (err) {
      setError(err.message);
      setTask(null);
      setSpinning(false);
      return;
    }

    setTask('Querying...');
    fetchJson(
      props.oss + '/ws/indexes/' + props.selectedIndex + '/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedJson)
      },
      json => {
        setResultJson(JSON.stringify(json, undefined, 2));
        setTask("Query successful.");
        setSpinning(false);
      },
      error => {
        setResultJson('');
        setError(error);
        setTask(null);
        setSpinning(false);
      });
  }

}

export default hot(QueryView);
