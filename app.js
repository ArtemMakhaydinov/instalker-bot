'use strict'

require('dotenv').config();
const InstagramScraper = require('./scraper/instagram-scraper');
const scraper = require('./scraper');
const fp = require('fastify-plugin');
const fastify = require('fastify')({
    logger: true
});

async function decorateFastify (fastify) {
    const instagramScraper = new InstagramScraper();
    fastify.decorate('instagramScraper', instagramScraper)
}

fastify.register(fp(decorateFastify));
fastify.register(scraper);

fastify.listen({ port: 3000, host: '127.0.0.1'}, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
    fastify.log.info(`Server listening on ${address}`);
});
