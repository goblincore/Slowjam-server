#!/usr/bin/env node
'use strict';

const path = require('path');
const express = require('express');
const nofavicon = require('express-no-favicons');
const youtube = require('./youtube');
const downloader = require('./downloader');
const app = express();
const cors = require('cors');
const { PORT, CLIENT_ORIGIN } = require('../config');

function listen (port, callback = () => {}) {
  app.use(nofavicon());

  app.use(
    cors({
      origin: CLIENT_ORIGIN
    })
  );

  // Parse request body
  app.use(express.json());

  app.get('/', (req, res) => {
    const file = path.resolve(__dirname, 'index.html');
    res.sendFile(file);
  });

  // app.get('/:videoId', (req, res) => {
  //   const videoId = req.params.videoId;

  //   try{
  //     youtube.getFileURL(videoId, callback => {
  //       res.json({'fileURL' : callback});
  //     });
  //     // console.log('FILE URL GET',fileURL);
     
  //   } catch (e){
  //     console.error(e);
  //     res.sendStatus(500,e);
  //   }

  //   // try {
  //   //   youtube.stream(videoId).pipe(res);
  //   // } catch (e) {
  //   //   console.error(e);
  //   //   res.sendStatus(500, e);
  //   // }
  // });


  //gets file URL given a Youtube Id
  app.get('/:videoId', (req,res,next) => {
    const {videoId} = req.params;
    youtube.getFileURL(videoId)
      .then(videoId => res.json(videoId))
      .catch(err=>next(err));
  });

  app.get('/search/:query/:page?', (req, res, next) => {
    console.log('search rquest');
    const {query, page} = req.params;
    youtube.search({query, page}, (err, data) => {
      if (err) {
        console.log(err);
        next(err);
        return;
      }
      res.json(data);
    });
  });

  app.get('/get/:id', (req, res) => {
    const id = req.params.id;

    youtube.get(id, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(500, err);
        return;
      }

      res.json(data);
    });
  });

  //Custom 404 not found handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Custom Error Handler
  app.use((err, req, res, next) => {
    if (err.status) {
      const errBody = Object.assign({}, err, { message: err.message });
      res.status(err.status).json(errBody);
    } else {
      res.status(500).json({ message: 'Something went wrong' });
    }
  });

  app.listen(port, callback);
}

module.exports = {
  listen,
  downloader,
  get: (id, callback) => youtube.get(id, callback),
  search: ({query, page}, callback) => youtube.search({query, page}, callback)
};
