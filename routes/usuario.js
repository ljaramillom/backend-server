var express = require('express');

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
                        msg: 'Error DB users',
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
// crear nuevo usuario
// =========================
app.post('/', (req, resp) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: body.password,
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                msg: 'Error for create user',
                errors: err
            });
        }
        resp.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });

});

module.exports = app;