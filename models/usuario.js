var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: 'El rol ingresado <{VALUE}> no es válido.'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es obligatorio.'] },
    email: { type: String, unique: true, required: [true, 'El correo es obligatorio.'] },
    password: { type: String, required: [true, 'La contraseña es obligatoria.'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
});

usuarioSchema.plugin(uniqueValidator, { message: 'El {PATH} registrado ya existe.' })

module.exports = mongoose.model('Usuario', usuarioSchema);