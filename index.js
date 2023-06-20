const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle file upload
app.post('/upload', upload.single('video'), (req, res) => {
    console.log(req.file);
    const outputResolution = req.body.resolution;
    const sourcePath = req.file.path;
    const outputPath = 'converted-video.mp4';
  
    let originalResolution;
  
    ffmpeg.ffprobe(sourcePath, (err, metadata) => {
      if (err) {
        console.error('Error getting video metadata:', err);
        return res.status(500).send('An error occurred during video conversion');
      }
  
      const { width, height } = metadata.streams[0];
  
      originalResolution = `${width}x${height}`;
  
      ffmpeg(sourcePath)
        .output(outputPath)
        .size(outputResolution)
        .on('end', () => {
          console.log('Video conversion completed');
          console.log('Original Resolution:', originalResolution);
          console.log('Converted Resolution:', outputResolution);
          const date = new Date().toISOString().replace(/:/g, '-');
          const outputName = `${date}-converted-video.mp4`;
          res.download(outputPath, outputName, () => {
            console.log('Download complete');
          });
        })
        .on('error', (err) => {
          console.error('Error during conversion:', err);
          res.status(500).send('An error occurred during video conversion');
        })
        .run();
    });
  });
  

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
