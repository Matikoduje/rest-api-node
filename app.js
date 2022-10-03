const path = (require('path'));
const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const app = express();
const httpServer = require('http').createServer(app);

const { graphqlHTTP } = require('express-graphql');
const { mongoDBConnection } = require('./configuration/env');
const { upload } = require('./middleware/upload-middleware');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const { isAuthenticated } = require('./middleware/auth-middleware');
const { clearImage } = require('./helpers/clear-image');

app.use(bodyParser.json()); // * To jest sposób używania body parsera w aplikacji opartej na json
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/files/images', express.static(path.join(__dirname, 'public', 'files', 'images')));
app.use(upload.single('image'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  return next();
});

app.use(isAuthenticated);

app.put('/post-image', (req, res) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated!');
  }
  if (!req.file) {
    return res.status(200).json({ message: 'No file provided!' });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  const imageUrl = req.file.path.replace(/\\/g, '/');

  return res
    .status(201)
    .json({ message: 'File stored.', filePath: imageUrl });
});

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  customFormatErrorFn(err) {
    if (!err.originalError) {
      return err;
    }
    const { data } = err.originalError;
    const message = err.message || 'An error occurred.';
    const code = err.originalError.code || 500;
    return { message, status: code, data };
  },
}));

mongoose.connect(mongoDBConnection).then(() => {
  httpServer.listen(8080);
}).catch((err) => console.log(err));
