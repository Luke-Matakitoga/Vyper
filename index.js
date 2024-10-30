const fs = require('node:fs')
const mime = require('mime-types')
const path = require('path');
const conf = JSON.parse(fs.readFileSync(".vyper", 'utf8'))
const express = require('express')
const app = express()
const port = conf.port

app.use(express.urlencoded({ extended: true }));

app.post("*.vyp", (req, res) => {
    handleVypPage(req, (result) => res.json(result));
});

app.get("*.vyp", (req, res) => {
    handleVypPage(req, (result) => res.json(result));
});

function handleVypPage(req, callback) {
    const filePath = path.join(__dirname, 'htdocs', evaluatePathString(req.path));

    fs.readFile(filePath, 'utf8', (err, fileContents) => {
        if (err) {
            console.error("Error reading file:", err);
            return callback({ error: 'Error reading file' });
        }

        try {
            let fileFunctionText = "";
            if (req.body) {
                fileFunctionText += `const REQUEST_POST = ${JSON.stringify(req.body)}; `;
            }
            if (req.query) {
                fileFunctionText += `const REQUEST_GET = ${JSON.stringify(req.query)}; `;
            }

            const fileFunction = new Function(`${fileFunctionText}${fileContents}`);
            const result = fileFunction();

            return callback({ result });
        } catch (err) {
            console.error("Error executing file contents:", err);
            return callback({ error: err.toString() });
        }
    });
}

app.get("*", (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var whitelistItem = conf.whitelist.find(item => item.hasOwnProperty(req.path));
    if(whitelistItem != undefined && !(whitelistItem[req.path].some(x=>x.includes(ip.toString())))){
        res.send("Unauthorised Access")
        return;
    }
    filePath = `${__dirname}/htdocs${evaluatePathString(req.path)}`
    mimeType = mime.lookup(filePath)
    fs.readFile(filePath, mimeType.startsWith("text") ? "utf8" : null , (err, data) => {
        if (err) {
          res.status(400).send('404 Page Not Found')
          return;
        }
        res.set('content-type', mimeType)
        res.sendFile(filePath)
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