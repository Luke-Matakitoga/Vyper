const fs = require('node:fs')
const mime = require('mime-types')
const sass = require('sass');
const express = require('express')
const app = express()
const port = 80

app.get("*", (req, res) => {
    path = `${__dirname}/htdocs${evaluatePathString(req.path)}`
    mimeType = mime.lookup(path)
    console.log(`${path} ${mimeType}`)
    fs.readFile(path, mimeType.startsWith("text") ? "utf8" : null , (err, data) => {
        if (err) {
          res.status(400).send('404 Page Not Found')
          return;
        }
        res.set('content-type', mimeType)
        res.sendFile(path)
      });
    
})



function evaluatePathString(path){
    if(path.includes('.')){
        return path
    }else{
        return `${path}/index.html`
    }
}

app.listen(port, () => {
    console.log(`Vyper running on port ${port}`)
})