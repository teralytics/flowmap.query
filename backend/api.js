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


const Router = require('koa-router')
const fetch = require('node-fetch')
const csv = require('csv-parse')
const d3dsv = require('d3-dsv')
const csvStringify = require('csv-stringify')
const send = require('koa-send')
const fs = require('fs')
const { escapeId } = require('sqlstring')
const { findAttribute } = require('./filters')

const { getFiltersQueryCondition, isValidAttr, isValidAttrFilter } = require('./filters')

const apiRouter = new Router({
  prefix: '/api',
})

const runQuery = async (query) => {
  const serverUrl = process.env[`CLICKHOUSE_URL`]
  if (!serverUrl) {
    throw new Error(`Env variable CLICKHOUSE_URL not set`)
  }
  console.log(query)
  const res = await fetch(serverUrl, {
    method: 'POST',
    body: `${query} FORMAT CSV`,
  });

  if (!res.ok) {
    console.error('query returned with non-200 status:', res.statusText);
    const text = await res.text();
    throw new Error(
      `ClickHouse server error: 
      -------
       Query
      ------- 
      ${query}
      
      ------- 
       Error
      -------
      ${text}
      `,
    );
  }

  return res;
}


apiRouter.get('/export', async ctx => {
  const {
    attributes,
    backend: { counts: { table, columns }, filter = 1 },
  } = ctx.dataset
  const { res, request: { query: { params }} } = ctx
  const { filters = {}, selectedAttrs = [] } = JSON.parse(decodeURI(params))
  if (!isValidAttrFilter(filters)) {
    throw new Error('invalid filters')
  }
  for (const attr of selectedAttrs) {
    if (!isValidAttr(attr)) throw new Error('Invalid attr')
  }
  const selectColumns = [
    columns.origin,
    columns.dest,
    ...selectedAttrs,
  ]
  const groupByColumns = [
    columns.origin,
    columns.dest,
    ...selectedAttrs,
  ]
  const filterBy = getFiltersQueryCondition(filters, attributes)

  const query = `
    SELECT 
      ${selectColumns.map(escapeId).join(',')},
      SUM(${columns.count}) cnt 
    FROM ${table} 
    WHERE
      ${filter}
      ${ filterBy ? ` AND ${filterBy}` : '' } 
    GROUP BY ${groupByColumns.map(escapeId).join(',')}
  `

  const filename = 'export.csv'
  ctx.set('Content-disposition', `attachment; filename=${filename}`);
  ctx.set('Content-type', 'text/csv');

  const csvColumns = [
    columns.origin,
    columns.dest,
    ...selectedAttrs,
    columns.count,
  ]
  const parser = csv({
    columns: csvColumns,
    delimiter: '\t',
  })

  const stringifier = csvStringify({
    header: true,
    delimiter: ',',
    columns: csvColumns,
  })

  // const transformer = new require('stream').Transform({
  //   transform(row, encoding, cb) {
  //     this.push(row)
  //     cb(null)
  //   },
  //   flush(cb) {
  //     cb()
  //   },
  //   objectMode: true,
  // })

  const response = await runQuery(query)
  const handle = (err) => {
    console.error(err.stack || err)
    ctx.status = 500
    res.end()
  }
  ctx.body = response.body
    .on('error', handle)
    .pipe(parser).on('error', handle)
    // .pipe(transformer).on('error', handle)
    .pipe(stringifier).on('error', handle)
})



apiRouter.post('/count-trips', async ctx => {
  const {
    attributes,
    backend: { counts: { table, columns }, filter = 1 },
  } = ctx.dataset
  const { request: { body: { filters }} } = ctx
  if (!isValidAttrFilter(filters)) {
    throw new Error('invalid filters')
  }
  const filterBy = getFiltersQueryCondition(filters, attributes)

  const query = `
    SELECT SUM(${columns.count}) cnt 
    FROM ${table} 
    WHERE
      ${filter}
      ${ filterBy ? ` AND ${filterBy}` : '' } 
  `
  const response = await runQuery(query)
  const tsv = await response.text()
  ctx.body = tsv
})

apiRouter.get('/count-total-trips', async ctx => {
  const { backend: { counts: { table, columns }, filter = 1 }} = ctx.dataset
  const query = `
     SELECT
       SUM(${columns.count})
     FROM ${table}
     WHERE
      ${filter}
  `
  const response = await runQuery(query)
  const tsv = await response.text()
  ctx.body = tsv
})

apiRouter.post('/flows', async ctx => {
  const {
    attributes,
    backend: { counts: { table, columns }, filter = 1 },
  } = ctx.dataset
  const { request: { body: { filters, limit }} } = ctx
  if (!isValidAttrFilter(filters)) {
    throw new Error('invalid filters')
  }
  const filterBy = getFiltersQueryCondition(filters, attributes)
  const query = `
     SELECT
       ${columns.origin}, 
       ${columns.dest}, 
       SUM(${columns.count}) As count
     FROM ${table}
     WHERE
      ${filter}
      ${ filterBy ? ` AND ${filterBy}` : '' }     
     GROUP BY
       ${columns.origin}, ${columns.dest}
     ORDER BY count DESC 
     LIMIT ${escape(limit)}
  `
  const response = await runQuery(query)
  const tsv = await response.text()
  ctx.body = tsv
})


apiRouter.post('/attr-breakdown/:attr', async ctx => {
  const {
    attributes,
    backend: { counts: { table, columns }, filter = 1 },
  } = ctx.dataset
  const { params, request: { body: { filters }} } = ctx
  const attr = findAttribute(attributes, params.attr)
  if (!attr) {
    throw new Error('invalid attr')
  }
  if (!isValidAttrFilter(filters)) {
    throw new Error('invalid filters')
  }

  const filterBy = getFiltersQueryCondition(filters, attributes)
  const query = `
    SELECT
      ${attr.expression || attr.name} AS ${attr.name},
      SUM(${columns.count}) As count
    FROM ${table}
    WHERE
      ${filter}
      ${ filterBy ? ` AND ${filterBy}` : '' }
    GROUP BY
      ${escapeId(attr.name)}
    ORDER BY   
      ${escapeId(attr.name)} ASC
  `
  const response = await runQuery(query)
  const tsv = await response.text()
  ctx.body = tsv
})

apiRouter.get('/geo/locations', async (ctx) => {
  const { backend: { locations: { file, type, columns }}} = ctx.dataset
  switch (type) {
    case 'csv': {
      ctx.body = {
        type: 'FeatureCollection',
        features: d3dsv.csvParse(
          fs.readFileSync(`./static/locations/${file}`, 'utf8'),
          row => ({
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [+row[columns.longitude], +row[columns.latitude]],
            },
            "properties": {
              id: row[columns.id],
              name: row[columns.name],
            }
          })
        )
      }
      break
    }

    default:
      await send(ctx, `./static/locations/${file}`)
  }
})


module.exports = apiRouter
