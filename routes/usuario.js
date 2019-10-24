var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// =========================
// obtener todos los usuario
// =========================
app.get('/', (req, resp, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        msg: 'Error en DB usuarios.',
                        errors: err
                    });
                }

                resp.status(200).json({
                    ok: true,
                    usuarios
                });
            });
});



// =========================
// actualizar usuario
// =========================
app.put('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                msg: 'Error al buscar usuario.',
                errors: err
            });
        }

        if (!usuario) {
            return resp.status(400).json({
                ok: false,
                msg: 'El usuario con el ID ' + id + 'no existe.',
                errors: { message: 'No existe un usuario con ese ID.' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar usuario.',
                    errors: err
                });
            }

            usuarioGuardado.password = ':'

            resp.status(200).json({
                ok: true,
                id
            });

        });
    });
});

// =========================
// eliminar usuario por id
// =========================
app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioEliminado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                msg: 'Error al eliminar usuario.',
                errors: err
            });
        }

        if (!usuarioEliminado) {
            return resp.status(400).json({
                ok: false,
                msg: 'No existe un usuario con ese ID.',
                errors: { message: 'No existe un usuario con ese ID.' }
            });
        }

        resp.status(200).json({
            ok: true,
            usuario: usuarioEliminado
        });
    });
});

// =========================
// crear nuevo usuario
// =========================
app.post('/', mdAutenticacion.verificaToken, (req, resp) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return resp.status(400).json({
                ok: false,
                msg: 'Error al crear usuario.',
                errors: err
            });
        }

        resp.status(200).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});

module.exports = app;