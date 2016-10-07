// Dependencies
let fs = require('fs')
let path = require('path')
let uid = require('uid2')
let jsonfile = require('jsonfile')

// Constants
let IMAGE_DIR_PUBLIC = path.join(__dirname, '/../public/images/')
let IMAGE_TYPES = ['image/jpeg', 'image/png']
let DATA_FILE = path.join(__dirname, '/../data.json')

let todosJson = []

module.exports.index = (req, res, next) => {
  res.render('index')
}

module.exports.new = (req, res, next) => {
  let errors = []

  res.render('create', {
    errors: errors,
    title: '',
    description: ''
  })
}

module.exports.create = (req, res, next) => {
  let writeStream
  let errors = []

  let todoData = {
    id: uid(22),
    title: '',
    description: '',
    state: 'Pending',
    fileName: '',
    mimeType: '',
    filePath: '',
    createdon: new Date().toISOString(),
    comments: []
  }

  req.pipe(req.busboy)

  req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (filename) {
      let targetPath
      let targetDir
      let targetName
            // get the extenstion of the file
      let extension = filename.split(/[. ]+/).pop()

            // check to see if we support the file type
      if (IMAGE_TYPES.indexOf(mimetype) === -1) {
        errors.push(`Supported image formats: jpeg, jpg, jpe, png.`)
        return file.resume()
      }

            // create a new name for the image
      targetName = uid(22) + '.' + extension
      targetDir = Math.round(new Date().getTime() / 1000).toString()

            // Distribute the files through folders
      try {
        fs.mkdirSync(IMAGE_DIR_PUBLIC + targetDir)
      } catch (err) {
        errors.push(`Error creating dir: ${err.message}`)
        return file.resume()
      }

            // determine the new path to save the image
      targetPath = path.join(IMAGE_DIR_PUBLIC + targetDir + '/', targetName)

      todoData.fileName = filename
      todoData.mimeType = mimetype
      todoData.filePath = targetDir + '/' + targetName

      writeStream = fs.createWriteStream(targetPath)
      file.pipe(writeStream)
      writeStream.on('close', () => {
                // res.redirect('back');
      })
    } else {
      file.resume()
    }
  })

  req.busboy.on('field', (key, value, keyTruncated, valueTruncated) => {
    if (key === 'title') {
      todoData.title = value
    }
    if (key === 'description') {
      todoData.description = value
    }
  })

  req.busboy.on('finish', () => {
    if (!todoData.title) {
      errors.push('Title is missing.')
    }
    if (!todoData.description) {
      errors.push('Description is missing.')
    }

    if (errors.length) {
      res.render('create', {
        errors: errors,
        title: todoData.title,
        description: todoData.description
      })
    } else {
      todosJson.push(todoData)

            // Store the TODOs in JSON file used as a database
      jsonfile.writeFile(DATA_FILE, todosJson, {spaces: 2}, (err) => {
        if (err) {
          return res.status(500).send(`Error creating data dir: ${err.message}`)
        }
        res.redirect('/all')
      })
    }
  })
}

module.exports.all = (req, res, next) => {
  getTodoList((todoList) => {
    res.render('all', {
      todoList: todoList
    })
  })
}

module.exports.details = (req, res, next) => {
  let id = req.params.id || ''

  getTodoDetails(id, (todoItem) => {
    if (todoItem !== null) {
      let data = todoItem
      data.errors = []
      res.render('details', data)
    } else {
      res.render('not_found', {
        title: 'That TODO doesn\'t exist yet.'
      })
    }
  })
}

// Interchangeable states
module.exports.state = (req, res, next) => {
  let id = req.body.todoId || ''

  getTodoDetails(id, (todoItem, idx, todosJson) => {
    if (todoItem !== null) {
      todosJson[idx].state = (todoItem.state === 'Pending') ? 'Done' : 'Pending'

      jsonfile.writeFile(DATA_FILE, todosJson, {spaces: 2}, (err) => {
        if (err) {
          return res.status(500).send(`Error updating TODO's state: ${err.message}`)
        }
        res.redirect('/details/' + id)
      })
    } else {
      res.render('not_found', {
        title: 'That TODO doesn\'t exist yet.'
      })
    }
  })
}

module.exports.remove = (req, res, next) => {
  let id = req.params.id || ''

  getTodoDetails(id, (todoItem, idx, todosJson) => {
    if (todoItem !== null) {
      if (todoItem.filePath !== '') {
        let srcImage = IMAGE_DIR_PUBLIC + todoItem.filePath
        let destDir = todoItem.filePath.toString().split('/')[0]

                // delete public image and its public directory
        fs.unlinkSync(srcImage)
        fs.rmdirSync(IMAGE_DIR_PUBLIC + destDir)
      }

      todosJson.splice(idx, 1)

      jsonfile.writeFile(DATA_FILE, todosJson, {spaces: 2}, (err) => {
        if (err) {
          return res.status(500).send(`Error deleting TODO: ${err.message}`)
        }
        res.redirect('/all')
      })
    } else {
      res.render('not_found', {
        title: 'That TODO doesn\'t exist yet.'
      })
    }
  })
}

module.exports.addComment = (req, res, next) => {
  let id = req.params.id || ''

  getTodoDetails(id, (todoItem, idx, todosJson) => {
    if (todoItem !== null) {
      let errors = []

      let comment = req.body.comment || ''
      if (!comment) {
        errors.push('Your comment is required.')
        let data = todoItem
        data.errors = errors
        return res.render('details', data)
      }

      todosJson[idx].comments.push({
        comment: comment,
        createdon: new Date().toISOString()
      })

      jsonfile.writeFile(DATA_FILE, todosJson, {spaces: 2}, (err) => {
        if (err) {
          return res.status(500).send(`Error adding TODO's comment: ${err.message}`)
        }
        res.redirect('/details/' + id)
      })
    } else {
      res.render('not_found', {
        title: 'That TODO doesn\'t exist yet.'
      })
    }
  })
}

module.exports.stats = (req, res, next) => {
  let authHeader = req.headers['My-Authorization'] || req.headers['my-authorization'] || false

  if (!authHeader || authHeader !== 'Admin') {
    return res.status(404).send(`Access Denied.`)
  }

  getTodoList((todoList) => {
    let totalComments = 0
    if (todoList.length) {
      for (let i = 0; i < todoList.length; i++) {
        totalComments += todoList[i].comments.length || 0
      }
    }

    res.status(200).send({
      totalTODOs: todoList.length,
      totalComments: totalComments
    })
  })
}

// Not found
module.exports.not_found = function (req, res) {
  res.render('not_found', {
    title: 'That TODO doesn\'t exist yet.'
  })
}

// Utility functions
function getTodoList (cb) {
  jsonfile.readFile(DATA_FILE, (err, obj) => {
    if (err) {
      jsonfile.writeFileSync(DATA_FILE, todosJson, {spaces: 2})
    } else {
      todosJson = obj
    }

    let pendingList = []
    let doneList = []
    let todoList = []

    if (todosJson.length) {
      for (let i = 0; i < todosJson.length; i++) {
        if (todosJson[i].state === 'Pending') {
          pendingList.push(todosJson[i])
        } else {
          doneList.push(todosJson[i])
        }
      }

      for (let i = 0; i < pendingList.length; i++) {
        todoList.push(pendingList[i])
      }

      for (let i = 0; i < doneList.length; i++) {
        todoList.push(doneList[i])
      }
    }

    if (typeof cb === 'function') {
      return cb(todoList)
    }
  })
}

function getTodoDetails (id, cb) {
  jsonfile.readFile(DATA_FILE, (err, obj) => {
    if (err) {
      jsonfile.writeFileSync(DATA_FILE, todosJson, {spaces: 2})
    } else {
      todosJson = obj
    }

    let todoItem = null
    let idx = -1

    if (todosJson.length) {
      for (let i = 0; i < todosJson.length; i++) {
        if (todosJson[i].id === id) {
          if (typeof cb === 'function') {
            todoItem = todosJson[i]
            idx = i
            break
          }
        }
      }
    }

    if (typeof cb === 'function') {
      return cb(todoItem, idx, todosJson)
    }
  })
}

