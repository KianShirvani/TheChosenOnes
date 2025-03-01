const { Client } = require('pg');
require('dotenv').config();

describe('Database Initialization', () => {
  let client;

  beforeAll(async () => {
    client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'mydatabase',
      password: 'password',
      port: 5432,
    });
    await client.connect();
  });

  afterAll(async () => {
    await client.end();
  });

  test('Database should have users table', async () => {
    const res = await client.query(`
      SELECT *
      FROM information_schema.tables
      WHERE table_name = 'users';
    `);
    expect(res.rows.length).toBe(1);
  });

  test('Database should have admins table', async () => {
    const res = await client.query(`
      SELECT *
      FROM information_schema.tables
      WHERE table_name = 'admins';
    `);
    expect(res.rows.length).toBe(1);
  });

  test('Database should have password_resets table', async () => {
    const res = await client.query(`
      SELECT *
      FROM information_schema.tables
      WHERE table_name = 'password_resets';
    `);
    expect(res.rows.length).toBe(1);
  });

  test('Database should have kanbans table', async () => {
    const res = await client.query(`
      SELECT *
      FROM information_schema.tables
      WHERE table_name = 'kanbans';
    `);
    expect(res.rows.length).toBe(1);
  });

  test('Database should have tasks table', async () => {
    const res = await client.query(`
      SELECT *
      FROM information_schema.tables
      WHERE table_name = 'tasks';
    `);
    expect(res.rows.length).toBe(1);
  });  
});