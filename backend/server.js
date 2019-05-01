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

const Koa = require('koa')
const Router = require('koa-router')
const json = require('koa-json')
const app = new Koa()
const serve = require('koa-static')
const send = require('koa-send')
const bodyParser = require('koa-bodyparser')
const yaml = require('js-yaml')
const fs = require('fs')
const apiRouter = require('./api')
const compress = require('koa-compress')

const { datasets } = yaml.safeLoad(fs.readFileSync(`${__dirname}/../datasets.yml`, 'utf8'))
const findConfig = dataset => datasets.find(d => d.name === dataset)

const port = process.env.NODE_PORT || 3001

const router = new Router()
router.get('/health', async ctx => {
  ctx.status = 200
})

router.get('/api/datasets', async ctx => {
  ctx.body = datasets.map(
    // Remove the backend-specific part from the config
    ({ backend, ...rest }) => rest
  )
})


const datasetRouter = new Router()
datasetRouter.param('dataset', async (id, ctx, next) => {
  ctx.dataset = findConfig(id)
  if (ctx.dataset) {
    return next()
  } else {
    if (ctx.headers['x-requested-with'] === 'XMLHttpRequest') {
      ctx.body = {
        status: "Forbidden",
        message: "The specified dataset cannot be accessed by the user.",
      }
      return ctx.status = 403
    } else {
      return ctx.redirect('/')
    }
  }
})

datasetRouter.use('/:dataset', apiRouter.routes(), apiRouter.allowedMethods())



app.use(compress())
app.use(json())
app.use(bodyParser())
if (process.env.NODE_ENV === 'production') {
  app.use(serve('client/build'))
  router.get('/:dataset', async (ctx) => {
    await send(ctx, `./client/build/index.html`)
  })
}
app.use(router.routes())
app.use(datasetRouter.routes())
app.listen(port, () => console.log(`Listening on port ${port}`))
