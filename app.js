const path = (require('path'));
const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const app = express();
const httpServer = require('http').createServer(app);
const io = require('./socket').init(httpServer);

const { mongoDBConnection } = require('./configuration/env');
const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');
const statusRoutes = require('./routes/status');
const { upload } = require('./middleware/upload-middleware');

app.use(bodyParser.json()); // * To jest sposób używania body parsera w aplikacji opartej na json
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/files/images', express.static(path.join(__dirname, 'public', 'files', 'images')));
app.use(upload.single('image'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', postRoutes);
app.use('/auth', authRoutes);
app.use(statusRoutes);

app.use((error, req, res) => {
  const statusCode = error.statusCode || 500;
  const data = error.data || [];
  const { message } = error;
  res.status(statusCode).json({
    message, data,
  });
});

mongoose.connect(mongoDBConnection).then(() => {
  io.on('connection', () => { console.log('a connection'); });
  httpServer.listen(8080);
}).catch((err) => console.log(err));
