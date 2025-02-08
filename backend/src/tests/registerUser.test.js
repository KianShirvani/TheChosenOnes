// Dependencies
const request = require('supertest');
const express = require('express');
const { registerUser } = require('../controllers/userController');
const { validateRegistration } = require('../middlewares/validateRegistration');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Setup for testing
const app = express();
app.use(express.json());
app.post('/register', validateRegistration, registerUser);

// Mock pg and bcrypt
jest.mock('pg', () => {  
    const mockClient = {
        query: jest.fn(),
        connect: jest.fn(),
        end: jest.fn(),
    };

    return {
        Client: jest.fn(() => mockClient),
    };
});

jest.mock('bcryptjs', () => ({
    genSalt: jest.fn(),
    hash: jest.fn(),
}));

beforeEach(() => {
    // Setup mock implementation for pg client queries
    const mockClient = new (require('pg').Client)(); // Mock Client instance
    mockClient.query.mockReset(); // Reset before each query

    // Mock database query to check if email already exists
    mockClient.query.mockImplementation((query, values) => {
        if (query.includes('SELECT * FROM users WHERE email')) {
            if (values[0] === 'existing@email.com') {
                return Promise.resolve({
                    rows: [{ email: 'existing@email.com' }],
                });
            } else {
                return Promise.resolve({ rows: [] }); // No existing user
            }
        }
        if (query.includes('INSERT INTO users')) {
            return Promise.resolve({
                rows: [
                    {
                        user_id: 1,
                        first_name: values[0],
                        last_name: values[1],
                        email: values[2],
                        phone_num: values[3],
                        country: values[4],
                        display_name: values[5],
                        created_at: '2025-02-07T14:10:45Z',
                    },
                ],
            });
        }
        return Promise.resolve({ rows: [] });
    });

    // Mock bcrypt methods for password hashing
    bcrypt.genSalt.mockImplementation(() => Promise.resolve('salt'));
    bcrypt.hash.mockImplementation(() => Promise.resolve('hashed_password'));
});

// Tests
describe('POST /register', () => {
    // Test case: User registration should fail if first name is missing
    test('Should return error when first name is missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                last_name: 'Doe',
                email: 'user@email.com',
                phone_num: '1234567890',
                country: 'USA',
                display_name: 'user123',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'First name is required', path: 'first_name' }),
            ])
        );
    });    

    // Test case: User registration should fail if last name is missing
    test('Should return error when first name is missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                first_name: 'Jane',
                email: 'user@email.com',
                phone_num: '1234567890',
                country: 'USA',
                display_name: 'user123',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Last name is required', path: 'last_name' }),
            ])
        );
    }); 

    // Test case: Registration should fail if email is not in proper format
    test('Should return error if email is not in proper format', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                first_name: 'Jane',
                last_name: 'Doe',
                email: 'user@notanemail',
                phone_num: '1234567890',
                country: 'USA',
                display_name: 'user123',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Invalid email format', path: 'email' }),
            ])
        );
    }); 

    // Test case: Registration should fail if phone number is missing
    test('Should return error if phone number is missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                first_name: 'Jane',
                last_name: 'Doe',
                email: 'user@notanemail',
                country: 'USA',
                display_name: 'user123',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Phone number is required', path: 'phone_num' }),
            ])
        );
    }); 

    // Test case: Registration should fail if country is missing
    test('Should return error if country is missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                first_name: 'Jane',
                last_name: 'Doe',
                email: 'user@notanemail',
                phone_num: '1234567890',
                display_name: 'user123',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Country is required', path: 'country' }),
            ])
        );
    }); 

    

});