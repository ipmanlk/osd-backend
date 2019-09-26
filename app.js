const express = require("express");
const translate = require('@vitalets/google-translate-api');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/translate', (req, res) => {
    const word = req.query.word || "unknown"
    const lang = (/^[A-Za-z][\sA-Za-z0-9.\'-]*$/.test(word)) ? "si" : "en";
    translate(word, { to: lang }).then(resp => {
        res.set('Cache-Control', 'public, max-age=15811200, s-maxage=31536000');
        res.send(JSON.stringify([resp.text]));
    }).catch(err => {
        console.error(err);
    });
});

app.post('/translate', (req, res) => {
    const text = req.body.text;
    const lang = (/^[A-Za-z][\sA-Za-z0-9.\'-]*$/.test(text)) ? "si" : "en";
    translate(text, { to: lang }).then(resp => {
        res.send(JSON.stringify([resp.text]));
    }).catch(err => {
        console.error(err);
    });
});

app.get('/datamuse', async (req, res) => {
    const word = req.query.word || null;
    if (word !== null) {
        let defs = await request(`http://api.datamuse.com/words?max=1&md=d&sp=${word}`);
        let syns = await request(`https://api.datamuse.com/words?max=10&rel_syn=${word}`);
        defs = defs[0];
        res.send(JSON.stringify({ defs, syns }));
    } else {
        res.send("-1");
    }
});

const request = (url) => {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => response.json())
            .then(json => {
                resolve(json);
            })
            .catch(error => {
                reject(error);
            })
    });
}

app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
})

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;