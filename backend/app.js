const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const feedRoutes = require('./routes/feed')
const path=require('path')
const app = express()
// app.use(bodyParser.urlEncoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()) // application/json
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})
app.use('/feed', feedRoutes)
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const message = error.message;
  res.status(status).json({ message: message });
});
mongoose
  .connect(
    'mongodb+srv://sashamaksyutenko:7Alm9KVFRzXGBjzR@cluster0.jevii2h.mongodb.net/postsApp?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => {
    app.listen(8080)
  })
  .catch(err => console.log(err))