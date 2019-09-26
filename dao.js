const fs = require("fs");

const save = (word, meaning) => {
    let data = read();
    data[word] = meaning;
    fs.writeFileSync("./data/words.json", JSON.stringify(data));
}

const read = () => {
    const data = JSON.parse(fs.readFileSync("./data/words.json", "utf8"));
    return data;
}

const check = () => {
    let data = read();
    fs.writeFileSync("./data/words.json", JSON.stringify({}));
    return JSON.stringify(data);
}

module.exports = {
    save,
    check
}