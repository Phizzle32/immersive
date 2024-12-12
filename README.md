# Immersive

## Description
Immersive is a full-stack web application built for efficient sales data management. It empowers retailers, business owners, and sellers with tools to track sales, manage inventory, and analyze customer behavior,
enabling data-driven decisions to optimize operations and enhance customer experiences.

## Running the Code
Follow these steps to set up and run the project:
### 1. Clone the repository
`git clone https://github.com/Phizzle32/immersive.git`
### 2. Navigate to the project directory
`cd immersive`
### 3. Install the dependencies
`npm run install-all`
### 4. Create `.env` file
In the project directory, create a `.env` file with the following content:
```
MYSQL_HOST='localhost'
MYSQL_USER='root'
MYSQL_PASSWORD='' # Use your mysql password here
MYSQL_DATABASE='immersive'
```
### 5. Set up database
Open up the MySQL CLI and run the following command
```sql
CREATE DATABASE immersive; 
USE immersive; 

-- 1. Create the Category Table 
CREATE TABLE Category ( 
   category_id INT AUTO_INCREMENT,
   category_name VARCHAR(100) UNIQUE NOT NULL,
   PRIMARY KEY (category_id), 
   INDEX (category_name) 
); 

-- 2. Create the User Table 
CREATE TABLE User (
   id INT AUTO_INCREMENT,
   name VARCHAR(100) NOT NULL,
   email VARCHAR(100) UNIQUE NOT NULL,
   phone_number VARCHAR(20),
   PRIMARY KEY (id) 
); 

-- 3. Create the Item Table 
CREATE TABLE Item (
   item_id INT AUTO_INCREMENT,
   item_amount DECIMAL(10, 2) NOT NULL,
   description TEXT,
   seller_id INT, 
   category_id INT,
   quantity INT NOT NULL,
   item_title VARCHAR(255) NOT NULL,
   PRIMARY KEY (item_id),
   INDEX (item_title),
   FOREIGN KEY (seller_id) REFERENCES User(id) 
      ON DELETE CASCADE ON UPDATE CASCADE, 
   FOREIGN KEY (category_id) REFERENCES Category(category_id)
      ON DELETE SET NULL ON UPDATE CASCADE
); 

-- 4. Create the Review Table 
CREATE TABLE Review (
   review_id INT AUTO_INCREMENT,
   item_id INT,
   reviewer_id INT,
   review_date DATE NOT NULL,
   comment TEXT,
   rating INT CHECK (rating BETWEEN 1 AND 5),
   PRIMARY KEY (review_id), 
   FOREIGN KEY (item_id) REFERENCES Item(item_id) 
      ON DELETE CASCADE ON UPDATE CASCADE,
   FOREIGN KEY (reviewer_id) REFERENCES User(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
); 

-- 5. Create the Transaction Table 
CREATE TABLE Transaction (
   trans_id INT AUTO_INCREMENT,
   item_id INT,
   item_title VARCHAR(255) NOT NULL,
   price DECIMAL(10, 2) NOT NULL,
   buyer_id INT,
   seller_id INT,
   date DATE NOT NULL,
   PRIMARY KEY (trans_id),
   FOREIGN KEY (item_id) REFERENCES Item(item_id) 
      ON DELETE SET NULL ON UPDATE CASCADE,
   FOREIGN KEY (buyer_id) REFERENCES User(id) 
      ON DELETE SET NULL ON UPDATE CASCADE,
   FOREIGN KEY (seller_id) REFERENCES User(id) 
      ON DELETE SET NULL ON UPDATE CASCADE
);

-- Insert sample data
INSERT INTO Category (category_name) VALUES 
('Electronics'), 
('Fashion'), 
('Home & Kitchen'), 
('Books'), 
('Toys & Games');

INSERT INTO User (name, email, phone_number) VALUES 
('Alice Smith', 'alice.smith@example.com', '123-456-7890'),
('Bob Johnson', 'bob.johnson@example.com', '234-567-8901'),
('Charlie Davis', 'charlie.davis@example.com', '345-678-9012'),
('David Lee', 'david.lee@example.com', '456-789-0123'),
('Eva White', 'eva.white@example.com', '567-890-1234');

INSERT INTO Item (item_amount, description, seller_id, category_id, quantity, item_title) VALUES 
(299.99, '4K Ultra HD Smart TV', 1, 1, 10, 'Samsung Smart TV'),
(49.99, 'Black leather jacket', 2, 2, 5, 'Leather Bomber Jacket'),
(39.99, 'Coffee maker', 3, 3, 15, 'Deluxe Coffee Machine'),
(15.99, 'Popular mystery novel', 4, 4, 20, 'The Silent Patient'),
(29.99, 'Electric scooter', 5, 5, 8, 'Zippy Kids Electric Scooter');

INSERT INTO Review (item_id, reviewer_id, review_date, comment, rating) VALUES 
(1, 2, '2024-10-01', 'Great TV, very easy to set up!', 5),
(2, 1, '2024-09-25', 'The jacket looks great, but a bit tight', 3),
(3, 4, '2024-10-05', 'Makes amazing coffee.', 4),
(4, 5, '2024-10-07', 'Loved this book! A real page-turner!', 5),
(5, 3, '2024-09-30', 'It\'s perfect for outdoor fun.', 4);

INSERT INTO Transaction (item_id, item_title, price, buyer_id, seller_id, date) VALUES
(1, 'Samsung Smart TV', 299.99, 3, 1, '2024-10-02'),
(2, 'Leather Bomber Jacket', 49.99, 5, 2, '2024-09-28'),
(3, 'Deluxe Coffee Machine', 39.99, 2, 3, '2024-10-06'),
(4, 'The Silent Patient', 15.99, 1, 4, '2024-10-08'),
(5, 'Zippy Kids Electric Scooter', 29.99, 4, 5, '2024-09-30');
```
### 6. Start the development server
`npm start`

## 7. Navigate to the website
Open your browser and go to http://localhost:4200/