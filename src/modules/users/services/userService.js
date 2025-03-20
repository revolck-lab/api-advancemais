const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');
const companyModel = require('../models/companyModel');
const generateCode = require('../../../utils/generateCode');
const format = require('../../../utils/formatText');

const loginUser = async (login, password) => {
    const user = login.length > 11
                ? await companyModel.findByCnpj(login)
                : await userModel.findByCpf(login);

    if (!user) return { error: 'Invalid credentials' };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return { error: 'Invalid credentials' };
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return { token };
};

const registerUser = async (userData) => {
    const {
        name,
        email,
        password,
        birth_date,
        cpf,
        phone_user,
        gender_id,
        education_id,
        role_id,
        address,
        city,
        state,
        cep,
    } = userData;

    const [emailExists, cpfExists] = await Promise.all([
        userModel.findByEmail(email),
        userModel.findByCpf(cpf)
    ]);

    if (emailExists) {
        return { error: 'Email already registered' };
    }

    if (cpfExists) {
        return { error: 'CPF already registered' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const addressData = {
        address,
        city,
        state,
        cep
    };

    const addressId = await addressModel.create(addressData);

    const codeUser = generateCode();

    const formatName = await format.formatText(name);
    const formatEmail = await format.formatEmail(email);

    const userId = await userModel.create({
        name: formatName,
        email: formatEmail,
        password: hashedPassword,
        birth_date,
        cpf,
        phone_user,
        gender_id,
        education_id,
        role_id,
        address_id: addressId,
        code_user: codeUser,
    });

    const newUser = await userModel.findById(userId);
    delete newUser.password;

    return { user: newUser };
};

module.exports = {
    loginUser,
    registerUser
};