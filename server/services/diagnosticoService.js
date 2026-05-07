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

  async getNextConsecutivoNumber() {
    await client.indices.refresh({ index: this.index });
    const { count } = await client.count({
      index: this.index,
      query: { term: { type: "diagnostics" } },
    });
    return count + 1;
  }

  async create(data) {
    const next = await this.getNextConsecutivoNumber();
    const fecha = data?.metadata?.fechaDiligenciamiento || new Date().toISOString().slice(0, 10);
    const yyyymmdd = String(fecha).replace(/-/g, '');
    const consecutivoHogar = `GPV-${yyyymmdd}-${String(next).padStart(4, '0')}`;

    const document = {
      ...data,
      type: "diagnostics",
      metadata: {
        ...(data.metadata || {}),
        consecutivoNumber: next,
        consecutivoHogar,
      },
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

      await client.indices.refresh({ index:this.index });
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
