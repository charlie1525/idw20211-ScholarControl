const mongoose = require('mongoose');

const fecha = new Date();
const fechaJSON = fecha.toJSON();



const StSchema = new mongoose.Schema({
    fisrtName: {
        type: String,
        required: [true,"Sin nombre"],
        uppercase: true,
        maxLength:[50,"No más de 50 caracteres"]
    },
    
    lastName:{
        type: String,
        required:[true,"Sin apellidos"],
        uppercase:true,
        maxLength:[50,"Muchos caracteres"]
    },

    curp:{
        type:String,
        required: [true,"CURP necesaria"],
        uppercase:true,
        match:[/[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}/,
        "CURP invalida"]
    },

    create_date:{
        type:Date,
        required: [true,"Sin fecha"],
        default: new Date(fechaJSON).toUTCString()
    },

    controlNumber:{
        type:String,
        maxLength:[8,"Revisa el número de control"],
        required:[true,"Sin numero de control"],
        unique:true
    },

    grade:{
        type:Number,
        required:[true,"Sin calificación"],
        min :0,
        max:100
    },

    carrer:{
        type:String,
        required:[true,"Sin carrera elejida"],
        enum:{
            values:['ISC', 'IM', 'IGE', 'IC'],
            message:'Inserta una carrera valida'
        }
    }
}); //fin de la elaboracion del esquema

const studentModel = mongoose.model('Student',StSchema,'Control_Escolar');

module.exports = studentModel;