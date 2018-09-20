#!/usr/bin/env node
'use strict';

const path = require('path');
const express = require('express');
const nofavicon = require('express-no-favicons');
const youtube = require('./youtube');
const downloader = require('./downloader');
const app = express();
const cors = require('cors');
const { PORT, CLIENT_ORIGIN } = require('./config');

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

  app.get('/:videoId', (req, res) => {
    const videoId = req.params.videoId;

    try{
      youtube.getFileURL(videoId, callback => {

        res.json({'fileURL' : callback});

      });
      // console.log('FILE URL GET',fileURL);
     
    } catch (e){
      console.error(e);
      res.sendStatus(500,e);
    }

    // try {
    //   youtube.stream(videoId).pipe(res);
    // } catch (e) {
    //   console.error(e);
    //   res.sendStatus(500, e);
    // }
  });



  app.get('/get/:fileURL', (req,res) => {
    const videoID = req.params.fileURL;
    try{
      res.json(youtube.getFileURL(videoID));
    } catch (e){
      console.error(e);
      res.sendStatus(500,e);
    }
  });

  app.get('/search/:query/:page?', (req, res) => {
    console.log('search rquest');
    const {query, page} = req.params;
    youtube.search({query, page}, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(500, err);
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

  app.use((req, res) => {
    res.sendStatus(404);
  });

  app.listen(port, callback);
}

module.exports = {
  listen,
  downloader,
  get: (id, callback) => youtube.get(id, callback),
  search: ({query, page}, callback) => youtube.search({query, page}, callback)
};
