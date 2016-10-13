'use strict';

const boom = require('boom');
const express = require('express');
const { camelizeKeys, decamelizeKeys } = require('humps');
const jwt = require('jsonwebtoken');
const knex = require('../knex');


// eslint-disable-next-line new-cap
const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.token = decoded;
    // You can now access the payload via req.token.userId
    next();
  });
};


router.get('/favorites', authorize, (req, res, next) => {
  const { userId } = req.token;
  // const userId = req.token;

  knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .where('favorites.user_id', userId)
    .orderBy('books.title', 'ASC')
    .then((rows) => {
      const favorites = camelizeKeys(rows);

      res.send(favorites);
    })
    .catch((err) => {
      next(err);
    });
});
router.get('/favorites/:id', authorize, (req, res, next) => {
  const id = parseInt(req.query.bookId, 10);
  if (Number.isNaN(id)) {
    throw boom.create(400, 'Book ID must be an integer');
  }
  knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .where('favorites.book_id', req.query.bookId)
    .orderBy('books.title', 'ASC')
    .then((rows) => {
      const favorites = camelizeKeys(rows);

      if (favorites.length === 0) {
        throw res.send(false);
      }

      res.send(true);
    })
    .catch((err) => {
      next(err);
    });
});
// router.get('/favorites/:id', authorize, (req, res, next) => {
//   knex('favorites')
//     .innerJoin('books', 'books.id', 'favorites.book_id')
//     .where('book_id', req.query.bookId)
//     .then((favorites) => res.send(favorites.length > 0));
// });

router.post('/favorites', authorize, (req, res, next) => {
    const { bookId } = req.body;
    const favorite = { bookId, userId: req.token.userId };

    knex('favorites')
      .insert(decamelizeKeys(favorite), '*')
      .then((rows) => {
        favorite.id = rows[0].id;

        res.send(favorite);
      })
      .catch((err) => {
        next(err);
      });
});

router.delete('/favorites', authorize, (req, res, next) => {
  let favorite;
  const { bookId } = req.body;

  knex('favorites')
    .where('id', bookId)
    .first()
    .then((row) => {
      if (!row) throw boom.create(404, 'Not Found');

      favorite = camelizeKeys(row);

      return knex('favorites')
        .del()
        .where('favorites.book_id', bookId);
    })
    .then(() => {
      delete favorite.id;

      res.send(favorite);
    })
      .catch((err) => {
        next(err);
      });
});


module.exports = router;
