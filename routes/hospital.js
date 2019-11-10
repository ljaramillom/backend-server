var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// =============================
// obtener todos los hospitales
// =============================
app.get('/', (req, resp, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        // .skip(desde)
        // .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        msg: 'Error en DB hospitales.',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    resp.status(200).json({
                        ok: true,
                        hospitales,
                        total: conteo
                    });
                });
            });
});



// =========================
// actualizar hospital
// =========================
app.put('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                msg: 'Error al buscar hospital.',
                errors: err
            });
        }

        if (!hospital) {
            return resp.status(400).json({
                ok: false,
                msg: 'El hospital con el ID ' + id + 'no existe.',
                errors: { message: 'No existe un hospital con ese ID.' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar hospital.',
                    errors: err
                });
            }

            resp.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });
    });
});

// =========================
// eliminar hospital por id
// =========================
app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                msg: 'Error al eliminar hospital.',
                errors: err
            });
        }

        if (!hospitalEliminado) {
            return resp.status(400).json({
                ok: false,
                msg: 'No existe un hospital con ese ID.',
                errors: { message: 'No existe un hospital con ese ID.' }
            });
        }

        resp.status(200).json({
            ok: true,
            hospital: hospitalEliminado
        });
    });
});

// ==========================================
// Obtener hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

// =========================
// crear nuevo hospital
// =========================
app.post('/', mdAutenticacion.verificaToken, (req, resp) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return resp.status(400).json({
                ok: false,
                msg: 'Error al crear hospital.',
                errors: err
            });
        }

        resp.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });

});

module.exports = app;