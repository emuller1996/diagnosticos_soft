import projectService from '../services/projectService.js';

const projectController = {
  async createProject(req, res) {
    try {
      const { name, description,project_type, community, city } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Project name is required' });
      }

      const projectData = {
        name,
        description: description || '',
        project_type: project_type || 'No Type',
        community: community || '',
        city: city || '',
        createdBy: req.user.id,
      };

      const project = await projectService.createProject(projectData);
      res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  async getProjectById(req, res) {
    try {
      const { projectId } = req.params;
      const project = await projectService.getProjectById(projectId);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.status(200).json({ project });
    } catch (error) {
      console.error('Error getting project:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  async updateProject(req, res) {
    try {
      const { projectId } = req.params;
      const { name, description, project_type, community, city } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (project_type !== undefined) updateData.project_type = project_type;
      if (community !== undefined) updateData.community = community;
      if (city !== undefined) updateData.city = city;

      const project = await projectService.updateProject(projectId, updateData);
      res.status(200).json({ message: 'Project updated successfully', project });
    } catch (error) {
      console.error('Error updating project:', error);
      if (error.message === 'Project not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  async inactivateProject(req, res) {
    try {
      const { projectId } = req.params;
      const project = await projectService.inactivateProject(projectId);
      res.status(200).json({ message: 'Project inactivated successfully', project });
    } catch (error) {
      console.error('Error inactivating project:', error);
      if (error.message === 'Project not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  async listProjects(req, res) {
    try {
      const { page, limit, search } = req.query;

      const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        search: search || '',
      };

      const result = await projectService.listProjects(options);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error listing projects:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await projectService.getStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error getting project stats:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },
};

export default projectController;