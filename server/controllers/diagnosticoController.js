import diagnosticoService from '../services/diagnosticoService.js';
import { saveCroquisAsWebP, deleteCroquisFile } from '../services/croquisService.js';
import { saveHuellaAsWebP, deleteHuellaFile } from '../services/huellaService.js';
import {
  saveAnexoFotoAsWebP,
  deleteAnexoFotoFile,
  nextFotoNumber,
} from '../services/anexoFotograficoService.js';

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

export const uploadCroquis = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ningún archivo de imagen.' });
    }

    const diag = await diagnosticoService.getById(req.params.id);
    const documento = diag.titular?.documento;

    const previousUrl = diag.levantamiento?.croquisUrl;
    const { url, sizeBytes } = await saveCroquisAsWebP(req.file.buffer, {
      documento,
      id: req.params.id,
    });

    if (previousUrl && previousUrl !== url) {
      await deleteCroquisFile(previousUrl);
    }

    const updated = await diagnosticoService.update(req.params.id, {
      levantamiento: { ...(diag.levantamiento || {}), croquisUrl: url, croquisSizeBytes: sizeBytes },
    });

    res.json(updated);
  } catch (error) {
    if (error.message === 'Diagnóstico no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const uploadHuella = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ningún archivo de imagen.' });
    }

    const diag = await diagnosticoService.getById(req.params.id);
    const documento = diag.titular?.documento;

    const previousUrl = diag.constanciaVisita?.huellaDigital;
    const { url, sizeBytes } = await saveHuellaAsWebP(req.file.buffer, {
      documento,
      id: req.params.id,
    });

    if (previousUrl && previousUrl !== url && previousUrl.startsWith('/uploads/')) {
      await deleteHuellaFile(previousUrl);
    }

    const updated = await diagnosticoService.update(req.params.id, {
      constanciaVisita: {
        ...(diag.constanciaVisita || {}),
        huellaDigital: url,
        huellaSizeBytes: sizeBytes,
      },
    });

    res.json(updated);
  } catch (error) {
    if (error.message === 'Diagnóstico no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const uploadAnexoFoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ningún archivo de imagen.' });
    }

    const diag = await diagnosticoService.getById(req.params.id);
    const key = diag.metadata?.consecutivoHogar || req.params.id;
    const fotos = diag.anexoFotografico?.fotos || [];
    const number = nextFotoNumber(fotos);
    const observaciones = (req.body?.observaciones || '').toString();

    const { url, sizeBytes } = await saveAnexoFotoAsWebP(req.file.buffer, {
      key,
      number,
    });

    const nextFotos = [...fotos, { url, observaciones, sizeBytes }];
    const updated = await diagnosticoService.update(req.params.id, {
      anexoFotografico: {
        ...(diag.anexoFotografico || {}),
        fotos: nextFotos,
      },
    });

    res.json(updated);
  } catch (error) {
    if (error.message === 'Diagnóstico no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteAnexoFoto = async (req, res) => {
  try {
    const diag = await diagnosticoService.getById(req.params.id);
    const fotos = diag.anexoFotografico?.fotos || [];
    const idx = parseInt(req.params.fotoIndex, 10);

    if (Number.isNaN(idx) || idx < 0 || idx >= fotos.length) {
      return res.status(400).json({ message: 'Índice de foto inválido.' });
    }

    const target = fotos[idx];
    if (target?.url) {
      await deleteAnexoFotoFile(target.url);
    }

    const nextFotos = fotos.filter((_, i) => i !== idx);
    const updated = await diagnosticoService.update(req.params.id, {
      anexoFotografico: {
        ...(diag.anexoFotografico || {}),
        fotos: nextFotos,
      },
    });

    res.json(updated);
  } catch (error) {
    if (error.message === 'Diagnóstico no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};