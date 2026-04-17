const client = require('../config/elastic');

const INDEX_NAME = 'users';

const userService = {
  async createUser(userData) {
    try {
      // Check if user already exists by email/username
      const { exists } = await client.exists({ index: INDEX_NAME, id: userData.email });
      if (exists) {
        throw new Error('User already exists');
      }

      const result = await client.index({
        index: INDEX_NAME,
        id: userData.email, // Use email as document ID
        document: {
          ...userData,
          createdAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      throw error;
    }
  },

  async findUserByEmail(email) {
    try {
      const result = await client.get({
        index: INDEX_NAME,
        id: email,
      });
      return result._source;
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }
};

module.exports = userService;