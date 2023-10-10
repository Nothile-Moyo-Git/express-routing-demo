# Nothile's Node.js Shop Application

## *Note: This application uses Node v18.12*

## Here is a screenshot of the application :)

## This app is a shop app written in JavaScript, TypeScript, Express, SCSS, EJS, Node.js, MongoDB & Mongoose

**The purpose of this Application is to learn the backend in a simple way. This is a shop application with the ability to make orders, handle carts, create users, create orders, send emails, handle payments, perform admin & security functionality**

_I wanted to get a better idea about how to create API endpoints and handle API requests, as well as understanding security measures in the backend, as well as features such as working with non-relational databases, GraphQL, Stripe payments and using the MVC architecture_

### Setup
The version of node used when building this application is v18.12. If you need to change your node version for your installation, you can use ```nvm```.

> nvm is known as "node version manager" which allows you manage your node installations to make dependency management easier. You can find it [here](https://github.com/nvm-sh/nvm).

In order to install the required packages, run ```npm run install``` followed by ```npm audit fix```. The audit fix will automatically fix any issues that can be resolved without breaking the potential build.

In order to deploy the app, run ```npm run deploy``` which will deploy it to the database.

If you are visiting this repository and need the connection.ts file, _please send an email to [this](mailto:nothile1@gmail.com) email address._ If you know me personally, send a message requesting it.

You can copy the required commands from below

> Install node v18.12
```
nvm install 18.12
```

> Use node v18.12
```
nvm use 18.12
```

> Install dependencies
```
npm install
```

> Automatically fix dependency issues
```
npm audit fix
```

> Deploy the application
```
npm run deploy
```

> Start local server
```
npm run start
```

> Start styling processing (you need to run this alongside the server)
```
npm run watch
```

### Running the App
Once you've successfully copied and installed the packages, you'll want to run the application. 
To do this, run ```npm run start``` in order to start your local node server.

It will automatically open the web page in your browser, but if this doesn't suffice, try visiting [localhost:3000](http://) as a default link.

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

You can find the connection details in the _"src/data/connection.ts"_ file.

If you ever decide to use MongoDB yourself, you can use [MongoDB Atlas](https://www.mongodb.com/atlas/database) with a free tier which gives you AWS cloud instances for a de-coupled web application.

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
TypeScript is used to reduce the amount of issues experienced at runtime and on the live server. It forces developers to write cleaner, safer code. 

You can find re-usable interfaces in the _'src/@types/index.d.ts'_ file. This is used due to trying to apply the DRY principle.

> TypeScript increases the initial difficulty of building a codebase, but avoids issues such as having to perform null and undefined checks everywhere

**NOTE: You can find more information on TypeScript and it's usage [here](https://www.typescriptlang.org/why-create-typescript)**

### SCSS and styling
For this application, I've chosen SCSS with the BEM methodology. Since this isn't a component based framework like React, we won't use something like css modules. 

BEM refers to the Block, Element, Modifier methodology which was explained previously. You can find the "root" styling file in _"/src/scss/custom.scss"_. This file imports all the other styles using the @use method instead of @import (since import will be deprecated).

In order to compile our SCSS, we use a gulp run in order to do this. You can find this in the _"gulpfile.js_ file adjacent to this file.

The partials folder has my re-usable styles. You can see an example of this below:
_animations.scss_
```
// Slowly increase opacity of the card
@keyframes fade-in{
    0%{ opacity: 0; }
    100%{ opacity: 1; }
}
```

The comments will explain how the code is processed. 

**Note: Please be careful about what packages you use with gulp, it can change the order in which your gulp is parsed.**

If you add a new stylesheet, you must import it into the custom.scss file using @use.

### Security
Security measures have been taken with this application to ensure as much safety as possible.

All passwords are encrypted using bcrypt.

CSRF protection is in place with all form requests and cannot be bypassed.

Session tokens are also used in conjuction with CSRF requests.

No sensitive data is held on this website.

Note: **IF YOU ARE TRYING OUT THIS APPLICATON, DO NOT STORE SENSITIVE DATA ON THE SERVER, THIS IS A TOY APPLICATION**.

### Development Process

1: Duplicate the development branch by creating a feature or bugfix branch
2: Complete your work
3: Merge your branch into **develop** by creating a PR
4: Once approved, I will deploy the **develop** branch into master when testing is completed
5: If possible, please apply linting and testing to the application (although this isn't done yet)

### Potential Improvements

Improvements could definitely have been made to this application. 
There are design principles to help with the scalability of the applcation, for example:

[DRY (Don't repeat yourself)](https://www.digitalocean.com/community/tutorials/what-is-dry-development)
> Link for DRY is here, it's about reducing code duplication

[Solid Principles](https://www.freecodecamp.org/news/solid-principles-explained-in-plain-english/)
> Link for SOLID is here, it's about figuring out superior ways to use our Models, properties and methods with the appropriate naming conventions.


