const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multerPost = require('../middleware/multer-post');


const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestBooks);
router.get('/:id', bookCtrl.getOneBook);


router.post('/', auth, multerPost, bookCtrl.createBook);
router.post('/:id/rating', auth, multerPost, bookCtrl.rateBook)
router.put('/:id', auth, multerPost, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);


module.exports = router;