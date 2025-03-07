const axios = require('axios');

const backendUrl = 'http://backend-container:5000';

const waitForBackend = async () => {
  while (true) {
    try {
      await axios.get(`${backendUrl}/healthcheck`);
      console.log('Backend is ready');
      break;
    } catch (error) {
      console.log('Waiting for backend to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

const insertMockData = async () => {
  console.log('Inserting mock data...');

  // Example: Sign up a user
  await axios.post(`${backendUrl}/api/signup`, {
    username: 'testuser',
    password: 'password123'
  });

  // Example: Add kanban data
  await axios.post(`${backendUrl}/api/kanban`, {
    title: 'Sample Kanban Board',
    description: 'This is a sample kanban board.'
  });

  console.log('Mock data inserted successfully.');
};

const main = async () => {
  await waitForBackend();
  await insertMockData();
};

main().catch(error => {
  console.error('Error inserting mock data:', error);
  process.exit(1);
});