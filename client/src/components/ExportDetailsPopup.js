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
import tsvConnector from '../util/tsvConnector'
import { H4, Button, Spinner, Colors } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as R from 'ramda'
import { css } from 'emotion'
import styled from '@emotion/styled'
import { formatPercentage} from '../util/format'
import Filler from './Filler'
import { formatCount } from '../util/format'

const Outer = styled('div')({
  '& th': {
    verticalAlign: 'top',
    textAlign: 'left',
    padding: '3px 0',
  },
})


const Loading = () =>
  <div className={css({
    display: 'flex',
  })}>
    <Filler/>
    <Spinner size={15} />
  </div>


const valueCellStyle = css({
  minWidth: 65,
  textAlign: 'right',
  lineHeight: 1.5,
})

const ExportDetailsPopup = ({
  lossFetch,
  countsFetch,
  filters,
  attributes,
  selectedAttrs,
  onExport,
}) => {
  return (
    <Outer>
      <table className={css({
        color: Colors.GRAY3,
        fontSize: 12,
        padding: 10,
      })}>
        <tbody>
        <tr>
          <td colSpan={2} style={{ textAlign: 'center' }}>
            <H4>Export trips data</H4>
          </td>
        </tr>
        <tr>
          <th>Attributes:</th>
          <td className={valueCellStyle}>
            {R.isEmpty(selectedAttrs) ? 'None' :
              selectedAttrs.map(attrName =>
                <div key={attrName}>
                  { R.pathOr(
                      attrName,
                      ['label'],
                      attributes.find(({ name }) => name === attrName)
                    )
                  }
                </div>
              )
            }
          </td>
        </tr>
        <tr>
          <th>Number of trips:</th>
          <td className={valueCellStyle}>
            {countsFetch.pending ?
              <Loading/>
              :
              <span>{formatCount(R.path(['value', 0, 'tripCount'], countsFetch))}</span>
            }
          </td>
        </tr>
        <tr>
          <th>Number of rows:</th>
          <td className={valueCellStyle}>
            {countsFetch.pending ?
              <Loading/>
              :
              <span>{formatCount(R.path(['value', 0, 'numRecords'], countsFetch))}</span>
            }
          </td>
        </tr>
        <tr>
          <td colSpan={2} className={css({
            textAlign: 'center',
            paddingTop: 15,
          })}>
            <Button
              icon={IconNames.DOWNLOAD}
              onClick={onExport}
            >Download CSV</Button>
          </td>
        </tr>
        </tbody>
      </table>
    </Outer>
  )
}

export default R.compose(
  tsvConnector(
    ([ numRecords, tripCount ]) => ({
      numRecords, tripCount
    })
  )(({ datasetName, filters, selectedAttrs }) => ({
    countsFetch: {
      url: `/${datasetName}/api/count-export-records`,
      method: 'POST',
      body: JSON.stringify({ filters, selectedAttrs }),
    }
  })),
  tsvConnector(
    ([ loss ]) => ({
      loss,
    })
  )(({ datasetName, filters, selectedAttrs }) => ({
    lossFetch: {
      url: `/${datasetName}/api/k-loss`,
      method: 'POST',
      body: JSON.stringify({ filters, selectedAttrs }),
    }
  })),
)(ExportDetailsPopup)
