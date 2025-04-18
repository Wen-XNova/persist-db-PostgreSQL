import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "bookNotes",
  password: "sturm",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

const API_URL = "https://covers.openlibrary.org/b/";

// Get all books
app.get("/", async (req, res) => {
  try {

    const result = await db.query("SELECT * FROM booknotes");
    const books = result.rows;

    const updatedBooks = await Promise.all(
      books.map(async (book) => {
        try {
          const external = await axios.get(API_URL + `isbn/${book.isbn}-M.jpg`, { validateStatus: false });
      
          book.image = external.status === 200 ? external.request.res.responseUrl : null;
        } catch (error) {
          console.error(`Failed to fetch image for ISBN ${book.isbn}:`, error.message);
          book.image = null; 
        }
        return book;
      })
    );

    res.render("index.ejs", {
      books: updatedBooks,
      book: null,
    });
  } catch (error) {
    console.error("Error fetching books or images:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Order by date
app.get("/order", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM booknotes ORDER BY date DESC;")
    const ordBooks = result.rows;

    const orderedBooks = await Promise.all(
      ordBooks.map(async (book) => {
        try {
          const external = await axios.get(API_URL + `isbn/${book.isbn}-M.jpg`, { validateStatus: false });
      
          book.image = external.status === 200 ? external.request.res.responseUrl : null;
        } catch (error) {
          console.error(`Failed to fetch image for ISBN ${book.isbn}:`, error.message);
          book.image = null; 
        }
        return book;
      })
    );

    res.render("index.ejs", {
      books: orderedBooks,
      book: null,
    });
  } catch (error) {
    console.error("Error fetching books or images:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Render the add new book page
app.get("/new", async (req, res) => {
  try {
    res.render("new.ejs", {
      submit: "Add Book"
    });
  } catch (error) {
    console.log(error);
  }
  });

//Render the update book page
app.post("/edit/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
    "SELECT * FROM booknotes WHERE id = $1", [id]
    );

    const book = result.rows[0];

    
    res.render("update.ejs", {
      book: book,
      submit: "Update Book"
    });

    if (result.rows.length === 0) {
      console.log("No book found with the given ISBN.");
    }
  } catch (error) {
    console.log(error);
  }
  });

// Click on ISBN
app.get("/get-isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const result = await db.query(
      "SELECT * FROM booknotes WHERE isbn = $1", [isbn]
    );
  
    if (result.rows.length === 0) {
      console.log("No book found with the given ISBN.");
      return res.status(404).send("No book found with the given ISBN.");
    }

    const book = result.rows[0];

    const external = await axios.get(API_URL + "isbn/" + isbn + "-M.jpg");

    const image = external.request.res.responseUrl;

    res.render("index.ejs", {
      book: book,
      image: image,
      books: null
    });
  } catch (error) {
    console.error("Error fetching book data or image:", error.message);
    res.status(500).send("An error occurred while retrieving the book.");
  }
});

//POST a new book
app.post("/newBook", async (req, res) => {
  const result = await db.query("SELECT id FROM booknotes ORDER BY id DESC LIMIT 1;")

  const lastId = result.rows[0]?.id || 0;

  const newId = lastId + 1;

  const currentDate = new Date();

  const formattedDate = currentDate.toISOString().split("T")[0];

  try {
  await db.query("INSERT INTO booknotes (id, isbn, title, author, content, date) VALUES ($1, $2, $3, $4, $5, $6)",
  [newId, req.body.isbn, req.body.title, req.body.author, req.body.content, formattedDate]);
  res.redirect("/");
} 
  catch (error) {
    res.status(500).json({ message: "Error saving book" });}
});

//delete book by ISBN
app.post("/delete/:isbn", async (req, res) => {
  const { isbn } = req.params;
  try {
  await db.query("DELETE FROM booknotes WHERE isbn = $1", [isbn]);
  res.redirect("/"); 
  } catch (err) {
 console.log(err);
  res.status(500).send("Error deleting book");
  }
});
  
//Update a book when you want to change one or more parameters. 
app.post("/update/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];

  try {
    const { title, author, isbn, content } = req.body;

    const result = await db.query(
      `UPDATE booknotes 
       SET isbn = COALESCE($2, isbn), 
           title = COALESCE($3, title), 
           author = COALESCE($4, author), 
           content = COALESCE($5, content),
           date = $6
       WHERE id = $1`,
      [id, isbn, title, author, content, formattedDate]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No book found, no change made." });
    }

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  