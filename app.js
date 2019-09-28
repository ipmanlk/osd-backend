const express = require("express");
const translate = require('@vitalets/google-translate-api');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/translate', (req, res) => {
    const word = req.query.word || null;
    if (word !== null) {
        const lang = getLang(word);
        translate(word, { to: lang }).then(resp => {
            if (resp.text && (getLang(resp.text) !== lang)) {
                res.set('Cache-Control', 'public, max-age=15811200, s-maxage=31536000');
                res.send(JSON.stringify([resp.text]));
            } else {
                res.send(JSON.stringify({ "error": "-1" }));
            }

        }).catch(err => {
            console.error(err);
        });
    } else {
        res.send("-1");
    }
});

app.post('/translate', (req, res) => {
    const text = req.body.text || null;
    if (text !== null) {
        const lang = getLang(text);
        translate(text, { to: lang }).then(resp => {
            if (resp.text && (getLang(resp.text) !== lang)) {
                res.send(JSON.stringify([resp.text]));
            } else {
                res.send(JSON.stringify({ "error": "-1" }));
            }

        }).catch(err => {
            console.error(err);
        });
    } else {
        res.send(JSON.stringify({ "error": "-1" }));
    }
});

app.get('/datamuse', async (req, res) => {
    const word = req.query.word || null;
    if (word !== null) {
        let defs = await request(`http://api.datamuse.com/words?max=1&md=d&sp=${word}`);
        let syns = await request(`https://api.datamuse.com/words?max=10&rel_syn=${word}`);
        defs = defs[0];
        res.set('Cache-Control', 'public, max-age=15811200, s-maxage=31536000');
        res.send(JSON.stringify({ defs, syns }));
    } else {
        res.send(JSON.stringify({ "error": "-1" }));
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

const getLang = (text) => {
    const lang = (/^[A-Za-z][\sA-Za-z0-9.\'-]*$/.test(text)) ? "si" : "en";
    return lang;
}

app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;