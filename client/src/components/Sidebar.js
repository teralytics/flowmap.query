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
import { Card, Elevation } from '@blueprintjs/core'
import { css } from 'emotion'

const Sidebar = ({ style, children }) =>
  <div className={css({
    display: 'flex',
    width: 350,
    flex: '0 0 350px',
    position: 'relative',
    zIndex: 2,
  })}>
    <Card
      className={css({
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        left: 0,
        overflow: 'auto',
        width: '100%',
        height: '100%',
        ...style
      })}
      elevation={Elevation.THREE}
    >
      {children}
    </Card>
  </div>

export default Sidebar

