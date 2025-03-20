// const request = require('supertest');
// const app = require('../../src/app');
// const userModel = require('../../src/modules/users/models/userModel');
// const bcrypt = require('bcrypt');

// jest.mock('../../src/modules/users/models/userModel');

// describe('User controller', () => {
//     describe('POST /auth/register', () => {
//         test('should create a new user', async () => {
//             userModel.findByEmail.mockResolvedValue(null);
//             userModel.findByCpf.mockResolvedValue(null);
//             userModel.create.mockResolvedValue(1);

//             const response = await request(app)
//                 .post('/auth/register')
//                 .send({
//                     full_name: 'Silvio Santos Vem Ai',
//                     cpf: '12345678911',
//                     email: 'silvosva@revolck.com.br',
//                     password: 'newpassword123@'
//                 });

//             expect(response.statusCode).toBe(201);
//             expect(response.body).toHaveProperty('id');
//             expect(response.body.full_name).toBe('Silvio Santos Vem Ai');
//             expect(response.body.cpf).toBe('12345678911');
//             expect(response.body.email).toBe('silvosva@revolck.com.br');
//         });

//         test('should return an error if the email is already registered', async () => {
//             userModel.findByEmail.mockResolvedValue({ id: 1 });

//             const response = await request(app)
//                 .post('/auth/register')
//                 .send({
//                     full_name: 'Silvio Santos Vem Ai',
//                     cpf: '12345678911',
//                     email: 'silvosva@revolck.com.br',
//                     password: 'newpassword123@'
//                 });

//             expect(response.statusCode).toBe(400);
//             expect(response.body).toHaveProperty('error');
//             expect(response.body.error).toBe('Email already registered');
//         });

//         test('should return an error if the CPF is already registered', async () => {
//             userModel.findByEmail.mockResolvedValue(null);
//             userModel.findByCpf.mockResolvedValue({ id: 1 });

//             const response = await request(app)
//                 .post('/auth/register')
//                 .send({
//                     full_name: 'Silvio Santos Vem Ai',
//                     cpf: '12345678911',
//                     email: 'silvosva@revolck.com.br',
//                     password: 'newpassword123@'
//                 });

//             expect(response.statusCode).toBe(400);
//             expect(response.body).toHaveProperty('error');
//             expect(response.body.error).toBe('CPF already registered');
//         });
//     });

//     describe('POST /auth/login', () => {
//         test('should log in a user with valid credentials', async () => {
//             const passwordHash = await bcrypt.hash('newpassword123@', 10);
//             userModel.findByEmail.mockResolvedValue({ id: 1, password: passwordHash }); 

//             const response = await request(app)
//                 .post('/auth/login')
//                 .send({
//                     login: 'silvosva@revolck.com.br',
//                     password: 'newpassword123@'
//                 });

//             expect(response.statusCode).toBe(200);
//             expect(response.body).toHaveProperty('token');
//         });

//         test('should return an error if the user does not exist', async () => {
//             userModel.findByEmail.mockResolvedValue(null); 
//             userModel.findByCpf.mockResolvedValue(null);

//             const response = await request(app)
//                 .post('/auth/login')
//                 .send({
//                     login: 'silvosva@revolck.com.br',
//                     password: 'wrongpassword'
//                 });

//             expect(response.statusCode).toBe(401);
//             expect(response.body).toHaveProperty('error');
//             expect(response.body.error).toBe('Invalid credentials');
//         });

//         test('should return an error for incorrect password', async () => {
//             const passwordHash = await bcrypt.hash('newpassword123@', 10);
//             userModel.findByEmail.mockResolvedValue({ id: 1, password: passwordHash });

//             const response = await request(app)
//                 .post('/auth/login')
//                 .send({
//                     login: 'silvosva@revolck.com.br',
//                     password: 'wrongpassword'
//                 });

//             expect(response.statusCode).toBe(401);
//             expect(response.body).toHaveProperty('error');
//             expect(response.body.error).toBe('Invalid credentials');
//         });
//     });
// });
