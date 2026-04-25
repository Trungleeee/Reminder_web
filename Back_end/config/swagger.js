const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Reminder System API",
      version: "1.0.0",
      description: "API documentation for Reminder App",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
 apis: ["./routes/*.js", "./routes/**/*.js"],
};

module.exports = swaggerJsdoc(options);