module.exports = function(db, application, genericConstants, queryConstants, tokenHandler) {
  var hadronUsersCollection = db.collection('hadronUsers');
  var multer = require('multer')
  var ObjectId = require('mongodb').ObjectID;
  var uuidV4 = require('uuid/v4');
  var fs = require('fs');

  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, genericConstants.LOCAL.UPLOAD_DIR_BASE);
    },
    filename: function(req, file, cb) {
      var data = req.body;
      var now = Date.now();
      var fileName = uuidV4() + '_' + now;
      var fileDoc = {
        name: fileName,
        uploadedDate: now,
        size: file.size
      };
      db.eval(queryConstants.STORE_FILE, [data.email, data.boardId, fileDoc]);
      cb(null, fileName + '.png');
    }
  });

  var upload = multer({
    storage: storage
  });

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  application.post(genericConstants.UPLOAD_URL, upload.any(), function(req, res, next) {
    res.status(200).json({
      name: req.files[0].filename
    });
  });

  application.post(genericConstants.GET_FILES_FOR_BOARD_URL, function(req, res) {
    var data = req.body;
    var ownerEmail = data.ownerEmail;
    var boardName = data.boardName;

    db.eval(queryConstants.GET_FILES_FOR_BOARD, [ownerEmail, boardName])
      .then(function(response) {
        res.status(200).json(response);
      })
      .catch(function(error) {
        res.status(500).json({
          message: error.message
        });
      });

  });

  application.get(genericConstants.GET_FILES_FOR_USER_URL, function(req, res) {
    var email = req.email;

    db.eval(queryConstants.GET_FILES_FOR_USER, [email])
      .then(function(response) {
        res.status(200).json(response);
      })
      .catch(function(error) {
        res.status(500).json({
          message: error.message
        });
      });
  });

  application.get(genericConstants.LOGIN_URL, function(req, res) {
    var buffer = new Buffer(req.headers['authorization'], 'Base64');
    var email = buffer
      .toString();
    var randomColor = getRandomColor();
    hadronUsersCollection
      .findOne({
        email: email
      }, {
        fields: {
          email: 1
        }
      })
      .then(function(document) {
        if (!document) {
          hadronUsersCollection.insert({
            email: email,
            settings: {
              assignedUserColor: randomColor
            },
            roadMap: {
              clusters: [],
              nodes: [],
              edges: []
            },
            boards: []
          });
          res.writeHead(401, {
            'x-auth-token': tokenHandler.generateToken({
              email: email,
              assignedUserColor: randomColor
            })
          });
          res.end();
        } else {
          db.eval(queryConstants.LAST_MODIFIED_BOARD, [email])
            .then(function(response) {
              if (!response) {
                res.writeHead(401, {
                  'x-auth-token': tokenHandler.generateToken({
                    email: email,
                    assignedUserColor: randomColor
                  })
                });
                return res.end();
              }
              console.log(response.assignedUserColor);
              res.setHeader('x-auth-token', tokenHandler.generateToken({
                email: email,
                assignedUserColor: response.assignedUserColor
              }));
              res.setHeader('Content-Type', 'application/json');
              res.json(response.board);
            })
            .catch(function(err) {
              res.status(500).json({
                message: err.message
              });
            });

        }
      })
      .catch(function(err) {
        res.status(500).json({
          message: err.message
        });
      });
  });

  application.post(genericConstants.CHANGE_BOARD_NAME_URL, function(req, res) {
    var data = req.body;
    var email = req.email;
    var boardName = data.boardName;
    var newBoardName = data.newBoardName;

    db.eval(queryConstants.CHANGE_BOARD_NAME, [email, boardName, newBoardName])
      .then(function(response) {
        if (response.saved) {
          return res.status(200).json({});
        } else {
          return res.status(401).json({});
        }
      })
      .catch(function(err) {
        return res.status(500).json({
          message: err.message
        });
      });
  });

  application.post(genericConstants.CHANGE_TEXT_DOCUMENT_NAME_URL, function(req, res) {
    var data = req.body;
    var ownerEmail = data.ownerEmail;
    var boardName = data.boardName;
    var textDocumentName = data.textDocumentName;
    var newTextDocumentName = data.newTextDocumentName;


    db.eval(queryConstants.CHANGE_TEXT_DOCUMENT_NAME, [ownerEmail, boardName, textDocumentName, newTextDocumentName])
      .then(function(response) {
        if (response.saved) {
          return res.status(200).json({});
        } else {
          return res.status(401).json({});
        }
      })
      .catch(function(err) {
        return res.status(500).json({
          message: err.message
        });
      });
  });

  application.post(genericConstants.GET_BOARD_MEMBERS_URL, function(req, res) {
    var data = req.body;
    var email = req.email;
    var boardName = data.boardName;
    console.log(email, boardName);
    hadronUsersCollection
      .findOne({
        email: email
      })
      .then(function(document) {
        for (var i = 0; i < document.boards.length; i++) {
          var board = document.boards[i];
          if (board.name === boardName) {
            return res.status(200).json(board.shared);
          }
        }
        return res.status(401).json({});
      })
      .catch(function(err) {
        return res.status(500).json({
          message: err.message
        });
      })
  });

  application.post(genericConstants.CREATE_TEXT_DOCUMENT_URL, function(req, res) {
    var data = req.body;
    var email = req.email;
    var ownerEmail = data.ownerEmail;
    var boardName = data.boardName;
    var textDocumentName = data.textDocumentName;

    var roomId = uuidV4();
    db.eval(queryConstants.CREATE_TEXT_DOCUMENT, [email, ownerEmail, boardName, textDocumentName, roomId])
      .then(function(response) {
        if (response) {
          res.status(200).json(response);
        } else {
          res.status(401).json({});
        }
      })
      .catch(function(err) {
        return res.status(500).json({
          message: err.message
        });
      });
  });

  application.post(genericConstants.SAVE_TEXT_DOCUMENT_URL, function(req, res) {
    var data = req.body;
    var ownerEmail = data.ownerEmail;
    var boardName = data.boardName;
    var textDocumentName = data.textDocumentName;
    var delta = data.delta;

    db.eval(queryConstants.SAVE_TEXT_DOCUMENT, [ownerEmail, boardName, textDocumentName, delta])
      .then(function(response) {
        if (response.saved) {
          res.status(200).json({});
        } else {
          res.status(401).json({});
        }
      })
      .catch(function(err) {
        return res.status(500).json({
          message: err.message
        });
      });
  });

  application.post(genericConstants.GET_BOARD_BY_NAME_URL, function(req, res) {
    var data = req.body;
    var email = req.email;
    var ownerEmail = data.ownerEmail;
    var boardName = data.boardName;

    db.eval(queryConstants.GET_BOARD_BY_NAME, [email, ownerEmail, boardName])
      .then(function(response) {
        if (response == null) {
          return res.status(401).json({});
        } else {
          res.status(200).json(response);
        }
      })
      .catch(function(err) {
        return res.status(500).json({});
      });
  });

  application.post(genericConstants.GET_TEXT_DOCUMENT_BY_NAME_URL, function(req, res) {
    var data = req.body;
    var ownerEmail = data.ownerEmail;
    var boardName = data.boardName;
    var textDocumentName = data.textDocumentName;

    db.eval(queryConstants.GET_TEXT_DOCUMENT_BY_NAME, [ownerEmail, boardName, textDocumentName])
      .then(function(response) {
        if (response == null) {
          return res.status(401).json({});
        } else {
          res.status(200).json(response);
        }
      })
      .catch(function(err) {
        return res.status(500).json({});
      });
  });

  application.post(genericConstants.SHARE_BOARD_URL, function(req, res) {
    var data = req.body;
    var email = req.email;
    var shareEmail = data.shareEmail;
    var boardName = data.boardName;
    var roomId = uuidV4();

    db.eval(queryConstants.SHARE_BOARD, [email, shareEmail, boardName, roomId])
      .then(function(response) {
        if (response.saved) {
          res.status(200).json({});
        } else {
          res.status(401).json({});
        }
      })
      .catch(function(err) {
        res.status(500).json({
          message: err.message
        });
      });
  });

  application.post(genericConstants.CREATE_BOARD_URL, function(req, res) {
    var data = req.body;
    var name = data.name;
    var email = req.email;
    hadronUsersCollection
      .findOne({
        email: email
      }, {
        fields: {
          'boards.name': 1
        }
      })
      .then(function(document) {
        if (document) {
          var length = document.boards.length;
          for (var i = 0; i < length; i++) {
            var board = document.boards[0];
            if (board.name === name) {
              return res.status(401).json({});
            }
          }
        }
        var textDocumentName = 'change_title_' + uuidV4();
        var board = {
          id: uuidV4() + '_' + Date.now(),
          name: name,
          textDocuments: [{
            name: textDocumentName
          }],
          files: [],
          lastVisited: {
            name: textDocumentName,
            email: email
          },
          shared: {
            userIds: []
          }
        };

        hadronUsersCollection.findAndModify({
            email: email
          }, [
            ['email', 1]
          ], {
            $push: {
              'boards': board
            },
            $set: {
              'lastVisited.name': name,
              'lastVisited.email': email
            }
          }, {
            new: true,
            fields: {
              'boards.name': 1,
              'boards.textDocuments': 1
            }
          })
          .then(function(document) {
            board.textDocument = board.textDocuments[0];
            board.ownerEmail = email;
            delete board.textDocuments;
            delete board.lastVisited;
            return res.status(200).json(board);
          })
          .catch(function(err) {
            return res.status(500).json({
              message: err.message
            })
          });
      });
  });

  application.get(genericConstants.GET_LAST_MODIFIED_BOARD_URL, function(req, res) {
    var data = req.body;
    var email = req.email;
    db.eval(queryConstants.GET_LAST_MODIFIED_BOARD, [email])
      .then(function(response) {
        if (!response) {
          res.status(401).json({});
        }
        res.json(response);
      })
      .catch(function(err) {
        res.status(500).json({
          message: err.message
        });
      });
  });

  application.get(genericConstants.GET_BOARDS_LIST_URL, function(req, res) {
    var data = req.body;
    var email = req.email;
    hadronUsersCollection
      .find({
        $or: [{
          email: email
        }, {
          'boards.shared.userIds': {
            $in: [email]
          }
        }]
      }, {
        fields: {
          'email': 1,
          'boards.name': 1
        }
      })
      .toArray()
      .then(function(documents) {
        var toReturn = [];
        for (var i = 0; i < documents.length; i++) {
          for (var j = 0; j < documents[i].boards.length; j++) {
            var board = documents[i].boards[j];
            toReturn.push({
              ownerEmail: documents[i].email,
              name: board.name,
              isShared: email !== documents[i].email ||
                (email === documents[i].email &&
                  documents[i].boards[j].shared &&
                  documents[i].boards[j].shared.userIds.length !== 0)
            });
          }
        }
        res.status(200).json(toReturn);
      })
      .catch(function(err) {
        res.status(500).json({
          message: err.message
        });
      });
  });

  application.post(genericConstants.GET_TEXT_DOCUMENT_LIST_URL, function(req, res) {
    var data = req.body;
    var email = req.email;
    var boardName = data.boardName;

    hadronUsersCollection
      .find({
        $or: [{
          email: email,
          'boards.name': boardName
        }, {
          'boards.shared.userIds': {
            $in: [email]
          },
          'boards.name': boardName
        }]
      }, {
        fields: {
          'email': 1,
          'boards.textDocuments.name': 1,
          'boards.name': 1
        }
      })
      .toArray()
      .then(function(documents) {
        if (documents.length === 0) {
          return res.status(401).json({});
        }
        var toReturn = [];
        for (var i = 0; i < documents.length; i++) {
          for (var j = 0; j < documents[i].boards.length; j++) {
            var board = documents[i].boards[j];
            if (board.name === boardName) {
              for (var k = 0; k < board.textDocuments.length; k++) {
                var textDocument = board.textDocuments[k];
                toReturn.push({
                  ownerEmail: documents[i].email,
                  name: textDocument.name
                });
              }
            }
          }
        }
        res.status(200).json(toReturn);
      })
      .catch(function(err) {
        res.status(500).json({
          message: err.message
        });
      });
  });

}