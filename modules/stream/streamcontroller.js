'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/streamVideo', function (req, res) {

  const file = path.resolve(__dirname, '../../video/movie.mp4');
  const stat = fs.statSync(file);
  const total = stat.size;
  let stream;
  if (req.headers['range']) {
    const range = req.headers.range;
    const parts = range.replace(/bytes=/, "").split("-");
    const partialstart = parts[0];
    const partialend = parts[1];

    const start = parseInt(partialstart, 10);
    const end = partialend ? parseInt(partialend, 10) : total - 1;
    const chunksize = (end - start) + 1;
    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    });

    stream = fs.createReadStream(file, { start: start, end: end })
      .on("open", function() {
        stream.pipe(res);
      })
      .on("error", function (err) {
        res.end(err);
      });

  }
  else {
    console.log('ALL: ' + total);
    res.writeHead(200, {
      'Content-Length': total,
      'Content-Type': 'video/mp4'
    });

    stream = fs.createReadStream(file, { start: start, end: end })
      .on("open", function() {
        stream.pipe(res);
      })
      .on("error", function (err) {
        res.end(err);
      });
  }

});

module.exports = router;