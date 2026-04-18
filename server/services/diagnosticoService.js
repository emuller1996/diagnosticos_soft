import client from "../config/elastic.js";

class DiagnosticoService {
  constructor() {
    this.index = process.env.INDEX_ELASTIC;
  }

  async getAll() {
    const result = await client.search({
      index: this.index,
      query: {
        bool: {
          must: [{ term: { type: "diagnostics" } }],
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
        throw new Error("Diagnóstico no encontrado");
      }
      throw error;
    }
  }

  async create(data) {
    const result = await client.index({
      index: this.index,
      document: {
        ...data,
        type:"diagnostics",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    return {
      id: result._id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

      const updatedDoc = await this.getById(id);
      return updatedDoc;
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        throw new Error("Diagnóstico no encontrado");
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      await client.delete({
        index: this.index,
        id: id,
      });
      return { id };
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        throw new Error("Diagnóstico no encontrado");
      }
      throw error;
    }
  }

  async inactivate(id) {
    try {
      await client.update({
        index: this.index,
        id: id,
        doc: {
          estado: "inactivo",
          updatedAt: new Date().toISOString(),
        },
      });
      return await this.getById(id);
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        throw new Error("Diagnóstico no encontrado");
      }
      throw error;
    }
  }
}

export default new DiagnosticoService();
