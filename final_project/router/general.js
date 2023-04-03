const express = require('express');
const session = require('express-session');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const jwt = require('jsonwebtoken');
const public_users = express.Router();

const axios = require('axios');


public_users.post("/register", (req,res) => {
  //Write your code here
  
  const { username, password, email, DOB } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  if (users[username]) {
    return res.status(409).send('Username already exists');
  }

  users[username] = { username, password, email, DOB };

  return res.status(201).send('User registered successfully');
  
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify({books},null,4));
});

//Task 10: Get the list of books using Async-await with Axios

const getBooks = async () => {
  try {
    const response = await axios.get('http://localhost:5000');
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
public_users.get('/books', async (req, res) => {
  const books = await getBooks();
  res.send(books);
});


// Task 11: Function to get the book details based on ISBN using Promise callbacks with Axios
const getBookDetails = (isbn) => {
  return axios
    .get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => {
      const bookDetails = response.data;
      return bookDetails;
    })
    .catch((error) => {
      console.error(error);
    });
};
public_users.get('/books/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  const book = await getBookDetails(isbn);
  res.send(book);
});


// Task 12: Function to get the book details based on ISBN using Promise callbacks with Axios

// Get all books for a given author
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;
    const filteredBooks = books.filter(book => book.author === author);
    return filteredBooks;
  } catch (error) {
    console.error(error);
  }
}

public_users.get('/author1/:author', async (req, res) => {
  const author = req.params.author1;
  const book = await getBooksByAuthor(author);
  res.send(book);
});


// Task 13: Function to get the book details based on Title using Promise callbacks with Axios

const booksAPI = 'http://localhost:5000/books';

function getBookByTitle(title) {
  return new Promise((resolve, reject) => {
    axios.get(`${booksAPI}?title=${title}`)
      .then(response => {
        const books = response.data;
        if (books.length === 0) {
          reject(`No book found with title ${title}`);
        } else {
          resolve(books[0]);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

const getBookDetailsByTitle = (title) => {
  return axios
    .get('http://localhost:5000/books/${title}')
    .then((response) => {
      const bookDetails = response.data;
      return bookDetails;
    })
    .catch((error) => {
      console.error(error);
    });
};
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  const book = await getBookByTitle(title);
  res.send(book);
});




public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;
    //res.send(books);
    //const filteredBooks = books.filter(book => book.author === author);
    const bookList = [];
    Object.keys(books).forEach((key) => {
      const book = books[key];

      if (book.author === author) {
        bookList.push(book);
      }
    });

    /* if (bookList.length === 0) {
      return res.status(404).send('Books not found');
    }  */

    return res.status(200).json(bookList);

 // res.send(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = Object.values(books).find((book) => book.isbn === isbn);
  res.send(book);

 });
  
// Get book details based on author
/* public_users.get('/author/:author',function (req, res) {
  //Write your code here

  const author = req.params.author;

  const bookList = [];

  // Iterate through the books object and find books with matching author
    Object.keys(books).forEach((key) => {
      const book = books[key];

      if (book.author === author) {
        bookList.push(book);
      }
    });

    if (bookList.length === 0) {
      return res.status(404).send('Books not found');
    }

    //return res.status(200).json(bookList);
    res.send(JSON.stringify({bookList},null,4));
    //res.send(bookList);

  //return res.status(300).json({message: "Yet to be implemented"});
}); */

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

  const title = req.params.title;

  const bookList = [];

  // Iterate through the books object and find books with matching author
    Object.keys(books).forEach((key) => {
      const book = books[key];

      if (book.title === title) {
        bookList.push(book);
      }
    });

    if (bookList.length === 0) {
      return res.status(404).send('Books not found');
    }

    //return res.status(200).json(bookList);
    res.send(JSON.stringify({bookList},null,4));
    //res.send(bookList);

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = Object.values(books).find((book) => book.isbn === isbn);

  if (!book) {
    return res.status(404).send('Book not found');
  }
  const reviews = book.reviews;

  res.send(reviews);
  //return res.status(300).json({message: "Yet to be implemented"});
});




//only registered users can login
public_users.post("/login", (req,res) => {
  //Write your code here

  const { username, password } = req.body;
  //req.send(req.body);
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

/*   req.session.user = {
      username: username,
      isLoggedIn: true
  }; */

  // Generate and sign the JWT token
  //const token = jwt.sign({ username: user.username }, 'secretkey');
  const token = jwt.sign({ id: user.id, username: user.username }, 'secretkey');
  
  
  // Send the JWT token as response
  res.send({ token });

  //return res.status(300).json({message: "Yet to be implemented"});
});


// Add a book review
public_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

    const isbn = req.params.isbn;
    const review = req.query.review;
    //const username = req.session.username;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    //res.send(authHeader);

    const user = jwt.verify(token, 'secretkey'); // Verify token
    const username = user.username;
    //res.send(username);

    if (!username) {
      res.status(401).send('You must be logged in to post a review.');
      return;
    }
  
    if (!review) {
      res.status(400).send('Review cannot be empty.');
      return;
    }
    
    const book = Object.values(books).find((book) => book.isbn === isbn);
    //const book = books[isbn];
    if (!book) {
      res.status(404).send('Book not found.');
      return;
    }
    
    //res.send(book.reviews[username]);
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


public_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  //const username = req.session.username;

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  //res.send(authHeader);

  const user = jwt.verify(token, 'secretkey'); // Verify token
  const username = user.username;


    if (!username) {
      res.status(401).send('You must be logged in to delete a review.');
      return;
    }
  
  //const book = books[isbn];
  const book = Object.values(books).find((book) => book.isbn === isbn);
  if (!book) {
    return res.status(404).send("Book not found");
  }

  const review = book.reviews[username];
  //res.send(book.reviews[username]);
  if (!review) {
    return res.status(404).send("Review not found");
  }

  delete book.reviews[username];
  return res.status(200).send(`Review for book ${isbn} deleted successfully`);
});




module.exports.general = public_users;
