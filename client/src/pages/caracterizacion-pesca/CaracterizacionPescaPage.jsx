import { Add } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CaracterizacionPescaPage(second) {

  const navigate = useNavigate();

  return (
    <>
      <Box>
        <Button
          variant="contained"
          onClick={() => navigate("/dashboard/caracterizacion-pesca/nuevo")}
        >
          <Add /> Crear Caracterización
        </Button>
      </Box>
    </>
  );
}
