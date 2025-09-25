const fs = require('fs');
const path = require('path');

module.exports = async (req, next) => {
    try {
        const image = 'images/' + Date.now() + "png";
        const pathFile = path.join(__dirname, '/../' + image);
        const imgdata = req.body.base64image;

        const base64Data = imgdata.replace(/^data:([A-Za-z-+]+);base64,/, "");

        fs.writeFileSync(pathFile, base64Data, {encoding: "base64"});

        return image;
    } catch (e) {
        console.log(e);
        next(e);
    }
};