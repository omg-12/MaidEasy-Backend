const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors');

connectToMongo();       // function for establishing connectivity to MongoDB
const app = express() // express object
const port = 5000 || process.env.PORT;
app.set("view engine","ejs");

//A middleWare to  use req.body
app.use(express.json());
app.use(
  cors({
    origin:"*"
  })
)
app.use(express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/public'));
app.get("/",(req,res)=>{
  res.render("index");
})

// Available routes
app.use('/api/user', require('./routes/user.js'));
app.use('/api/worker', require('./routes/worker.js'));
app.use('/api/admin', require('./routes/admin.js'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

