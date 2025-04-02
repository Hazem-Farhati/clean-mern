const { check, validationResult } = require("express-validator");

//register rules
exports.registerRules = () => [
  check("username", "username is required").notEmpty(),
  check("nom", "nom is required").notEmpty(),
  check("prenom", "prenom is required").notEmpty(),
  check("email", "email is required").notEmpty(),
  check("email", "check email again").isEmail(),
 // check("role", "role is required").notEmpty(),
  check("password", "password is required").isLength({
    min: 6,
    max: 20,
  }),
];


//login rules
exports.loginRules = () => 
  [
    check("email", "email is required").notEmpty(),
    check("email", "check email again").isEmail(),
    check("password", "password must be more than 6").isLength({
      min: 6,
      max: 20,
    }),
  ];


exports.Validation = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            errors: errors.array().map((el) => ({
                msg: el.msg,
            })),
        });
    }
    next();
};