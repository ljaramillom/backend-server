var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();
var fs = require('fs');

app.use(fileUpload());

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida.',
            errors: { message: 'Tipo de colección no válida.' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No ha seleccionado ningún archivo.',
            errors: { message: 'Debe seleccionar una imagen.' }
        });
    }

    //obtener nombre de archivo
    var archivo = req.files.imagen;
    var nombreCorto = archivo.name.split('.')
    var extensionArchivo = nombreCorto[nombreCorto.length - 1];

    // solo estas extensiones
    var extensionesValidas = ['png', 'jpg', 'git', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida.',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // mover el archivo al temporal
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo.',
                errors: err
            });
        }
        subirPorTipo(tipo, id, path, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    msg: 'Usuario no encontrado.',
                    errors: { message: 'Usuario no encontrado.' }
                });
            }


            var pathViejo = './uploads/usuarios/' + usuario.img;
            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    msg: 'Imagen de usuario actualizada correctamente.',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    msg: 'Medico no encontrado.',
                    errors: { message: 'Medico no encontrado.' }
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    msg: 'Imagen de medico actualizada correctamente.',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    msg: 'Hospital no encontrado.',
                    errors: { message: 'Hospital no encontrado.' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    msg: 'Imagen de hospital actualizada correctamente.',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;