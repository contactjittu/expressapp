'use strict';

require('dotenv').config();

module.exports = {
	SECRET : process.env.SECRET,
	PORT : process.env.PORT,
	MONGO_URI: process.env.MONGO_URI,
	NODE_ENV: process.env.NODE_ENV,
	CLUSTERING: false,
	MAIL: {
		EMAIL_ID: process.env.EMAIL_ID,
		EMAIL_PWD: process.env.EMAIL_PWD
	},
	rateLimits: {
        ttl: 60, // 1 mins
        maxHits: 5 // Max Hits
	},
	REDIS_HOST: process.env.REDIS_HOST,
	REDIS_PASSWD: process.env.REDIS_PASSWD,
	REDIS_PORT: process.env.REDIS_PORT,
	CACHE_DURATION: process.env.CACHE_DURATION, // in seconds
	SWAGGER_URL: 'expressapp-api.herokuapp.com'
}