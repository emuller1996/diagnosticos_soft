import diagnosticoService from '../services/diagnosticoService.js';

export const getAllDiagnosticos = async (req, res) => {
  try {
    const diagnosticos = await diagnosticoService.getAll();
    res.json(diagnosticos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDiagnosticoById = async (req, res) => {
  try {
    const diagnostico = await diagnosticoService.getById(req.params.id);
    res.json(diagnostico);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createDiagnostico = async (req, res) => {
  try {
    const diagnostico = await diagnosticoService.create(req.body);
    res.status(201).json(diagnostico);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDiagnostico = async (req, res) => {
  try {
    const diagnostico = await diagnosticoService.update(req.params.id, req.body);
    res.json(diagnostico);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDiagnostico = async (req, res) => {
  try {
    await diagnosticoService.delete(req.params.id);
    res.json({ message: 'Diagnóstico eliminado correctamente' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const inactivateDiagnostico = async (req, res) => {
  try {
    const diagnostico = await diagnosticoService.inactivate(req.params.id);
    res.json(diagnostico);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};