# Nothile's Node.js shop app.

## This app is a shop app written in JavaScript, TypeScript, Express, SCSS, EJS, Node.js, MongoDB & Mongoose

## Models
This application is a full stack MVC application. The models are found in the "/src/models" folder. The Mongoose models define our schema's that we used in order to gain the advantages of using a relational functionality in a non-relational database. It also helps with scaling since we don't need to replicate as much data.

The models also allow us to gain access to Mongoose model methods such as save (which creates a record in our collection) and allows us to extend the methods with our own.

Most of the Mongoose functionality is handled asynchronously with async/await but promise chaining is also a viable method depending on the methodologies you wish to use.

## Controllers
Our controllers are found in the _/src/controllers_ folder. Our controllers handle our get and post requests. Express also has the ability to perform put and delete requests using **express. methods**.

Our controllers also instantiate our methods, perform our Mongoose model methods, render our view pages, and to pass data through to the views.

## Views

Our views are found in the _/src/views_ folder. We use EJS for this. We pass the variables we assign in the controllers to the views.
The includes folders contains our most re-usable components, including our header and footer template files.
As we're using EJS, you can find the syntax of how to use it [here](https://ejs.co/#install). Look at the "tags" section to know how to better write your ejs.

## It also uses different methods of connecting to and working with databases such as SQL (Sequelize ORM) & noSQL (MongoDB & Mongoose).

**Note: Sequelize and MySQL were used previously, and have now been replaced with Mongoose. Mongoose is an ORM for MongoDB used with Node.js**



### Setup

The version of node used when building this application is v18.12. If you need to change your node version for your installation, you can use `nvm`.

> nvm is known as "node version manager" which allows you manage your node installations to make dependency management easier. You can find it [here](https://github.com/nvm-sh/nvm).

In order to install the required packages, run `npm run install` followed by `npm audit fix`. The audit fix will automatically fix any issues that can be resolved without breaking the potential build.

In order to deploy the app, run `npm run deploy` which will deploy it to the database.

If you are visiting this repository and need the connection.ts file, _please send an email to [this](mailto:nothile1@gmail.com) email address._ If you know me personally, send a message requesting it.

### Server
This app uses express.js with a port of 3000 found in _./src/index.ts_.
The port number is set in the .env file and is pulled through to the index file.
To open the app, go to [localhost:3000](http://localhost:3000/).

### Routing

Routing is handled in express using the _express.router_ method. We instantiate our routes in Index.ts based on a prefixed url, then we can add our URL's in later.
Routes follow the stack trace and are called in the order that they're defined.
As a result of this, the 404 or "fallback" route is always defined as the last route, and is run if every other route has failed.
_Dynamic routes are handled with a colon ':' after a trailing slash after the prefix_.

You can find all the route handling in the */src/index.ts* and */src/routes*.

Routes are also handled in the call order, and you can add multiple route handlers when handling a single request, which basically means that we can run a route handler which deals with authentication then we handle the normal route. If the authentication handling fails, then we go back to the default page.

### TypeScript

### SCSS and styling

### Packages

### Security