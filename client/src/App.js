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

import * as React from 'react'
import { connect } from 'react-refetch'
import { Spinner, Card, Colors } from '@blueprintjs/core'
import styled from 'react-emotion'
import Dashboard from './Dashboard'
import * as R from 'ramda'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import Logo from './components/Logo'


const Outer = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
})

const BlockingSpinner = styled(Spinner)({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignContent: 'center',
})

const NAVBAR_WIDTH = 70;
const Navbar = styled(Card)({
  display: 'flex',
  backgroundColor: Colors.DARK_GRAY4,
  flexDirection: 'column',
  height: '100%',
  width: NAVBAR_WIDTH,
  borderRadius: 0,
  zIndex: 10,
});


class App extends React.Component {

  render() {
    const { datasetsFetch: { pending, value: datasets } } = this.props
    return (
      <BrowserRouter>
        <Outer>
          <Navbar>
            <Logo fill={Colors.WHITE} />
          </Navbar>
          {pending ?
            <BlockingSpinner/>
            :
            <Switch>
              {datasets.map(dataset =>
                <Route
                  key={dataset.name}
                  path={`/${dataset.name}`}
                  render={() => <Dashboard dataset={dataset}/>}
                />
              )}
              <Route
                component={() =>
                  <Redirect
                    to={`/${R.pathOr('', [0, 'name'], datasets)}`}
                  />
                }
              />
            </Switch>
          }
        </Outer>
      </BrowserRouter>
    )
  }
}


export default connect(() => ({
   datasetsFetch: { url: `/api/datasets` }
 }))(App)
