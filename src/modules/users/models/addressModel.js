const { knexInstance } = require('../../../config/db');

const addressModel = {
    create: async (addressData) => {
        const db = await knexInstance();
        const [id] = await db('address').insert(addressData);
        return id;
    },
    findById: async (id) => {
        const db = await knexInstance();
        return db('address').where({ id }).first();
    },
    findByCep: async (cep) => {
        const db = await knexInstance();
        return db('address').where({ cep }).first();
    },
    update: async (id, addressData) => {
        const db = await knexInstance();
        return db('address').where({ id }).update(addressData);
    },
    delete: async (id) => {
        const db = await knexInstance();
        return db('address').where({ id }).del();
    }
};

module.exports = addressModel;