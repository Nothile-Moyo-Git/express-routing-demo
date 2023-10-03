# Nothile's Node.js Shop Application

## This app is a shop app written in JavaScript, TypeScript, Express, SCSS, EJS, Node.js, MongoDB & Mongoose

**The purpose of this Application is to learn the backend in a simple way. This is a shop application with the ability to make orders, handle carts, create users, create orders, send emails, handle payments, perform admin & security functionality**

_I wanted to get a better idea about how to create API endpoints and handle API requests, as well as understanding security measures in the backend, as well as features such as working with non-relational databases, GraphQL, Stripe payments and using the MVC architecture_

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

## Databases
**Note: Sequelize and MySQL were used previously, and have now been replaced with Mongoose. Mongoose is an ORM for MongoDB used with Node.js**

## Links to various tools & frameworks used:
[MongoDB](https://www.mongodb.com/)
> This is the non-relational database used for this application.

[Mongoose](https://mongoosejs.com/)
> This is the ORM used for this application.

[TypeScript](https://www.typescriptlang.org/)
> TypeScript is used for better code formatting.

[SCSS](https://sass-lang.com/)
> Introduction to SCSS and its official documentation.

[EJS](https://ejs.co/)
> Introduction to ejs and its official documentation.

[How to install SCSS with Gulp](https://jhinter.medium.com/setting-up-gulp-to-compile-scss-in-less-than-5-minutes-fee8bea2b68b)
> This is a guide on how to get a local gulp run working with a scss file.

[How to install TypeScript with Node.js](https://khalilstemmler.com/blogs/typescript/node-starter-project/)
> This is how to install node.js with TypeScript on your own project.

[How to use BEM](https://getbem.com/)
> This explains the BEM methodology using SCSS.

[Trunk based development](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development)
> This explains trunk based development, gitflow is also used. Trunk based development is very good for a reliable CICD process.

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
### Security

### Development Principles

### Potential Improvements

Improvements could definitely have been made to this application. 
There are design principles to help with the scalability of the applcation, for example:

[DRY (Don't repeat yourself)](https://www.digitalocean.com/community/tutorials/what-is-dry-development)
> Link for DRY is here, it's about reducing code duplication

[Solid Principles](https://www.freecodecamp.org/news/solid-principles-explained-in-plain-english/)
> Link for SOLID is here, it's about 