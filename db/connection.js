const sequelize = require("./config");
require("./asociacion");

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Base de datos Online");
    // await sequelize.sync({ alter: true });

  } catch (error) {
    console.log(error);
    console.error("Algo salio mal al conectar la BD");
  }
};

module.exports = connection;
