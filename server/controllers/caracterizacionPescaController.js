import CaracterizacionPescaService from "../services/caracterizacionPescaService.js";

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
}

export default new CaracterizacionPescaController();