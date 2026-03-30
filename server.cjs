const express = require('express')
const app = express()
const port = 5137;

app.get('/', (req, res) => {
  res.send('go to website.xyz/index.html please')
})

app.use(express.static('/'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
