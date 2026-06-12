import CaracterizacionPescaService from "../services/caracterizacionPescaService.js";
import {
  saveAnexoFotoAsWebP,
  deleteAnexoFotoFile,
  nextFotoNumber,
} from '../services/anexoFotograficoService.js';

class CaracterizacionPescaController {
  async getAll(req, res) {
    try {
      const data = await CaracterizacionPescaService.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message || "Error al obtener la caracterización de pesca" });
    }
  }

  async create(req, res) {
    try {
      const data = await CaracterizacionPescaService.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message || "Error al crear la caracterización de pesca" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = await CaracterizacionPescaService.update(id, req.body);
      res.json(data);
    } catch (error) {
      const status = error.message.includes("no encontrada") ? 404 : 500;
      res.status(status).json({ message: error.message || "Error al actualizar la caracterización de pesca" });
    }
  }

  async uploadAnexoFoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se envió ningún archivo de imagen.' });
      }

      const carac = await CaracterizacionPescaService.getById(req.params.id);
      const key = carac.documento || req.params.id;
      const fotos = carac.anexoFotografico?.fotos || [];
      const number = nextFotoNumber(fotos);
      const observaciones = (req.body?.observaciones || '').toString();

		const { url, sizeBytes } = await saveAnexoFotoAsWebP(req.file.buffer, {
			key,
			number,
			rootPath: 'uploads/pesca',
			publicPrefix: '/uploads/pesca',
		});

      const nextFotos = [...fotos, { url, observaciones, sizeBytes }];
      const updated = await CaracterizacionPescaService.update(req.params.id, {
        anexoFotografico: {
          ...(carac.anexoFotografico || {}),
          fotos: nextFotos,
        },
      });

      res.json(updated);
    } catch (error) {
      if (error.message === 'Caracterización no encontrada') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async deleteAnexoFoto(req, res) {
    try {
      const carac = await CaracterizacionPescaService.getById(req.params.id);
      const fotos = carac.anexoFotografico?.fotos || [];
      const idx = parseInt(req.params.fotoIndex, 10);

      if (Number.isNaN(idx) || idx < 0 || idx >= fotos.length) {
        return res.status(400).json({ message: 'Índice de foto inválido.' });
      }

      const target = fotos[idx];
      if (target?.url) {
        await deleteAnexoFotoFile(target.url);
      }

      const nextFotos = fotos.filter((_, i) => i !== idx);
      const updated = await CaracterizacionPescaService.update(req.params.id, {
        anexoFotografico: {
          ...(carac.anexoFotografico || {}),
          fotos: nextFotos,
        },
      });

      res.json(updated);
    } catch (error) {
      if (error.message === 'Caracterización no encontrada') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
}

export default new CaracterizacionPescaController();