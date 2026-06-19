import client from '../config/elastic.js';
import bcrypt from 'bcrypt';

const INDEX_NAME = process.env.INDEX_ELASTIC;

const userService = {
  async createUser(userData) {
    try {
      // Check if user already exists by email/username
      const { exists } = await client.exists({ index: INDEX_NAME, id: userData.email });
      if (exists) {
        throw new Error('User already exists');
      }

      // Hash password before saving
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const userToSave = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        type: "user"
      };

      const result = await client.index({
        index: INDEX_NAME,
        id: userData.email, // Use email as document ID
        document: userToSave,
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
  },

  async findUsers({ page = 1, limit = 10, search = '' }) {
    try {
      const from = (page - 1) * limit;
      
      const query = {
        bool: {
          filter: [
            { term: { type: 'user' } }
          ]
        }
      };

      if (search) {
      // Normalizar búsqueda a minúsculas
      const searchLower = search.toLowerCase();
      
      query.bool.must = [
        {
          bool: {
            should: [
              {
                wildcard: {
                  name: {
                    value: `*${searchLower}*`,
                    case_insensitive: true // Elasticsearch 7.10+
                  }
                }
              },
              {
                wildcard: {
                  email: {
                    value: `*${searchLower}*`,
                    case_insensitive: true
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        }
      ];
    }

      const result = await client.search({
        index: INDEX_NAME,
        from,
        size: limit,
        query
      });
      

      return {
        total: result.hits.total.value,
        users: result.hits.hits.map(hit => hit._source)
      };
    } catch (error) {
      throw error;
    }
  }
};

export default userService;