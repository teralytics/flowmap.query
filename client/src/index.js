/*
 *    Copyright 2019 Teralytics
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { injectGlobal } from 'emotion'

import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/select/lib/css/blueprint-select.css'
import 'mapbox-gl/dist/mapbox-gl.css'

injectGlobal({
  '#root': {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  body: {
    width: '100%',
    height: '100%',
    margin: 0,
  },
})

ReactDOM.render(<App/>, document.getElementById('root'))
