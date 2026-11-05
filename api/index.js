const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')

const config = require('./config')
const applicationInit = require('./routes/application')
const keyboards = require('./routes/keyboards')

const app = express()

const appUrl = config.APP_BASE_URL || 'http://localhost:3000'
let origin = 'http://localhost:3000'
try {
  origin = new URL(appUrl).origin
} catch (e) {
  origin = 'http://localhost:3000'
}

app.use(bodyParser.json())
app.use(cors({ origin }))

if (config.ENABLE_DEV_SERVER) {
  applicationInit(app)
}

app.use(morgan('dev'))
app.get('/health', (req, res) => res.sendStatus(200))

app.use(keyboards)
config.ENABLE_GITHUB && app.use('/github', require('./routes/github'))

const buildDir = path.join(__dirname, '..', 'app', 'build')
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir))
  app.get('*', (req, res, next) => {
    if (req.accepts('html')) {
      res.sendFile(path.join(buildDir, 'index.html'))
    } else {
      next()
    }
  })
} else if (!config.ENABLE_DEV_SERVER) {
  applicationInit(app)
}

module.exports = app

