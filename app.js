let express = require('express')
let bodyParser = require('body-parser')

let path = require('path')
let busboy = require('connect-busboy')

// New express application
let app = express()
app.set('view engine', 'ejs')

let port = process.env.PORT || 3000
// let environment = process.env.NODE_ENV || 'development'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

// Tell express where to find static assets
app.use(express.static(path.join(__dirname, 'public')))

app.use(busboy())

app.use((req, res, next) => {
  req.getUrl = () => {
    return req.protocol + '://' + req.get('host') + req.originalUrl
  }
  return next()
})

// Routes
let todo = require('./routes/todo')

app.get('/', todo.index)
app.get('/create', todo.new)
app.post('/create', todo.create)
app.get('/all', todo.all)
app.get('/details/:id?', todo.details)
app.get('/remove/:id?', todo.remove)
app.post('/state', todo.state)
app.post('/details/:id/comment?', todo.addComment)
app.get('/stats', todo.stats)
app.get('*', todo.not_found)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
