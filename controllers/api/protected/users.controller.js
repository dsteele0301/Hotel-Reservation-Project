var userService = require('services/users.service');

var osprey = require('osprey');
var join = require('path').join;
var raml = join(__dirname, '../', 'api.raml');
var handler = osprey.server(raml);
var router = osprey.Router({ ramlUriParameters: handler.ramlUriParameters }); 

console.log(raml);

// Routes to receive HTTP requests
router.get('/', getUsers);
router.get('/current', getCurrentUser);
router.get('/invoice/{_id}', getInvoice);
router.get('/email/{email}', getUserByEmail);
router.get('/{_id}', getUserByID);
router.put('/{_id}', editUser);
router.delete('/{_id}', deleteUser);

module.exports = router;

function getUsers(req, res) {
    userService.getUsers()
    .then( function (users) {
        if (users) res.send(users);
        else res.status(404)
    })
    .catch( function(err) {
        res.status(400).send(err);
    });
}

function getInvoice(req, res) {
    res.status(501).send('Service not defined');
}

function getUserByID(req, res) {
    res.status(501).send('Service not defined');
}

function getCurrentUser(req, res) {

    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function editUser(req, res) {
    
    var userId = req.user.sub;
    if (req.params._id !== userId && req.user.group < 1) {
        res.status(401).send('You can only update your own account');
    } else {
        userService.edit(req.params._id, req.body)
            .then(function () {
                if (req.user.group > 1 && req.body.group != null) {
                    userService.editGroup(req.params._id, req.body.group)
                    .then(function () {
                        res.sendStatus(200);
                    })
                    .catch(function (err) {
                        res.status(400).send(err);
                    })
                } else res.sendStatus(200);
            })
            .catch(function (err) {
                res.status(400).send(err);
            });
    }
}

function deleteUser(req, res) {

    var userId = req.user.sub;
    if (req.params._id !== userId && req.user.group < 1) {
        res.status(401).send('You can only delete your own account');
    } else {
        userService.delete(req.params._id)
            .then(function () {
                res.sendStatus(200);
            })
            .catch(function (err) {
                res.status(400).send(err);
            });
    }
}

function getUserByEmail(req, res) {
    userService.getUserByEmail(req.params.email)
        .then(function (user) {
            if (!user) res.status(404).send("No user found with " + req.params.email);
            else res.send(user);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}