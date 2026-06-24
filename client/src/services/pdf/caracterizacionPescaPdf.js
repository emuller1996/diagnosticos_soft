import PdfDocument from "./PdfDocument";
import { resolveStaticUrl } from '../apiClient';

/**
 * Helper para convertir una URL de imagen en DataURL (Base64)
 */
const fetchAsDataUrl = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

/**
 * Carga las imágenes de los anexos y las convierte a DataURL
 */
const hydrateAssets = async (data) => {
  const out = { ...data };
  const anexoFotos = data?.anexoFotografico?.fotos || [];
  
  if (anexoFotos.length) {
    out._anexoFotosDataUrls = await Promise.all(
      anexoFotos.map(async (foto) => {
        const url = foto?.url;
        if (!url) return null;
        try {
          return await fetchAsDataUrl(resolveStaticUrl(url));
        } catch (err) {
          console.warn('No se pudo cargar una foto del anexo para el PDF:', err);
          return null;
        }
      })
    );
  }
  return out;
};

/**
 * Genera el contenido del PDF de Caracterización de Pesca
 */
export const generateCaracterizacionPescaPdf = (data) => {
  const doc = new PdfDocument();

  // Helpers de mapeo comunes
  const siNoMapG = { 'si': 'SÍ', 'no': 'NO' };
  const multiToStr = (arr, list) =>
    (Array.isArray(arr) && arr.length)
      ? arr.map((v) => list[v] || v).join(', ')
      : "N/A";

  // 1. ENCABEZADO
  doc.title("FICHA INTEGRAL DE CARACTERIZACIÓN");
  doc.subtitle("Documento de registro técnico de caracterización territorial, socioeconómica, productiva y ambiental");

  doc.spacer(10);

  // MÓDULO 0: CONTROL DEL REGISTRO
  doc.sectionHeader("0. CONTROL DEL REGISTRO");
  doc.fieldRow([
    { label: "Código de encuesta:", value: data.codigoEncuesta || "N/A" },
    { label: "Fecha:", value: data.fechaRegistro || "N/A" },
    { label: "Hora:", value: data.horaRegistro || "N/A" },
  ]);
  doc.fieldRow([
    { label: "Encuestador:", value: data.encuestador || data.registradoPor || "N/A" },
    { label: "GPS (Lat, Lng):", value: (data.gpsLat || data.gpsLng) ? `${data.gpsLat || "?"}, ${data.gpsLng || "?"}` : "N/A" },
  ]);

  doc.spacer(10);

  // SECCIÓN 1: IDENTIFICACIÓN
  doc.sectionHeader("1. IDENTIFICACIÓN");

  const sexoMap = { 'M': 'Masculino', 'F': 'Femenino', 'otro': 'Otro' };

  doc.fieldRow([
    { label: "Nombre del Pescador:", value: data.nombrePescador },
    { label: "Documento:", value: data.documento },
  ]);
  doc.fieldRow([
    { label: "Consejo Comunitario:", value: data.consejoComunitario },
    { label: "Asociación:", value: data.asociacion },
  ]);
  doc.fieldRow([
    { label: "Comunidad / Vereda:", value: data.comunidad },
    { label: "Teléfono:", value: data.telefono },
  ]);
  doc.fieldRow([
    { label: "Sexo:", value: sexoMap[data.sexo] || data.sexo || "N/A" },
    { label: "Fecha de nacimiento:", value: data.fechaNacimiento || "N/A" },
  ]);

  doc.spacer(10);

  // SECCIÓN 2: COMPOSICIÓN DEL HOGAR
  doc.sectionHeader("2. COMPOSICIÓN DEL HOGAR");
  
  doc.subtitle(`Total de personas dependientes: ${data.totalPersonas || 0}`, { size: 10, color: [0, 0, 0] });
  doc.spacer(5);

  const columns = ["Categoría", "Cantidad"];
  const rows = [
    ["Niños (0-12 años)", data.ninios || 0],
    ["Jóvenes (13-17 años)", data.jovenes || 0],
    ["Adultos (18-59 años)", data.adultos || 0],
    ["Adultos Mayores (60+)", data.adultosMayores || 0],
    ["Hombres", data.hombres || 0],
    ["Mujeres", data.mujeres || 0],
    ["Personas con discapacidad", data.personasDiscapacidad || 0],
  ];
  
  doc.table(columns, rows);
  
  doc.spacer(10);
  const dieta = data.pescadoBaseAlimentacion === "si" ? "SÍ" : (data.pescadoBaseAlimentacion === "no" ? "NO" : "N/A");
  doc.subtitle(`¿El pescado es base de alimentación en su hogar?: ${dieta}`, { size: 10, color: [0, 0, 0] });

  doc.spacer(10);

  // SECCIÓN 3: ACTIVIDAD PESQUERA
  doc.sectionHeader("3. ACTIVIDAD PESQUERA");
  
  const expMap = {
    'menos5': 'Menos de 5 años',
    '5-10': '5-10 años',
    'mas10': 'Más de 10 años'
  };
  const pescaMap = {
    'mar': 'Mar adentro',
    'rio': 'Río/Estero',
    'ambos': 'Ambos'
  };

  doc.fieldRow([
    { label: "Años de experiencia:", value: expMap[data.anosExperiencia] || data.anosExperiencia || "N/A" },
    { label: "Tipo de pesca:", value: pescaMap[data.tipoPesca] || data.tipoPesca || "N/A" },
  ]);

  doc.spacer(10);

  // SECCIÓN 4: EMBARCACIÓN Y EQUIPO
  doc.sectionHeader("4. EMBARCACIÓN Y EQUIPO");
  
  const embMap = {
    'canoa': 'Canoa',
    'fibra': 'Fibra',
    'madera': 'Madera'
  };

    doc.fieldRow([
      { label: "Tipo de embarcación:", value: embMap[data.tipoEmbarcacion] || data.tipoEmbarcacion || "N/A" },
    ]);

    const estadoMap = { 'bueno': 'Bueno', 'regular': 'Regular', 'malo': 'Malo' };
    const siNoMap = { 'si': 'SÍ', 'no': 'NO' };

    doc.fieldRow([
      { label: "Estado embarcación:", value: estadoMap[data.estadoEmbarcacion] || data.estadoEmbarcacion || "N/A" },
      { label: "Tiene motor:", value: siNoMap[data.tieneMotor] || data.tieneMotor || "N/A" },
    ]);

    if (data.tieneMotor === 'si') {
      doc.fieldRow([
        { label: "HP Motor:", value: data.hpMotor || "N/A" },
        { label: "Estado Motor:", value: estadoMap[data.estadoMotor] || data.estadoMotor || "N/A" },
      ]);
    }

    const artesMap = { 'red': 'Red', 'anzuelo': 'Anzuelo / Línea', 'trasmallo': 'Trasmallo', 'atarraya': 'Atarraya', 'nasa': 'Nasa / Trampa', 'otro': 'Otro' };
    doc.fieldRow([
      { label: "Artes de pesca:", value: multiToStr(data.artesPesca, artesMap) },
    ]);

    doc.spacer(10);

    // SECCIÓN 5: PRODUCCIÓN (ESTIMADA)
    doc.sectionHeader("5. PRODUCCIÓN (ESTIMADA)");
    const capturaMap = { 'poco': 'Poco (<20 kg)', 'medio': 'Medio (20-50 kg)', 'alto': 'Alto (>50 kg)' };
    const diasMap = { '1-2': '1-2 días', '3-4': '3-4 días', '5+': '5 o más días' };

    doc.fieldRow([
      { label: "Captura por día:", value: capturaMap[data.capturaPorDia] || data.capturaPorDia || "N/A" },
      { label: "Días de pesca/semana:", value: diasMap[data.diasPescaSemana] || data.diasPescaSemana || "N/A" },
    ]);

    doc.spacer(10);

    // SECCIÓN 6: MANEJO DEL PESCADO
    doc.sectionHeader("6. MANEJO DEL PESCADO");
    const conservaMap = { 'hielo': 'Hielo', 'sal': 'Sal', 'no-conserva': 'No conserva' };
    const tiempoVentaMap = { 'mismo-dia': 'Mismo día', '1-dia': '1 día', 'mas-1-dia': 'Más de 1 día' };
    const perdidaMap = { 'mucha': 'Mucha', 'algo': 'Algo', 'muy-poca': 'Muy poca' };

    doc.fieldRow([
      { label: "Conservación:", value: conservaMap[data.conservaPescado] || data.conservaPescado || "N/A" },
      { label: "Tiempo antes venta:", value: tiempoVentaMap[data.tiempoAntesVender] || data.tiempoAntesVender || "N/A" },
    ]);
    doc.fieldRow([
      { label: "Pérdida de pescado:", value: perdidaMap[data.perdidaPescado] || data.perdidaPescado || "N/A" },
    ]);

    doc.spacer(10);

    // SECCIÓN 7: COMERCIALIZACIÓN
    doc.sectionHeader("7. COMERCIALIZACIÓN");
    const ventaMap = { 
      'asociacion': 'Asociación', 
      'consejo-comunitario': 'Consejo Comunitario', 
      'comunidad-local': 'Comunidad Local', 
      'intermediario': 'Intermediario', 
      'buenaventura': 'Buenaventura' 
    };

    doc.fieldRow([
      { label: "Venta principal:", value: ventaMap[data.ventaPrincipal] || data.ventaPrincipal || "N/A" },
    ]);

    if (data.ventaPrincipal === 'buenaventura') {
      doc.spacer(5);
      doc.subtitle("Detalles transporte a Buenaventura:", { size: 9, color: [0, 0, 0] });
      
      const transMap = { 'lancha': 'Lancha', 'bote-propio': 'Bote propio', 'transporte-contratado': 'Transporte contratado', 'otro': 'Otro' };
      const tTiempoMap = { 'menos-2h': 'Menos de 2 horas', '2-5h': '2-5 horas', 'mas-5h': 'Más de 5 horas' };
      const probMap = { 'bajo-precio': 'Bajo precio', 'transporte': 'Transporte', 'se-daña': 'Se daña el pescado', 'intermediarios': 'Intermediarios', 'otro': 'Otro' };

      doc.fieldRow([
        { label: "Medio transporte:", value: transMap[data.medioTransporte] || data.medioTransporte || "N/A" },
        { label: "Tiempo transporte:", value: tTiempoMap[data.tiempoTransporte] || data.tiempoTransporte || "N/A" },
      ]);
      doc.fieldRow([
        { label: "Problemas principales:", value: probMap[data.problemasPrincipales] || data.problemasPrincipales || "N/A" },
      ]);
      if (data.otroMedioTransporte) {
        doc.fieldRow([{ label: "Otro medio:", value: data.otroMedioTransporte }]);
      }
      if (data.otroProblema) {
        doc.fieldRow([{ label: "Otro problema:", value: data.otroProblema }]);
      }
    }

    doc.spacer(10);

    // SECCIÓN 8: NECESIDADES PRIORITARIAS
    doc.sectionHeader("8. NECESIDADES PRIORITARIAS");
    const needsList = [
      { value: "embarcacion", label: "Embarcación" },
      { value: "motor", label: "Motor" },
      { value: "equipos-pesca", label: "Equipos de pesca" },
      { value: "sistema-frio", label: "Sistema de frío" },
      { value: "transporte", label: "Transporte" },
      { value: "capacitacion", label: "Capacitación" },
      { value: "comercializacion", label: "Comercialización" },
    ];

    const selectedNeeds = (data.necesidadesPrioritarias || []).map(val => ({
      label: needsList.find(n => n.value === val)?.label || val,
      checked: true
    })).concat(
      needsList.filter(n => !(data.necesidadesPrioritarias || []).includes(n.value)).map(n => ({
        label: n.label,
        checked: false
      }))
    );

    doc.checkboxList(selectedNeeds, { title: "Necesidades identificadas:" });

    doc.spacer(10);

    // SECCIÓN 9: INTEGRANTES DEL HOGAR
    doc.sectionHeader("9. INTEGRANTES DEL HOGAR");
    const integrantes = Array.isArray(data.integrantesHogar) ? data.integrantesHogar : [];
    if (integrantes.length > 0) {
      const escMap = { 'ninguna': 'Ninguna', 'primaria': 'Primaria', 'secundaria': 'Secundaria', 'tecnica': 'Técnica', 'universitaria': 'Universitaria' };
      doc.table(
        ["Nombre", "Edad", "Parentesco", "Escolaridad", "Ocupación"],
        integrantes.map((it) => [
          it.nombre || "", it.edad || "", it.parentesco || "",
          escMap[it.escolaridad] || it.escolaridad || "", it.ocupacion || "",
        ])
      );
    } else {
      doc.subtitle("Sin integrantes registrados.", { size: 9, color: [0, 0, 0] });
    }

    doc.spacer(10);

    // SECCIÓN 10: CONDICIONES SOCIOECONÓMICAS
    doc.sectionHeader("10. CONDICIONES SOCIOECONÓMICAS");
    const ingresoMap = { 'menos-1-salario': 'Menos de 1 salario mínimo', '1-salario': '≈ 1 salario mínimo', 'mas-1-salario': 'Más de 1 salario mínimo', 'sin-ingreso-fijo': 'Sin ingreso fijo' };
    const sisbenMap = { 'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'no-tiene': 'No tiene' };
    doc.fieldRow([
      { label: "Ingreso mensual:", value: ingresoMap[data.ingresoMensual] || data.ingresoMensual || "N/A" },
      { label: "Grupo SISBÉN:", value: sisbenMap[data.sisben] || data.sisben || "N/A" },
    ]);
    doc.fieldRow([
      { label: "¿Víctima del conflicto?:", value: siNoMapG[data.victimaConflicto] || data.victimaConflicto || "N/A" },
      { label: "Actividad económica:", value: data.actividadEconomica || "N/A" },
    ]);

    doc.spacer(10);

    // SECCIÓN 11: VIVIENDA
    doc.sectionHeader("11. VIVIENDA");
    const tipoViviendaMap = { 'propia': 'Propia', 'arrendada': 'Arrendada', 'familiar': 'Familiar', 'invasion': 'Posesión / Invasión' };
    const materialViviendaMap = { 'madera': 'Madera', 'cemento': 'Cemento / Bloque', 'mixta': 'Mixta', 'otro': 'Otro' };
    const serviciosMap = { 'energia': 'Energía', 'acueducto': 'Acueducto', 'alcantarillado': 'Alcantarillado', 'gas': 'Gas', 'internet': 'Internet', 'ninguno': 'Ninguno' };
    doc.fieldRow([
      { label: "Tipo de vivienda:", value: tipoViviendaMap[data.tipoVivienda] || data.tipoVivienda || "N/A" },
      { label: "Material predominante:", value: materialViviendaMap[data.materialesVivienda] || data.materialesVivienda || "N/A" },
    ]);
    doc.fieldRow([
      { label: "Servicios disponibles:", value: multiToStr(data.serviciosVivienda, serviciosMap) },
    ]);

    doc.spacer(10);

    // SECCIÓN 12: UBICACIÓN, PREDIO Y TENENCIA
    doc.sectionHeader("12. UBICACIÓN, PREDIO Y TENENCIA");
    const accesoMap = { 'terrestre': 'Terrestre', 'fluvial': 'Fluvial', 'maritimo': 'Marítimo', 'mixto': 'Mixto' };
    const posesionMap = { 'propietario': 'Propietario', 'poseedor': 'Poseedor', 'ocupante': 'Ocupante', 'colectivo': 'Territorio colectivo' };
    doc.fieldRow([
      { label: "GPS (Lat, Lng):", value: (data.predioGpsLat || data.predioGpsLng) ? `${data.predioGpsLat || "?"}, ${data.predioGpsLng || "?"}` : "N/A" },
      { label: "Área (ha):", value: data.predioArea || "N/A" },
      { label: "Altitud (msnm):", value: data.predioAltitud || "N/A" },
    ]);
    doc.fieldRow([
      { label: "Acceso:", value: accesoMap[data.predioAcceso] || data.predioAcceso || "N/A" },
      { label: "Posesión:", value: posesionMap[data.predioPosesion] || data.predioPosesion || "N/A" },
    ]);
    doc.fieldRow([
      { label: "Uso tradicional:", value: siNoMapG[data.predioUsoTradicional] || data.predioUsoTradicional || "N/A" },
      { label: "¿Por herencia?:", value: siNoMapG[data.predioHerencia] || data.predioHerencia || "N/A" },
    ]);

    doc.spacer(10);

    // SECCIÓN 13: SISTEMAS PRODUCTIVOS
    doc.sectionHeader("13. SISTEMAS PRODUCTIVOS");
    const sistemasList = [
      { value: "coco", label: "Coco" },
      { value: "cacao", label: "Cacao" },
      { value: "platano", label: "Plátano" },
      { value: "pesca", label: "Pesca" },
      { value: "piscicultura", label: "Piscicultura" },
      { value: "otro", label: "Otro" },
    ];
    const selectedSistemas = (data.sistemasProductivos || []);
    doc.checkboxList(
      sistemasList.map((s) => ({ label: s.label, checked: selectedSistemas.includes(s.value) })),
      { title: "Sistemas productivos del hogar:" }
    );

    doc.spacer(10);

    // SECCIÓN 14: CULTIVOS
    doc.sectionHeader("14. CULTIVOS");
    const cultivos = Array.isArray(data.cultivos) ? data.cultivos : [];
    if (cultivos.length > 0) {
      doc.table(
        ["Cultivo", "Área (ha)", "Producción", "Rendimiento", "Ingresos ($)"],
        cultivos.map((c) => [
          c.nombreCultivo || "", c.area || "", c.produccion || "", c.rendimiento || "", c.ingresos || "",
        ])
      );
    } else {
      doc.subtitle("Sin cultivos registrados.", { size: 9, color: [0, 0, 0] });
    }

    doc.spacer(10);

    // SECCIÓN 15: COMERCIALIZACIÓN GENERAL
    doc.sectionHeader("15. COMERCIALIZACIÓN GENERAL");
    const canalMap = { 'directo': 'Venta directa', 'intermediario': 'Intermediario', 'asociacion': 'Asociación', 'mercado': 'Mercado / Plaza' };
    doc.fieldRow([
      { label: "Compradores:", value: data.compradores || "N/A" },
      { label: "Precio promedio ($):", value: data.precioPromedio || "N/A" },
      { label: "Canal comercial:", value: canalMap[data.canalComercial] || data.canalComercial || "N/A" },
    ]);

    doc.spacer(10);

    // SECCIÓN 16: AMBIENTE Y RIESGO
    doc.sectionHeader("16. AMBIENTE Y RIESGO");
    doc.fieldRow([
      { label: "Riesgo de inundación:", value: siNoMapG[data.riesgoInundacion] || data.riesgoInundacion || "N/A" },
      { label: "Riesgo de erosión:", value: siNoMapG[data.riesgoErosion] || data.riesgoErosion || "N/A" },
    ]);
    doc.fieldRow([
      { label: "¿Hay manglar?:", value: siNoMapG[data.tieneManglar] || data.tieneManglar || "N/A" },
      { label: "¿Hay bosque?:", value: siNoMapG[data.tieneBosque] || data.tieneBosque || "N/A" },
    ]);

    doc.spacer(10);

    // SECCIÓN 17: PARTICIPACIÓN Y GOBERNANZA
    doc.sectionHeader("17. PARTICIPACIÓN Y GOBERNANZA");
    doc.fieldRow([
      { label: "¿Participa en asambleas?:", value: siNoMapG[data.participaAsamblea] || data.participaAsamblea || "N/A" },
      { label: "¿Participa en comités?:", value: siNoMapG[data.participaComite] || data.participaComite || "N/A" },
      { label: "¿Pertenece a asociación?:", value: siNoMapG[data.perteneceAsociacion] || data.perteneceAsociacion || "N/A" },
    ]);

    doc.spacer(10);

    // SECCIÓN 18: NECESIDADES DE INVERSIÓN
    doc.sectionHeader("18. NECESIDADES DE INVERSIÓN");
    const inversionList = [
      { value: "coco", label: "Coco" },
      { value: "vivienda", label: "Vivienda" },
      { value: "energia", label: "Energía" },
      { value: "agua", label: "Agua" },
      { value: "fortalecimiento", label: "Fortalecimiento organizativo" },
      { value: "otro", label: "Otro" },
    ];
    const selectedInversion = (data.necesidadesInversion || []);
    doc.checkboxList(
      inversionList.map((s) => ({ label: s.label, checked: selectedInversion.includes(s.value) })),
      { title: "Necesidades de inversión identificadas:" }
    );

    doc.spacer(10);

    // SECCIÓN 19: ANEXOS FOTOGRÁFICOS
    const fotos = data.anexoFotografico?.fotos || [];
    if (fotos.length > 0) {
      doc.sectionHeader("19. ANEXOS FOTOGRÁFICOS");
      doc.spacer(5);

      const dataUrls = data._anexoFotosDataUrls || [];
      const gap = 4;
      const colW = (doc.contentWidth - gap) / 2;
      const imgH = 55; // altura del área de imagen
      const headerBarH = 6;
      const obsBoxH = 16;
      const blockH = headerBarH + imgH + obsBoxH + 4; // alto total de cada foto

      for (let i = 0; i < fotos.length; i += 2) {
        doc.ensureSpace(blockH);
        const rowY = doc.cursorY;

        for (let col = 0; col < 2; col++) {
          const idx = i + col;
          if (idx >= fotos.length) break;
          const foto = fotos[idx];
          const dataUrl = dataUrls[idx];
          const x = doc.marginX + col * (colW + gap);

          // Header "FOTOGRAFÍA N"
          doc.doc.setFillColor(...doc.config.headerFill);
          doc.doc.rect(x, rowY, colW, headerBarH, 'F');
          doc.doc.setTextColor(...doc.config.headerText);
          doc.doc.setFont('helvetica', 'bold');
          doc.doc.setFontSize(8);
          doc.doc.text(`FOTOGRAFÍA ${idx + 1}`, x + 2, rowY + 4.2);
          doc.doc.setTextColor(0);

          // Imagen
          const imgY = rowY + headerBarH;
          doc.doc.setDrawColor(180);
          doc.doc.setLineWidth(0.2);
          doc.doc.rect(x, imgY, colW, imgH);

          if (dataUrl) {
            try {
              const props = doc.doc.getImageProperties(dataUrl);
              const aspect = props.width / props.height;
              let drawW = colW - 2;
              let drawH = drawW / aspect;
              if (drawH > imgH - 2) {
                drawH = imgH - 2;
                drawW = drawH * aspect;
              }
              const dx = x + (colW - drawW) / 2;
              const dy = imgY + (imgH - drawH) / 2;
              doc.doc.addImage(dataUrl, 'WEBP', dx, dy, drawW, drawH);
            } catch (err) {
              console.warn('No se pudo embeber la foto en el PDF de pesca:', err);
            }
          }

          // Recuadro de observaciones
          const obsY = imgY + imgH;
          doc.doc.setFont('helvetica', 'bold');
          doc.doc.setFontSize(7);
          doc.doc.text('OBSERVACIONES:', x + 1, obsY + 3);
          doc.doc.setDrawColor(180);
          doc.doc.rect(x, obsY, colW, obsBoxH);
          doc.doc.setFont('helvetica', 'normal');
          doc.doc.setFontSize(8);
          const obsText = String(foto?.observaciones || '');
          const wrapped = doc.doc.splitTextToSize(obsText, colW - 2);
          doc.doc.text(wrapped, x + 1, obsY + 7);
        }

        doc.cursorY = rowY + blockH;
      }
    }

    // SECCIÓN DE FIRMAS
    doc.spacer(15);
    doc.sectionHeader("FIRMAS");
    doc.spacer(10);

    const sigW = 70;
    const sigH = 30;
    const gapSig = 20;
    const startX = doc.marginX;

    // Firma Titular
    doc.doc.setFont('helvetica', 'bold');
    doc.doc.setFontSize(9);
    doc.doc.text("Firma del Titular:", startX, doc.cursorY);
    
    doc.doc.setDrawColor(180);
    doc.doc.rect(startX, doc.cursorY + 2, sigW, sigH);
    
    if (data.firmaTitular) {
      try {
        doc.doc.addImage(data.firmaTitular, 'PNG', startX + 2, doc.cursorY + 4, sigW - 4, sigH - 4);
      } catch (e) {
        console.warn("Error al añadir firma titular al PDF:", e);
      }
    }

    // Firma Profesional
    const profX = startX + sigW + gapSig;
    doc.doc.setFont('helvetica', 'bold');
    doc.doc.setFontSize(9);
    doc.doc.text("Firma del Profesional:", profX, doc.cursorY);
    
    doc.doc.setDrawColor(180);
    doc.doc.rect(profX, doc.cursorY + 2, sigW, sigH);
    
    if (data.firmaProfesional) {
      try {
        doc.doc.addImage(data.firmaProfesional, 'PNG', profX + 2, doc.cursorY + 4, sigW - 4, sigH - 4);
      } catch (e) {
        console.warn("Error al añadir firma profesional al PDF:", e);
      }
    }

    doc.cursorY += sigH + 15;

    return doc;
};

/**
 * Función principal para descargar el PDF
 */
export const downloadCaracterizacionPescaPdf = async (data, filename) => {
  const id = data?.id || 'documento';
  const name = filename || `caracterizacion-pesca-${id}.pdf`;

  const previewWindow = window.open('', '_blank');

    try {
      const hydrated = await hydrateAssets(data);
      const doc = generateCaracterizacionPescaPdf(hydrated);
      const blobUrl = doc.doc.output('bloburl');

      if (previewWindow && !previewWindow.closed) {
        previewWindow.location.href = blobUrl;
      } else {
        doc.save(name);
      }
    } catch (err) {
    if (previewWindow && !previewWindow.closed) previewWindow.close();
    throw err;
  }
};