# expressapp
> User Authentication using JWT JSON WebToken in Node.js using Express, Used Joi for user input validation, mongoose for ORM, Winston for error logging, Nodemailer for send email after crashing the Server, memory-cache for caching the data on RAM, also used redis for caching(updated)

## Installation

	npm install

## Setup
Create .env file on root directory and add the below code

	SECRET = AIzaSyAQfxPJiounkhOjODEO5ZieffeBv6yft2Q
	PORT = 3003
	MONGO_URI = mongodb://localhost:27017/expressapp
	NODE_ENV = development
	EMAIL_ID = example@example.com
	EMAIL_PWD = example
	REDIS_HOST = localhost
	REDIS_PASSWD = password
	REDIS_PORT = 6379
	CACHE_DURATION = 30


## Start an app

	npm start

## Testing API routes, models

Install mocha globally

	npm install -g mocha
	
Then run test script

	npm test

### Swagger Documentation

Link - http://localhost:3003/docs

For editing the swagger documentation swagger project must installed globally

	npm install -g swagger
	npm run editdocs

### *API Available*

###### *Signup User*

	POST: http://localhost:3003/api/user/signup

	{
		"firstName": "Jitendra",
		"lastName": "Kumar",
		"email": "contactjittu@gmail.com",
		"profileImage":"base64"
		"password":"123"
	}
  
###### *Login User*

	POST: http://localhost:3003/api/user/signin

	{
		"email": "contactjittu@gmail.com",
		"password": "123"
	}

###### *Update User info*

	PUT: http://localhost:3003/user

	{
		"firstname": "Jitendra",
		"lastname": "Kumar",
		"profile_image": "base64Image"
	}

###### *Get User profile*

	GET: http://localhost:3003/api/user/:userId

###### *Search Users*

	GET: http://localhost:3003/api/users/search?text=jitendra
  
###### *Get all Users*

	GET: http://localhost:3003/api/users?itemsperpage=10&page=1
