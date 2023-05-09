# **LINGODECK**

**LingoDeck** is a _REST API_ designed to help language learners practice and memorize new vocabulary using spaced repetition. With LingoDeck, users can create an account, log in, create flashcards, modify existing flashcards, and practice their flashcards using the supermemo library to implement spaced intervals.

## **Features**

---

<br>

- **Secure User Authentication**: All registration and login data is encrypted for security. Passwords are hashed during registration, and login data is encrypted and tokenized using JWT.

- **Authentication-Based Database Interaction**: All interactions with the flashcard database must pass through a middleware authentication layer, which follows the HTTP Bearer Token schema and embeds relevant data into each request.

- **Image Optimization**: All images are optimized using the sharp library, with both width and height reduced and the format converted to webp. Each image is assigned a unique identifier to prevent naming collisions, and is uploaded to Supabase with the URL serving as a backup.

- **Robust error handling** is implemented throughout the application using custom error objects and middleware. Endpoints that cannot be found return a 404 error, while validation errors are caught and converted into a 400 error. All other errors are handled by a generic error handler middleware.

## **Stack**

---

- LingoDeck's server-side infrastructure is built on **Express**, which allow me to easily create and organize middleware functions and routes, separating concerns and increasing maintainability. I interact with the database using Mongoose object modeling.
- For static code analysis, **TypeScript** for type checking, and Eslint with lint-staged for detecting syntax errors, bad practices, and unintuitive code. Also, I use Prettier to format the code according to the rules specified in the editorConfig.
- For testing purposes, the stack includes _mongodb-memory-server_ to create an in-memory MongoDB server, and _supertest_ to simulate requests to specific endpoints. These tools are used in conjunction with the testing framework Jest.

<br>

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## **Usage**

---

### **User Route**

 <br>

_Body of each should be_:

```javascript
{
  'username': string,
  'password': string,
}
```

### Register => `POST https://lingodeck-back-r8o3.onrender.com/user/login`

---

Response:

```javascript
{
  'message': `User ${username} has been succesfully created`
}
```

### Log in => `POST https://lingodeck-back-r8o3.onrender.com/user/login`

---

Response:

```javascript
{
  'token': string;
}
```

  <br>

### **Flashcards Route**

 <br>

_Create and modify flashcard requests must be sent in form data_:
<br>
| key | value |  
|---|---|
| front | string |  
| back | string |
| language | string |
| image | file |

_Common flashcard response body_:

```javascript
{
  flashcard: {
    'id': string,
    'front': string,
    'back': string,
    'language': string,
    'dueDate': string,
    'imageInfo': {
      'fileName': string,
      'imageBackup': string,
    }.
    'interval': number;
    'efactor': number,
    'repetition': number,
  }
}
```

_All flashcards requests must be sent with an authorization header Bearer Token_

<br>

### Create => `POST https://lingodeck-back-r8o3.onrender.com/flashcards`

### Modify => `PATCH https://lingodeck-back-r8o3.onrender.com/flashcards/:flashcardId`

### Read Flashcard => `GET https://lingodeck-back-r8o3.onrender.com/flashcards/:flashcardId`

<br>

### Read Flashcards => `GET https://lingodeck-back-r8o3.onrender.com/flashcards`

---

- Search Params:
  - _limit_ => digit > 0
  - _page_ => digit > 0
  - _language_ => text _first letter should be capitalized_

Response:

```javascript
{
  'flashcards': flashcard[],
  'page': number,
}
```

### Delete => `DELETE https://lingodeck-back-r8o3.onrender.com/flashcards/:flashcardId`

---

Response:

```javascript
 {
  'message': string,
 }
```

### Practice => `PATCH https://lingodeck-back-r8o3.onrender.com/flashcards/practice/:flashcardId`

---

Request:

```javascript
{
  'grade': number
}
```
