var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

var mdAutenticacion = require('../middlewares/autenticacion');

// google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
var CLIENT_ID = require('../config/config').CLIENT_ID;

// renovar token
app.get('/renuevaToken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); // expira en 4 horas

    res.status(200).json({
        ok: true,
        usuario: req.usuario,
        token
    });
});

// autenticacion con Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
app.post('/google', async(req, resp) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return resp.status(403).json({
                ok: false,
                msg: 'Token no válido',
            });
        });


    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                msg: 'Error al buscar usuarios.',
                errors: err
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return resp.status(400).json({
                    ok: false,
                    msg: 'Debe usar su autenticación normal.',
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // expira en 4 horas

                resp.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            // usuario no existe, debe ser creado
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // expira en 4 horas

                resp.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuario.role)
                });
            });
        }
    });

    // return resp.status(200).json({
    //     ok: true,
    //     msg: 'ok',
    //     googleUser
    // });
});



// autenticacion normal
app.post('/', (req, resp) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                msg: 'Error al buscar usuarios.',
                errors: err
            });
        }

        if (!usuarioDB) {
            return resp.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas, por favor intente nuevamente.',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return resp.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas, por favor intente nuevamente.',
                errors: err
            });
        }

        // crear token
        usuarioDB.password = ':';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // expira en 4 horas

        resp.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token,
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });
    });
});

function obtenerMenu(ROLE) {
    menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJs', url: '/rxjs' },
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Médicos', url: '/medicos' },
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }
    return menu;
}

module.exports = app;