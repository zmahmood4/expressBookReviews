const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users[username]) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users[username] = {
        username: username,
        password: password
    };

    return res.status(201).json({ message: "Customer successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    new Promise((resolve, reject) => {
        resolve(books);
    })
    .then((booksData) => {
        res.status(200).send(JSON.stringify({ books: booksData }, null, 4));
    })
    .catch((error) => {
        res.status(500).send({ message: 'Failed to fetch books', error });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    let isbn = req.params.isbn;

    try {
        const bookData = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject(new Error('Book not found'));
            }
        });
        res.status(200).json(bookData);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const bookKeys = Object.keys(books);

    let booksByAuthor = [];

    new Promise((resolve, reject) => {
        for (let key of bookKeys) {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                booksByAuthor.push(books[key]);
            }
        }

        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject(new Error("No books found by this author"));
        }
    })
    .then((booksData) => {
        res.status(200).json(booksData);
    })
    .catch((error) => {
        res.status(404).json({ message: error.message });
    });
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    const bookKeys = Object.keys(books);

    let booksByTitle = [];

    try {
        for (let key of bookKeys) {
            if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
                booksByTitle.push(books[key]);
            }
        }

        if (booksByTitle.length > 0) {
            res.status(200).json(booksByTitle);
        } else {
            throw new Error("No books found with this title");
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    let isbn = req.params.isbn;

    if (books[isbn] && books[isbn].reviews) {
        res.status(200).json(books[isbn].reviews);
    } else {
        res.status(404).json({ message: "Reviews not found for this book" });
    }
});

module.exports.general = public_users;
