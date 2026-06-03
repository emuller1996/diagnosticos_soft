import client from "../config/elastic.js";

class CaracterizacionPescaService {
  constructor() {
    this.index = process.env.INDEX_ELASTIC;
  }

  async getAll() {
    const result = await client.search({
      index: this.index,
      query: {
        bool: {
          must: [{ term: { type: "caracterizacion_pesca" } }],
        },
      },
      sort: [{ createdAt: { order: "desc" } }],
    });

    return result.hits.hits.map((hit) => ({
      id: hit._id,
      ...hit._source,
    }));
  }

  async getById(id) {
    try {
      const result = await client.get({
        index: this.index,
        id: id,
      });
      return {
        id: result._id,
        ...result._source,
      };
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        throw new Error("Caracterización de pesca no encontrada");
      }
      throw error;
    }
  }

  async create(data) {
    const document = {
      ...data,
      type: "caracterizacion_pesca",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await client.index({
      index: this.index,
      document,
    });

    return {
      id: result._id,
      ...document,
    };
  }

  async update(id, data) {
    try {
      const result = await client.update({
        index: this.index,
        id: id,
        doc: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      });

      await client.indices.refresh({ index: this.index });
      const updatedDoc = await this.getById(id);
      return updatedDoc;
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        throw new Error("Caracterización de pesca no encontrada");
      }
      throw error;
    }
  }
}

export default new CaracterizacionPescaService();