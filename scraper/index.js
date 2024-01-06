'use strict'

module.exports = async function (fastify, opts) {
    fastify.get('/:name', getScraperHandler);
};

module.exports[Symbol.for('plugin-meta')] = {
    decorators: {
        fastify: [
            'instagramScraper',
        ]
    }
}

async function getScraperHandler(req, reply) {
    const { name } = req.params;
    const imgUrls = await this.instagramScraper.getImgUrls(name);
    reply.header('Content-Type', 'text/html');
    reply.send(htmlImgs);
}
