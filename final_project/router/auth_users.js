const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
      username: "irteza",
      password: "12345678",
      email:"irtezasyed001@gamil.com",
      DOB:"22-01-1990",
  },
  {
    username: "ahmad",
    password: "Hussain",
    email:"ahmadhussain01@gamil.com",
    DOB:"21-07-1983",
  },
  {
    username: "saadrafiq",
    password: "Khan123",
    email:"saadrafiq@gamil.com",
    DOB:"21-03-1989",
  },
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here

  const { username, password } = req.body;
  req.send(req.body);
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).send('Username and password are required!');
  }

  // Check if the user exists in the registeredUsers array
  const user = Object.values(users).find((user) => user.username === username && user.password === password);
  //const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).send('Invalid username or password!');
  }

  // Generate and sign the JWT token
  const token = jwt.sign({ username: user.username }, 'secretkey');
  
  // Send the JWT token as response
  res.send({ token });

  //return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.username;
  
    if (!username) {
      res.status(401).send('You must be logged in to post a review.');
      return;
    }
  
    if (!review) {
      res.status(400).send('Review cannot be empty.');
      return;
    }
  
    const book = books[isbn];
    if (!book) {
      res.status(404).send('Book not found.');
      return;
    }
  
    if (book.reviews[username]) {
      // User has already posted a review for this book, modify the existing review
      book.reviews[username] = review;
      res.send('Review modified successfully.');
    } else {
      // Add a new review for the book
      book.reviews[username] = review;
      res.send('Review added successfully.');
    }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
