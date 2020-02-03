'use strict';

const fs = require('fs');
const ytdl = require('ytdl-core');
const YtNode = require('youtube-node');
const through2 = require('through2');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const Ffmpeg = require('fluent-ffmpeg');
Ffmpeg.setFfmpegPath(ffmpegPath);


const apiKey = 'AIzaSyDNzYmcCbATvwIgvnme3g_StFZ9a17CkOA';
const ytNode = new YtNode();
ytNode.setKey(apiKey);

class YouTube {
  constructor () {
    this.pageSize = 10;
  }


  getFileURL (id){
    return new Promise(function (resolve,reject) {
      ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`,(err, info) => {
        if (err) reject (err);
        let audioFormats = ytdl.filterFormats(info.formats,'audio');
        console.log('Formats with only audio: ', audioFormats);
        let foundItag;
        foundItag = audioFormats.find(obj => obj.itag === 140);
        if(!foundItag){
          let otherFormats = ytdl.filterFormats(info.formats,'audioandvideo');
          foundItag = otherFormats.find(obj => obj.mimeType==='video/mp4');
        }
        console.log('foundItag',foundItag);
        let url = { 'fileURL': foundItag.url};
        resolve(url);
      });
    });  
  }

  stream (id, res) {
    const video = ytdl(id);
    // ytdl.getInfo('https://www.youtube.com/watch?v=Dst9gZkq1a8', (err, info) => {
    //   if (err) throw err;
    //   var audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    //   console.log('Formats with only audio: ' + 'AUDIO URL',audioFormats[0].url);
    // });

    // ytdl.getInfo('https://www.youtube.com/watch?v=6OjVJyYE70k',(err,info) => {
    //   console.log('VIDEO INFO',info);
    // });
    const ffmpeg = new Ffmpeg(video);
    const stream = through2();

    try {
      ffmpeg
        // .seekInput('134.5')
        .format('mp3')
        .seek(180)
        .pipe(stream);
      return stream;
    } catch (e) {
      throw e;
    }
  }

  download ({id, file = './youtube-audio.mp3'}, callback) {
    const url = `//youtube.com/watch?v=${id}`;
    const fileWriter = fs.createWriteStream(file);

    try {
      ytdl(url).pipe(fileWriter);
    } catch (e) {
      throw e;
    }

    fileWriter.on('finish', () => {
      fileWriter.end();

      if (typeof callback === 'function') {
        callback(null, {id, file});
      }
    });

    fileWriter.on('error', (error) => {
      fileWriter.end();

      if (typeof callback === 'function') {
        callback(error, null);
      }
    });
  }

  search ({query, page}, callback) {
  
   
    if (page) {
      ytNode.addParam('pageToken', page);
    }

    ytNode.addParam('type','video');

    ytNode.search(query, this.pageSize, callback);
  }

  get (id, callback) {
    ytNode.getById(id, callback);
  }
}

module.exports = new YouTube();
