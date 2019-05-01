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
import { css } from 'emotion'
import { getLocationId, getLocationTotalIn, getLocationTotalOut } from '../globals'
import { Colors } from '@blueprintjs/core'
import { formatCount } from '../util/format'

const styles = {
  outer: css({
    padding: 0,
    fontSize: 12,
    color: Colors.LIGHT_GRAY5,
  }),
  title: css({
    textAlign: 'left',
    fontWeight: 'bold',
    paddingBottom: 5,
  }),
  label: css({
    textAlign: 'left',
    color: Colors.GRAY3,
    padding: 0,
  }),
  value: css({
    textAlign: 'right',
    minWidth: 50,
    padding: 0,
    // padding: '1px 0px 1px 5px',
  }),
}


const LocationTooltip = ({ location }) =>
  <div className={styles.outer}>
    <div className={styles.title}>{getLocationId(location)}</div>
    <table cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          <td className={styles.label}>Incoming</td>
          <td className={styles.value}>{formatCount(getLocationTotalIn(location))}</td>
        </tr>
        <tr>
          <td className={styles.label}>Outgoing</td>
          <td className={styles.value}>{formatCount(getLocationTotalOut(location))}</td>
        </tr>
      </tbody>
    </table>
  </div>


export default LocationTooltip
