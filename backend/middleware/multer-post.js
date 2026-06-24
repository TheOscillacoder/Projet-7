const multer = require('multer');

// dictionnaire
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        //suppr des espaces du nom du fichier pour requête serveur
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];

        //fichier créé avec ces éléments name, date, '.' et pour finir extension
        callback(null, name + Date.now() + '.' + extension);
    }
})

module.exports = multer({ storage }).single('image');