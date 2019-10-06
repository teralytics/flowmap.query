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

import { connect } from 'react-refetch'
import { csvParseRows } from 'd3-dsv'

// const cache = new Map()

const tsvConnector = (transformRow) => connect.defaults({
  // TODO: use LRU cache
  // caching forever
  // fetch: (input, init) => {
  //   const req = new Request(input, init)
  //   const key = `${req.url}:${JSON.stringify()}`
  //   const cached = cache.get(key)
  //
  //   if (cached) {
  //     return new Promise(resolve => resolve(cached.response.clone()))
  //   }
  //
  //   return fetch(req).then(response => {
  //     cache.set(key, {
  //       response: response.clone()
  //     })
  //     return response
  //   })
  // },

  handleResponse: function (response) {
    if (response.headers.get('content-length') === '0' || response.status === 204) {
      return
    }
    const text = response.text()
    if (response.status >= 200 && response.status < 300) {
      return text.then(text => new Promise((resolve, reject) => {
        let rows
        try {
          rows = csvParseRows(text, transformRow)
          resolve(rows)
        } catch (err) {
          reject(err)
        }
      }))
    } else {
      return text.then(cause => Promise.reject(new Error(cause)))
    }
  }
})

export default tsvConnector
