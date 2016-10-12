'use strict';

const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE
router.get('/books', (_req, res, next) => {
  knex('books')
    .orderBy('title')
    .then((rows) => {
      const books = camelizeKeys(rows);

      res.send(books);
    })
    .catch((err) => {
      next(err);
    });
});
router.get('/books/:id', (req, res, next) => {
    knex('books')
    .where('id', req.params.id)
    .first()
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Not Found');
      }

      const book = camelizeKeys(row);

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/books', (req, res, next) => {
  const {author, coverUrl, createdAt, description, genre, id, title, updatedAt } = req.body;

  // if (!title || !title.trim()) {
  //   return next(boom.create(400, 'Title must not be blank'));
  // }
  //
  // if (!artist || !artist.trim()) {
  //   return next(boom.create(400, 'Artist must not be blank'));
  // }
  //
  // if (!Number.isInteger(likes)) {
  //   return next(boom.create(400, 'Likes must be an integer'));
  // }

  const insertBook = { author, coverUrl, createdAt, description, genre, id, title, updatedAt};

  knex('books')
    .insert(decamelizeKeys(insertBook), '*')
    .then((rows) => {
      const book = camelizeKeys(rows[0]);

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/books/:id', (req, res, next) => {
  knex('books')
    .where('id', req.params.id)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Not Found');
      }

      const { author, coverUrl, createdAt, description, genre, id, title, updatedAt} = req.body;
      const updateBook = {};

      if (author) {
        updateBook.author = author;
      }

      if (coverUrl) {
        updateBook.coverUrl = coverUrl;
      }
      if (createdAt) {
        updateBook.createdAt = createdAt;
      }

      if (description) {
        updateBook.description = description;
      }
      if (genre) {
        updateBook.genre = genre;
      }

      if (id) {
        updateBook.id= id;
      }
      if (title) {
        updateBook.title = title;
      }

      if (updatedAt) {
        updateBook.updatedAt = updatedAt;
      }
      return knex('books')
        .update(decamelizeKeys(updateBook), '*')
        .where('id', req.params.id);
    })
    .then((rows) => {
      const book = camelizeKeys(rows[0]);

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/books/:id', (req, res, next) => {
  let book;

  knex('books')
    .where('id', req.params.id)
    .first()
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Not Found');
      }

      book = camelizeKeys(row);

      return knex('books')
        .del()
        .where('id', req.params.id);
    })
    .then(() => {
      delete book.id;

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});
module.exports = router;
