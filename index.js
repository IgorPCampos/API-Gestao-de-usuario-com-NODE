const express = require("express")
const app = express()
const bodyParser = require('body-parser')
const router = require("./routes/routes")
require("dotenv").config();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use("/", router);


const port = process.env.PORT;
app.listen(port, () => {
    console.log("Servidor rodando")
});