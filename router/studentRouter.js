const router = require('express').Router();
const mongoose = require('mongoose');
var status = require('http-status');


var Menores = 0;
var Mayores = 0;
var Foraneos = 0;
var Hombres = 0;
var Mujeres = 0;
var Aprovados = 0;
var Reprovados = 0;
var Total_Docs = 0;


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Control_Escolar', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const Student = require('../models/studentModel');

Student.countDocuments({}, (err, count) => {
    if (err) {
        console.log("No se pudo realizar el conteo de los documentos");
        return;
    }
    Total_Docs = count;
});

Aprovados = Student.where({
    grade: {
        $gt: 70
    }
}).countDocuments();

Reprovados = Total_Docs - Aprovados;


module.exports = () => {
    router.post('/', (req, res) => { // Inicio del método para isertar
        student = req.body;
        Student.create(student)
            .then((data) => {
                res.json({
                    code: status.OK,
                    msg: "Estudiante agregado correctamente!!",
                    data: data
                }) // retornado sin haber inconvenientes
            })
            .catch((err) =>
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Hubo un error en la incesción",
                    err: err.name,
                    details: err.message
                }) //Final del JSON del error

            ); // fin de lo que retorna si hay errores

    }); //Final del método POST

    router.get('/', (req, res) => { //Inicio de la busqueda general
        Student.find({}).then(
                (students) => {
                    res.json({
                        ccode: status.OK,
                        msj: 'Busqueda exitosa',
                        data: students
                    }) //       JSON
                }
            ) //                THEN
            .catch(
                (err) => {
                    res.status(status.BAD_REQUEST).json({
                        code: status.BAD_REQUEST,
                        msg: 'Error en la consulta',
                        err: err.name,
                        detail: err.message
                    }) // JSON
                }
            ) // CATCH
    }); // fin del metodo get

    router.get('/:NoControl', (req, res) => { //Inicio de busqueda por numero de control
        const control = req.params.NoControl;
        Student.findOne({
                controlNumber: control
            }).then(
                (student) => {
                    if (student) {
                        res.json({
                            code: status.OK,
                            msj: 'Busqueda exitosa',
                            data: student
                        }) //        JSON
                    } else {
                        res.json({
                            code: status.NOT_FOUND,
                            msj: 'El elemento no se encontro'
                        }) //        JSON ELSE
                    } //             ELSE
                }
            ) //                     THEN
            .catch(
                (err) => {
                    res.status(status.BAD_REQUEST).json({
                        code: status.BAD_REQUEST,
                        msj: 'Error en la consulta',
                        err: err.name,
                        detail: err.message
                    }) //        JSON
                }
            ) //                CATCH
    });

    router.put('/:NoControl', (req, res) => { //Inicio de el update
        const noCtl = req.params.NoControl;
        let bodyUpdate = req.body;
        Student.findOneAndUpdate(noCtl, bodyUpdate, {
            new: true
        }, (err) => {
            if (err) {
                res.json({
                    code: status.NOT_MODIFIED,
                    msj: 'No se ha podido actualizar el alumno',
                    err: err.name,
                    details: err.message
                }) //        JSON ERROR
            } //             IF ERROR
            res.json({
                code: status.OK,
                msj: 'Actualziación exitosa'
            }) //            JSON NOT ERROR
        }) //                FIND AND UPDATE
    });

    router.delete('/:NoControl', (req, res) => { //Inicio de la eliminacion por número de control
        const NoControl = req.params.NoControl

        Student.findOne({
            controlNumber: NoControl
        }, (err, student) => {
            if (err)
                res.json({
                    code: status.NOT_FOUND,
                    msj: 'Error al dar de baja al estudiante',
                    err: err.name,
                    details: err.message
                }) //            JSON OF THE ERROR

            student.remove((err) => {
                if (err) {
                    res.json({
                        code: status.NOT_FOUND,
                        msj: 'Error al dar de baja al estudiante',
                        err: err.name,
                        details: err.message
                    }) //         JSON  ERROR
                } //             Error IF

                res.json({
                    code: status.OK,
                    msj: 'Se ha dado de baja correctamente al estudiante'
                }) //                JSON W NO ERROR
            }) //                END OF REMOVE
        });
    });

    router.get("/Stat/Grades", (req, res) => {
        Student.aggregate([{$match: {"grade":{$gte:70}}},{$group:{_id : "$carrer",count: { $sum: 1 },}}])
            .then((aprobado) => {
                Student.aggregate([{$match: {"grade":{$lt:70}}},{$group:{_id : "$carrer",count: { $sum: 1 },}}])
                .then((reprobado) => {
                    res.json({
                    code: status.OK,
                    msg: "Estudiantes aprovados y reprobados",
                    reprobados: reprobado,
                    aprobados: aprobado
                    }); //                  JSON del reprobrados
              })
              .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                  code: status.BAD_REQUEST,
                  msg: "Error en la petición",
                  err: err.name,
                  detail: err.message,
                });
              });
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            });
          });
     
    });

    router.get("/Stat/Foraneos", (req, res) => {
        Student.aggregate([{$match: {"curp" : /^. ./}},{$group:{_id : "$carrer",count: { $sum: 1 },}}])
            .then((local) => {
                Student.aggregate([{$match:{"curp" : /^.{11}(?!(nt|NT)).*/}},{$group:{_id : "$carrer",count: { $sum: 1 },}}])
                    .then((foraneo) => {
                        res.json({
                            code: status.OK,
                            msg: "Estudiantes de otros estados",
                            locales: local,
                            foraneos: foraneo
                        });
                    })
                    .catch((err) => {
                        res.status(status.BAD_REQUEST).json({
                            code: status.BAD_REQUEST,
                            msg: "Error en la petición",
                            err: err.name,
                            detail: err.message
                        });
                    });
            })
            .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                    code: status.BAD_REQUEST,
                    msg: "Error en la petición",
                    err: err.name,
                    detail: err.message,
                });
            });
     
        }
    );

    router.get("/Stat/Sex", (req, res) => {
        Student.aggregate([{$match: {"curp" : /^.{10}[H]./}},{$group:{_id : "$carrer",count: { $sum: 1 },}}])
            .then((hombre) => {
                Student.aggregate([{$match: {"curp" : /^.{10}[M].*/}},{$group:{_id : "$carrer",count: { $sum: 1 },}}])
                .then((mujer) => {
                    res.json({
                    code: status.OK,
                    msg: "Sexo de estudiantes por carrera",
                    mujeres: mujer,
                    hombres: hombre
                    }); //                  JSON del reprobrados
              })
              .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                  code: status.BAD_REQUEST,
                  msg: "Error en la petición",
                  err: err.name,
                  detail: err.message,
                });
              });
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            });
          });
     
    });

    router.get("/Stat/Age", (req, res) => {
        Student.aggregate([{$match: {"curp" : /^.{4}[8-9]./}},{$group:{_id : "$carrer",count: { $sum: 1 },}}])
            .then((mayor) => {
                Student.aggregate([{$match: {"curp" : /^.{4}[0-7].*/}},{$group:{_id : "$carrer",count: { $sum: 1 },}}])
                .then((menor) => {
                    res.json({
                    code: status.OK,
                    msg: "Mayoria de edad de los estudiantes por carrera",
                    Menores: menor,
                    Mayores: mayor
                    }); //                  JSON del reprobrados
              })
              .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                  code: status.BAD_REQUEST,
                  msg: "Error en la petición",
                  err: err.name,
                  detail: err.message,
                });
              });
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            });
          });
     
    });

    return router;
}; // fin de la exportación del modulo