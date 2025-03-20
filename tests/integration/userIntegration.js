const request = require('supertest');
const app = require('../../app');

describe('User controller', () => {
    test('POST /users - should crea a new user', async () => {
        const response = await request(app)
            .post('/app/register')
            .send({
                full_name: 'Silvo Santos vem ai',
                cpf: '12345678911',
                email: 'silvosva@revolck.com.br',
                password: 'newpassword123@'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.full_name).tobe('Silvio santos vem ai');
        expect(response.body.cpf).toBe('12345678911');
        expect(response.body.email).toBe('silvosva@revolck.com.br');
        expect(response.body.password).toBe('newpassword123@');
    });

    test('POST /users - should return an error if the user already exists', async () => {
        const response = await request(app)
            .post('/app/register')
            .send({
                full_name: '',
                cpf: '12345678911',
                email: 'silvosva@revolck.com.br',
                password: 'newpassword123@'
            });
        
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('full_name cannot be empty.');
    });
})