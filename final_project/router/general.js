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

// ------------------ GET ALL BOOKS (async/await) ------------------
public_users.get('/', async (req, res) => {
  try {
    const data = await new Promise((resolve) => resolve(books));
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// ------------------ GET BOOK BY ISBN (async/await) ------------------
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
      const isbn = req.params.isbn;
  
      const book = await new Promise((resolve, reject) => {
        const found = books[isbn];
        if (found) resolve(found);
        else reject("Book not found");
      });
  
      return res.status(200).json(book);
    } catch (err) {
      return res.status(404).json({ message: err });
    }
  });

// ------------------ GET BOOKS BY AUTHOR (async/await) ------------------
public_users.get('/author/:author', async (req, res) => {
    try {
      const author = req.params.author.toLowerCase();
  
      const filtered_books = await new Promise((resolve, reject) => {
        const result = Object.values(books).filter(
          book => book.author.toLowerCase() === author
        );
        if (result.length > 0) resolve(result);
        else reject("No books found for this author");
      });
  
      return res.status(200).json(filtered_books);
    } catch (err) {
      return res.status(404).json({ message: err });
    }
  });

// ------------------ GET BOOKS BY TITLE (async/await) ------------------
public_users.get('/title/:title', async (req, res) => {
    try {
      const title = req.params.title.toLowerCase();
  
      const filtered_books = await new Promise((resolve, reject) => {
        const result = Object.values(books).filter(
          book => book.title.toLowerCase() === title
        );
        if (result.length > 0) resolve(result);
        else reject("No books found for this title");
      });
  
      return res.status(200).json(filtered_books);
    } catch (err) {
      return res.status(404).json({ message: err });
    }
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
