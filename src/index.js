#!/usr/bin/env node
const path = require('path')
const express = require('express')
const nofavicon = require('express-no-favicons')
const youtube = require('./youtube')
const downloader = require('./downloader')
const app = express()

function listen (port, callback = () => {}) {
  app.use(nofavicon())

  app.get('/', (req, res) => {
    const file = path.resolve(__dirname, 'index.html')
    res.sendFile(file)
  })

  app.get('/:videoId', (req, res) => {
    const videoId = req.params.videoId

    try {
      youtube.stream(videoId).pipe(res)
    } catch (e) {
      console.error(e)
      res.sendStatus(500, e)
    }
  })

  app.get('/search/:query/:page?', (req, res) => {
    const {query, page} = req.params
    youtube.search(query, page, (err, data) => {
      if (err) {
        console.log(err)
        res.sendStatus(500, err)
        return
      }

      res.json(data)
    })
  })

  app.get('/get/:videoId', (req, res) => {
    const videoId = req.params.videoId

    youtube.get(videoId, (err, data) => {
      if (err) {
        console.log(err)
        res.sendStatus(500, err)
        return
      }

      res.json(data)
    })
  })

  app.use((req, res) => {
    res.sendStatus(404)
  })

  app.listen(port, callback)
}

module.exports = {listen, downloader}