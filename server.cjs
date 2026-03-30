const express = require('express')
const app = express()
const port = 5137;

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
})

app.use(express.static('./'))

app.listen(port, () => {
  console.log(`Endgame listening on port ${port}`)
})
