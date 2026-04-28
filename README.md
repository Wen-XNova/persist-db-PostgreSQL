# Booknotes Tracker

A full-stack web application that allows users to catalog their reading list, store personal notes, and dynamically fetch book cover artwork using the Open Library API. 

## Application Preview

| Dashboard / Grid View | Edit Entry | New Entry |
| :---: | :---: | :---: |
| ![Dashboard](https://github.com/user-attachments/assets/287de056-ebd7-4af8-b505-62a38ed71205) | ![Edit Form](https://github.com/user-attachments/assets/c77c92c0-dab1-4fa3-82f8-5dcf42f8082b) | ![New Book](https://github.com/user-attachments/assets/be67cd3c-b240-4e10-85cb-762b3f87cfcf) | 
| *Viewing the collection* | *Managing book data* | *Adding a new book* |

## Core Features

* **Complete CRUD Operations:** Users can Create, Read, Update, and Delete book entries and personal notes.
* **Relational Database:** Data is persistently stored using PostgreSQL, ensuring reliable querying and management.
* **Dynamic API Integration:** Automatically fetches high-quality book covers via the Open Library API based on the user-provided ISBN.
* **Responsive UI:** Server-side rendered interface using EJS, featuring a dynamic CSS grid layout.

## Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (using `pg` module)
* **Frontend:** EJS (Embedded JavaScript templates), HTML5, CSS3
* **API Requests:** Axios

## How to Run Locally

1. Clone the repository and navigate into the project directory.
2. Install the required Node dependencies:
   ```bash
   npm install
