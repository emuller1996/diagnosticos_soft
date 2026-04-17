import elasticClient from '../config/elastic.js';

const INDEX_NAME = process.env.ELASTICSEARCH_INDEX || 'projects_index';

const projectService = {
  async createProject(projectData) {
    const project = {
      ...projectData,
      type: 'projects',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = await elasticClient.index({
      index: INDEX_NAME,
      body: project,
    });

    return { id: response._id, ...project };
  },

  async getProjectById(projectId) {
    try {
      const response = await elasticClient.get({
        index: INDEX_NAME,
        id: projectId,
      });

      if (!response.found) {
        return null;
      }

      const project = response._source;
      if (project.type !== 'projects' || !project.active) {
        return null;
      }

      return { id: response._id, ...project };
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  async updateProject(projectId, updateData) {
    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...updateData,
      type: 'projects',
      updatedAt: new Date().toISOString(),
    };

    await elasticClient.update({
      index: INDEX_NAME,
      id: projectId,
      body: {
        doc: updatedProject,
      },
    });

    return { id: projectId, ...project, ...updatedProject };
  },

  async inactivateProject(projectId) {
    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    await elasticClient.update({
      index: INDEX_NAME,
      id: projectId,
      body: {
        doc: {
          active: false,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return { id: projectId, ...project, active: false };
  },

  async listProjects({ page = 1, limit = 10, search = '' }) {
    const from = (page - 1) * limit;

    const mustClauses = [
      { term: { type: 'projects' } },
      { term: { active: true } },
    ];

    if (search) {
      mustClauses.push({
        multi_match: {
          query: search,
          fields: ['name', 'description'],
          fuzziness: 'AUTO',
        },
      });
    }

    const response = await elasticClient.search({
      index: INDEX_NAME,
      body: {
        from,
        size: limit,
        query: {
          bool: {
            must: mustClauses,
          },
        },
        sort: [{ createdAt: { order: 'desc' } }],
      },
    });

    const projects = response.hits.hits.map((hit) => ({
      id: hit._id,
      ...hit._source,
    }));

    const total = response.hits.total.value;

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getProjectStats() {
    const response = await elasticClient.search({
      index: INDEX_NAME,
      body: {
        size: 0,
        query: {
          term: { type: 'projects' },
        },
        aggs: {
          by_status: {
            terms: {
              field: 'active',
              size: 2,
            },
          },
        },
      },
    });

    const buckets = response.aggregations.by_status.buckets;
    let active = 0;
    let inactive = 0;

    buckets.forEach((bucket) => {
      if (bucket.key === 1 || bucket.key === true) {
        active = bucket.doc_count;
      } else {
        inactive = bucket.doc_count;
      }
    });

    return {
      total: active + inactive,
      active,
      inactive,
    };
  },
};

export default projectService;