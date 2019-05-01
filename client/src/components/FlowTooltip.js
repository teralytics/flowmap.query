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
import { getFlowDestId, getFlowMagnitude, getFlowOriginId } from '../globals'
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
    whiteSpace: 'nowrap',
  }),
  value: css({
    textAlign: 'right',
    minWidth: 50,
    padding: '1px 0px 1px 5px',
  }),
}


const FlowTooltip = ({ flow }) =>
  <div className={styles.outer}>
    <div className={styles.title}>
      {getFlowOriginId(flow)} → {getFlowDestId(flow)}{' '}
    </div>
    <table cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          <td className={styles.label}>Number of trips</td>
          <td className={styles.value}>{formatCount(getFlowMagnitude(flow))}</td>
        </tr>
      </tbody>
    </table>
  </div>


export default FlowTooltip
