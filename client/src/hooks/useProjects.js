import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectService.list({
        page,
        search,
        limit: 10
      });
      setProjects(data.projects);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error fetching projects');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data) => {
    const newProject = await projectService.create(data);
    await fetchProjects();
    return newProject;
  };

  const updateProject = async (id, data) => {
    const updatedProject = await projectService.update(id, data);
    await fetchProjects();
    return updatedProject;
  };

  const deleteProject = async (id) => {
    await projectService.delete(id);
    await fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    total,
    page,
    setPage,
    search,
    setSearch,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  };
};