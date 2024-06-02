const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
const multer = require('multer')
const graphqlHttp = require('graphql-http/lib/use/express');
const graphiql = require('express-graphiql-explorer');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
// app.use(bodyParser.urlEncoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()) // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
)
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
}
  next()
})
app.use(auth);
app.use(
  '/graphiql',
  graphiql({
      graphQlEndpoint: '/graphql',
      defaultQuery: `query MyQuery {}`,
  })
);
app.all('/graphql', (req, res) =>
  graphqlHttp.createHandler({
      schema: graphqlSchema,
      rootValue: graphqlResolver,
      context: { req, res },
      formatError(err) {
          if (!err.originalError) {
              return err;
          }
          const data = err.originalError.data;
          const message = err.message || 'An error occurred.';
          const code = err.originalError.code || 500;
          return {
              message: message,
              status: code,
              data: data,
          };
      },
  })(req, res)
);
app.use((error, req, res, next) => {
  console.log(error)
  const status = error.statusCode
  const message = error.message
  const data = error.data
  res.status(status).json({ message: message, data: data })
})
mongoose
  .connect(
    'mongodb+srv://sashamaksyutenko:7Alm9KVFRzXGBjzR@cluster0.jevii2h.mongodb.net/postsApp?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then((result) => {
    app.listen(8080)
  })
  .catch(err => console.log(err))
