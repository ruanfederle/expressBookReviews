const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// ------------------ CHECK IF USERNAME IS VALID ------------------
const isValid = (username) => {
  // Retorna true se o username ainda não existir no array
  return !users.some(user => user.username === username);
};

// ------------------ CHECK IF USER IS AUTHENTICATED ------------------
const authenticatedUser = (username, password) => {
  // Retorna true se existir um usuário com esse username e password
  return users.some(user => user.username === username && user.password === password);
};

// ------------------ LOGIN ROUTE ------------------
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Gerar token JWT
    const accessToken = jwt.sign(
      { username: username },
      "access", // chave secreta
      { expiresIn: '1h' }
    );

    // Armazenar token na sessão
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User logged in successfully", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid login credentials" });
  }
});

// ------------------ ADD OR UPDATE BOOK REVIEW ------------------
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Se o livro existe, adiciona ou atualiza a review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review for book ${isbn} added/updated successfully`,
    reviews: books[isbn].reviews
  });
});

// ------------------ DELETE BOOK REVIEW ------------------
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: `Review for book ${isbn} deleted successfully`
    });
  } else {
    return res.status(404).json({ message: "No review found for this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
