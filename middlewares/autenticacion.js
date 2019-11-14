var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// =========================
// verificar token
// =========================
exports.verificaToken = function(req, resp, next) {

    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return resp.status(401).json({
                ok: false,
                msg: 'Token incorrecto.',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}

// =========================
// verificar ADMIN_ROLE
// =========================
exports.verificaADMIN_ROLE = function(req, resp, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return resp.status(401).json({
            ok: false,
            msg: 'Permiso denegado.',
            errors: { message: 'Permiso denegado.' }
        });
    };
}

// ==============================================
// verificar ADMIN_ROLE, editar usuario propio
// ==============================================
exports.verificaADMIN_ROLE_ME = function(req, resp, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return resp.status(401).json({
            ok: false,
            msg: 'Permiso denegado.',
            errors: { message: 'Permiso denegado.' }
        });
    };
}