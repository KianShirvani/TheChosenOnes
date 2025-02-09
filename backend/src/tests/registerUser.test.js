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
                        userId: 1,
                        firstName: values[0],
                        lastName: values[1],
                        email: values[2],
                        phoneNum: values[3],
                        country: values[4],
                        displayName: values[5]
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
                lastName: 'Doe',
                email: 'user@email.com',
                phoneNum: '1234567890',
                country: 'USA',
                displayName: 'user123',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'First name is required', path: 'firstName' }),
            ])
        );
    });    

    // Test case: User registration should fail if last name is missing
    test('Should return error when first name is missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                firstName: 'Jane',
                email: 'user@email.com',
                phoneNum: '1234567890',
                country: 'USA',
                displayName: 'user123',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Last name is required', path: 'lastName' }),
            ])
        );
    }); 

    // Test case: Registration should fail if email is not in proper format
    test('Should return error if email is not in proper format', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'user@notanemail',
                phoneNum: '1234567890',
                country: 'USA',
                displayName: 'user123',
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
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'user@notanemail',
                country: 'USA',
                displayName: 'user123',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Phone number is required', path: 'phoneNum' }),
            ])
        );
    }); 

    // Test case: Registration should fail if country is missing
    test('Should return error if country is missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'user@notanemail',
                phoneNum: '1234567890',
                displayName: 'user123',
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

    // Test case: Registration should fail if display name is missing
    test('Should return error if country is missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'user@notanemail',
                phoneNum: '1234567890',
                country: 'USA',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Display name is required', path: 'displayName' }),
            ])
        );
    }); 

    // Test case: Registration should fail if password is less than 8 characters
    test('Should return error if country is missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'user@notanemail',
                phoneNum: '1234567890',
                displayName: 'user123',
                country: 'USA',
                password: 'Pass1',
                confirmPassword: 'Pass1'
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Password must be at least 8 characters long', path: 'password' }),
            ])
        );
    }); 

    // Test case: Registration should fail if password does not contain at least one number
    test('Should return error if password does not contain at least one number', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'user@notanemail',
                phoneNum: '1234567890',
                displayName: 'user123',
                country: 'USA',
                password: 'Password',
                confirmPassword: 'Password'
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Password must contain a number', path: 'password' }),
            ])
        );
    }); 

    // Test case: Registration should fail if password does not contain at least one uppercase character
    test('Should return error if password does not contain at least one number', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'user@notanemail',
                phoneNum: '1234567890',
                displayName: 'user123',
                country: 'USA',
                password: 'password1',
                confirmPassword: 'password1'
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Password must contain an uppercase letter', path: 'password' }),
            ])
        );
    }); 

    // Test case: Registration should fail if password and confirmPassword do not match
    test('Should return error if password and confirmPassword do not match', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'user@notanemail',
                phoneNum: '1234567890',
                displayName: 'user123',
                country: 'USA',
                password: 'Password123',
                confirmPassword: 'Password321'
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Passwords do not match', path: 'confirmPassword' }),
            ])
        );
    }); 

    // Test case: Registration should fail if phone number is invalid
    test('Should return error if phone number is invalid', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'user@notanemail',
                phoneNum: '12',
                displayName: 'user123',
                country: 'USA',
                password: 'Password123',
                confirmPassword: 'Password123'
            });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Invalid phone number format', path: 'phoneNum' }),
            ])
        );
    }); 

});