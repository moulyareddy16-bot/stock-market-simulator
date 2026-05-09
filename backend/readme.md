# Step 1: Initialize Backend

npm init -y
npm install express mongoose cors dotenv
npm i express dotenv mongoose cookie-parser cors
npm install nodemon

# step 2: Basic express server : 

- backend/
 ├── models/
 ├── routes/
 ├── controllers/
 ├── middleware/
 ├── config/
 └── server.js
 
 
 
 # Step 3: MongoDB Connection:
 # Step 4: Create Schemas
     user schema
	 Stock Schema
	 Portfolio Schema
	
	
# step 5: routes + Controllers
    Example: Buy Stock API

    - A. RATE LIMITING

Prevent API abuse.

Install:

npm install express-rate-limit

# PROFESSIONAL STOCK CACHE SYSTEM
  - npm install node-cache
# multer is used for file uploads.
  - npm install multer
  