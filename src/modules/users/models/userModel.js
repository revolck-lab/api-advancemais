const { knexInstance } = require('../../../config/db');

const userModel = {
    create: async (user) => {
        const db = await knexInstance();
        const [id] = await db('user').insert(user);
        return id;
    },
    findByEmail: async (email) => {
        const db = await knexInstance();
        return db('user').where({ email }).first();
    },
    findByCpf: async (cpf) => {
        const db = await knexInstance();
        return db('user').where({ cpf }).first();
    },
    findById: async (id) => {
        const db = await knexInstance();
        return db('user').where({ id }).first();
    },
    findByLevel: async (role_id) => {
        const db = await knexInstance();
        return db('role').where({ id: role_id }).first();
    },
    update: async (id, user) => {
        const db = await knexInstance();
        return db('user').where({ id }).update(user);
    },
    updatePassword: async (id, hashedPassword) => {
        const db = await knexInstance();
        return db('user').where({ id }).update({ password: hashedPassword });
    },
    delete: async (id) => {
        const db = await knexInstance();
        return db('user').where({ id }).del();
    }
};

module.exports = userModel;
