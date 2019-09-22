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

import React, {Component} from 'react'
import Sidebar from './components/Sidebar'
import CategoryBarChart from './components/CategoryBarChart'
import * as R from 'ramda'
import AttrSelector from './components/AttrSelector'
import MapView from './MapView'
import { H2 } from '@blueprintjs/core'
import styled from '@emotion/styled'
import FilterStatus from './components/FilterStatus'
import Filler from './components/Filler'
import { formatDateShort } from './util/format'
import { parseLocalTime } from './util/format'


const MapContainer = styled('div')({
  display: 'flex',
  flexGrow: 1,
  order: 3,
  position: 'relative',
})

const Row = styled('div')({
  display: 'flex',
})


const SidebarContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  '& > *:not(:first-child)': {
    marginBottom: 20,
  },
})


export default class Dashboard extends Component {
  state = {
    filters: {},
    selectedLocations: [],
    bucketings: {},
    selectedAttrs: [],
  }

  handleRemoveAttr = (attrName) =>
    this.setState(prevState => {
      const { filters, selectedAttrs } = prevState
      if (R.has(attrName, filters)) {
        return {
          ...prevState,
          filters: R.omit([attrName], filters),
        }
      } else {
        return {
          ...prevState,
          selectedAttrs: R.without([attrName], selectedAttrs),
        }
      }
    })

  handleChangeAttrBucketing = (bucketingName, attrName) => {
    this.setState(prevState => ({
      ...prevState,
      bucketings: {
        ...prevState.bucketings,
        [attrName]: bucketingName,
      },
      filters: R.omit([attrName], prevState.filters),
    }))
  }

  handleSelectLocation = (id) => {
    this.setState(prevState => {
      const prev = prevState.selectedLocations
      let next
      if (prev) {
        if (R.contains(id, prev)) {
          next = R.without(id, prev)
          if (R.isEmpty(next)) next = null
        } else {
          next = [...prev, id]
        }
      } else {
        next = [id]
      }
      return ({
        ...prevState,
        selectedLocations: next,
      })
    })
  }

  handleClearFilters = (attrName) =>
    this.setState(prevState => ({
      ...prevState,
      filters: {},
    }))

  handleSelectAttr = (attrName) =>
    this.setState(prevState => ({
      ...prevState,
      selectedAttrs: [attrName, ...prevState.selectedAttrs]
    }))

  handleFilterValue = (attrName, value) =>
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        [attrName]: value === prevState.filters[attrName] ? undefined : value,
      }
    }))

  handleExport = () => {
    const {
      dataset: {
        name: datasetName,
      },
    } = this.props
    const {
      filters,
      selectedAttrs,
      bucketings,
    } = this.state
    window.open(
      `/${datasetName}/api/export?params=${encodeURI(
        JSON.stringify({ 
          filters, 
          selectedAttrs: selectedAttrs,
          bucketings,
        })
      )}`
    )
  }

  render() {
    const {
      dataset: {
        title,
        name: datasetName,
        description,
        timePeriod,
        lastUpdated,
        attributes,
      },
    } = this.props
    const {
      filters,
      selectedLocations,
      bucketings,
      selectedAttrs,
    } = this.state
    return (
      <>
        <MapContainer>
          <MapView
            datasetName={datasetName}
            filters={filters}
            selectedLocations={selectedLocations}
            bucketings={bucketings}
            onSelectLocation={this.handleSelectLocation}
          />
        </MapContainer>
        <Sidebar>
          <SidebarContent>
            <H2>{title}</H2>
            {description && <p>{description}</p>}
            <table>
              <tbody>
                {timePeriod && <tr>
                  <td>Time period:</td>
                  <td>{
                    timePeriod
                      .map(d => formatDateShort(parseLocalTime(d)))
                      .join(' - ')
                  }</td>
                </tr>}
                {lastUpdated && <tr>
                  <td>Last updated:</td>
                  <td>{formatDateShort(parseLocalTime(lastUpdated))}</td>
                </tr>}
              </tbody>
            </table>
            <Row>
              {attributes && <AttrSelector
                attributes={attributes}
                selectedAttrs={selectedAttrs}
                onSelectAttr={this.handleSelectAttr}
              />}
              <Filler />
              {/*<Popover*/}
              {/*  position={Position.BOTTOM_LEFT}*/}
              {/*  interactionKind={PopoverInteractionKind.CLICK}*/}
              {/*  target={*/}
              {/*    <Button*/}
              {/*      icon={IconNames.EXPORT}*/}
              {/*    >Export</Button>*/}
              {/*  }*/}
              {/*  content={*/}
              {/*    <ExportDetailsPopup*/}
              {/*      datasetName={datasetName}*/}
              {/*      attributes={attributes}*/}
              {/*      filters={filters}*/}
              {/*      bucketings={bucketings}*/}
              {/*      selectedAttrs={selectedAttrs}*/}
              {/*      onExport={this.handleExport}*/}
              {/*    />*/}
              {/*  } />*/}
            </Row>
            <FilterStatus
              datasetName={datasetName}
              filters={filters}
              bucketings={bucketings}
              onClear={this.handleClearFilters}
            />
            {
              selectedAttrs.map(attrName =>
                <CategoryBarChart
                  key={attrName}
                  datasetName={datasetName}
                  attribute={attributes.find(({ name }) => name === attrName)}
                  selectedBucketing={bucketings[attrName]}
                  selectedValue={filters[attrName]}
                  filters={R.omit([attrName], filters)}
                  bucketings={bucketings}
                  onClose={() => this.handleRemoveAttr(attrName)}
                  onChangeBucketing={({ name }) => this.handleChangeAttrBucketing(name, attrName)}
                  onSelectValue={value => this.handleFilterValue(attrName, value)}
                />
              )
            }
          </SidebarContent>
        </Sidebar>
      </>
    )
  }
}

