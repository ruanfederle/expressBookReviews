const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ------------------ REGISTER USER ------------------
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Add new user
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully!" });
});

// ------------------ GET ALL BOOKS ------------------
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// ------------------ GET BOOK BY ISBN ------------------
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// ------------------ GET BOOKS BY AUTHOR ------------------
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();

  const filtered_books = Object.values(books).filter(
    book => book.author.toLowerCase() === author
  );

  return res.status(200).json(filtered_books);
});

// ------------------ GET BOOKS BY TITLE ------------------
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const filtered_books = Object.values(books).filter(
    book => book.title.toLowerCase() === title
  );

  return res.status(200).json(filtered_books);
});

// ------------------ GET BOOK REVIEW ------------------
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
