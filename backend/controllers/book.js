const Book = require('../models/Book');
const fs = require('fs');

// in controllers/book.js



exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
            res.status(200).json(books);
        }
        )
        .catch((error) => {
            res.status(400).json({ error: error });
        }
        );
};


exports.getOneBook = (req, res, next) => {
    Book.findOne({
        _id: req.params.id
    }).then(
        (book) => {
            res.status(200).json(book);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};






exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });

    book.save()
        .then(() => { res.status(201).json({ message: 'Book enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};



exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;

    console.log('Données à modifier', bookObject);

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: '403: unauthorized request' });
            }

            else {
                Book.updateOne({ _id: req.params.id, userId: req.auth.userId }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Book modifié' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => {
            res.status(400).json({ error: error });
        }
        );
};


exports.rateBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Book introuvable' })
            }

            const ratingExist = book.ratings.find(rating => rating.userId === req.auth.userId);
            if (ratingExist) {
                return res.status(403).json({ message: 'Book déjà noté' });
            }

            const ratingValue = Number(req.body.rating);
            if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
                return res.status(400).json({ message: 'Note entre 0 et 5 uniquement !' });
            }

            book.ratings.push({ userId: req.auth.userId, grade: ratingValue })

            const gradesSomme = book.ratings.reduce((acc, cur) => acc + cur.grade, 0);
            book.averageRating = gradesSomme / book.ratings.length;

            return book.save()
                .then(() => res.status(201).json(book));
        })
        .catch(error => res.status(400).json({ error }));
}

exports.getBestBooks = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(bestBooks => res.status(200).json(bestBooks))

        .catch(error => res.status(400).json({ error: error })
        );
}

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: '403: unauthorized request' });
            } else {
                const filename = book.imageUrl.split('/images')[1];
                fs.unlink(`images/${filename}`, () => {
                    book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Book supprimé !' }) })
                        .catch((error => res.status(500).json({ error })))
                })
            };
        })
}




