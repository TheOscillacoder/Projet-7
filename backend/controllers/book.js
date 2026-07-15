const Book = require('../models/Book');
const fs = require('fs');


exports.getAllBooks = (req, res, next) => {
    // Affichage livres page d'accueil
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
    // Recherche dans la base de données le livre correspondant à l'id passé en paramètre d'URL
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
    // Parsing des données book issues du corps de requête en un objet exploitable pour modifier les champs du livre
    const bookObject = JSON.parse(req.body.book);
    // Suppression des propriétés _id et user_Id pour empêcher leur modification 
    delete bookObject._id;
    delete bookObject._userId;
    // Création du livre avec ses champs de données issus du modèle, son utilisateur qui l'a créé et l'URL de l'image du fichier
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
    // Si fichier image dans la requête, => parsing des données book issues du corps de requête en un objet exploitable pour modifier les champs du livre
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    // Suppression des propriétés _id et user_Id pour empêcher leur modification 
    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
        // Si utilisateur ne correspond pas à l'utilisateur qui a créé le livre, requête refusée
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: '403: unauthorized request' });
            }

            else {
                // Update des données database + champs du livre à modifier 
                Book.updateOne({
                    // Conditions : Id passé en paramètre d'URL + l'utilisateur qui a créé le livre 
                    _id: req.params.id,
                    userId: req.auth.userId
                },
                    // Données à mettre à jour et conservation de l'id original du livre
                    {
                        ...bookObject,
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({ message: 'Livre modifié avec succès !' }))
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
        // Recherche dans la base de données du livre correspondant à l'id passé en paramètre d'URL
        .then((book) => {
            // Si pas d'id correspondant, requête 404
            if (!book) {
                return res.status(404).json({ message: 'Livre introuvable !' })
            }
            // Recherche si note par l'utilisateur actuel déjà présente
            const ratingExist = book.ratings.find(rating => rating.userId === req.auth.userId);
            if (ratingExist) {
                return res.status(403).json({ message: 'Livre déjà noté !' });
            }
            // Définition notation sous forme de nombre + entre 0 et 5
            const ratingValue = Number(req.body.rating);
            if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
                return res.status(400).json({ message: 'Note entre 0 et 5 uniquement !' });
            }
            // Ajout au tableau de notation de l'utilisateur la note et sa valeur
            book.ratings.push({ userId: req.auth.userId, grade: ratingValue })

            // Calcul de la somme des notes :

            // Dans la méthode reduce(), acc (pour "accumulateur") est la valeur qui accumule le résultat au fur et à mesure des itérations,
            // Et cur (pour "courant") est l’élément actuel du tableau

            // acc commence à 0
            // À chaque élément cur de book.ratings, on ajoute cur.grade à acc.
            // À la fin, acc contient la somme des notes (grade) de tous les éléments.
            const gradesSomme = book.ratings.reduce((acc, cur) => acc + cur.grade, 0);
            // Calcul de la moyenne de la somme des notes + arrondi au dixième
            book.averageRating = Math.round((gradesSomme / book.ratings.length) * 10) / 10;

            return book.save()
                .then(() => res.status(201).json(book));
        })
        .catch(error => res.status(400).json({ error }));
}

exports.getBestBooks = (req, res, next) => {
    Book.find()
        // Tri note moyenne par ordre decroissant
        .sort({ averageRating: -1 })
        // Limiter les résultats à 3 livres
        .limit(3)
        .then(bestBooks => res.status(200).json(bestBooks))

        .catch(error => res.status(400).json({ error: error })
        );
}

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })

        .then(book => {
            // Si utilisateur ne correspond pas à l'utilisateur qui a créé le livre, requête refusée
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: '403: unauthorized request' });
            } else {
                // Suppression du fichier image du dossier
                const filename = book.imageUrl.split('/images')[1];
                fs.unlink(`images/${filename}`, () => {
                    book.deleteOne({ _id: req.params.id })
                        // Suppression du livre de la base de donnée
                        .then(() => { res.status(200).json({ message: 'Livre supprimé avec succès !' }) })
                        .catch((error => res.status(500).json({ error })))
                })
            };
        })
}




