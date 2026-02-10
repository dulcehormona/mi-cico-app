import { useEffect, useMemo, useState } from "react";
import { getAlertasPorDia } from "./sintomas";

/** Configuración básica del ciclo */
const DEFAULT_CYCLE_LENGTH = 35; // días
const PHASES = ["Menstrual", "Folicular", "Ovulatoria", "Lútea"];

/** Rangos estándar por día del ciclo (ajustables) */
function getPhaseFromDay(day, cycleLength = DEFAULT_CYCLE_LENGTH) {
  if (day <= 5) return "Menstrual";
  if (day <= 13) return "Folicular";
  if (day <= 16) return "Ovulatoria";
  if (day <= cycleLength) return "Lútea";
  return "Fuera de rango";
}

/** Día del ciclo = hoy - startDate + 1 */
function getCycleDay(startDateISO) {
  const ms = 24 * 60 * 60 * 1000;
  const start = new Date(startDateISO);
  const todayISO = new Date().toISOString().slice(0, 10);
  const today = new Date(todayISO);
  return Math.round((today - start) / ms) + 1;
}

/** LocalStorage helpers */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const LS_START_DATE = "miCiclo_startDate";
const LS_FOODS = "miCiclo_foods";

const STARTER_FOODS = [
  // MENSTRUAL
  { phase: "Menstrual", type: "Preferir", food: "Lentejas - Cereales Integrales", note: "Hierro" },
  { phase: "Menstrual", type: "Preferir", food: "Fruta seca", note: "Acidos grasos - Reducen la inflamación" },
  { phase: "Menstrual", type: "Preferir", food: "Cacao - Semillas", note: "Ricos en magnesio" },
  { phase: "Menstrual", type: "Preferir", food: "Kiwi - Naranjas - Pimentones", note: "Ricos en Vit. C" },
  { phase: "Menstrual", type: "Preferir", food: "Infusiones de Canela y Jengibre", note: "Ayudan a disminuir cólicos" },
  { phase: "Menstrual", type: "Limitar", food: "Alcohol y exceso de cafeína" },
  { phase: "Menstrual", type: "Limitar", food: "Carbohidratos simples - Azúcar" },
  { phase: "Menstrual", type: "Limitar", food: "Carnes rojas en exceso" },
  { phase: "Menstrual", type: "Limitar", food: "Ultraprocesados" },
  { phase: "Menstrual", type: "Limitar", food: "Sal en exceso" },



  // FOLICULAR
  { phase: "Folicular", type: "Preferir", food: "Verduras de hoja verde - Proteína de buena calidad", note: "Soporte metabólico" },
  { phase: "Folicular", type: "Preferir", food: "Carbohidratos Complejos", note: "Energía sostenida" },
  { phase: "Folicular", type: "Preferir", food: "Frutos rojos", note: "Antioxidantes" },
  { phase: "Folicular", type: "Preferir", food: "Infusiones Manzanilla - Meslisa", note: "Favorecen Relajación" },
  { phase: "Folicular", type: "Limitar", food: "Ultraprocesados" },
  { phase: "Folicular", type: "Limitar", food: "Azúcares simples" },
  { phase: "Folicular", type: "Limitar", food: "Harinas refinadas" },


  // OVULATORIA
  { phase: "Ovulatoria", type: "Preferir", food: "Verduras frescas - Crudas - Amargas", note: "Antioxidantes - Depuración metabólica" },
  { phase: "Ovulatoria", type: "Preferir", food: "Grasas Buenas", note: "Favorecen la producción de hormonas" },
  { phase: "Ovulatoria", type: "Preferir", food: "Semillas de Calabazas - Semillas de Sésamo - Legumbres", note: "Ricos en Zinc y Selenio" },
  { phase: "Ovulatoria", type: "Preferir", food: "Frutos Rojos", note: "Antioxidantes - Favorecen Calidad Ovulatoria" },
  { phase: "Ovulatoria", type: "Preferir", food: "Fibra Soluble", note: "Regulan Transito Intestinal" },
  { phase: "Ovulatoria", type: "Preferir", food: "Infusión Menta", note: "Favorece función Hepática" },
  { phase: "Ovulatoria", type: "Limitar", food: "Alcohol" },
  { phase: "Ovulatoria", type: "Limitar", food: "Frituras - Exceso de grasas saturadas" },
  { phase: "Ovulatoria", type: "Limitar", food: "Azúcares refinados" },


  // LÚTEA
  { phase: "Lútea", type: "Preferir", food: "Legumbres variadas", note: "Ricos en Hierro y Folatos" },
  { phase: "Lútea", type: "Preferir", food: "Cabohidratos Complejos de buena Calidad", note: "Energía Estable" },
  { phase: "Lútea", type: "Preferir", food: "Alimentos Fermentados", note: "Correcta Metabolización Hormonal" },
  { phase: "Lútea", type: "Preferir", food: "Infusion Toronjil", note: "Reguladora del Sistema ervioso" },
  { phase: "Lútea", type: "Limitar", food: "Ultraprocesados - Sal en exceso - Azúcares simples " },

];

export default function App() {
  // Fecha inicio periodo (la que usted introduce)
  const [startDate, setStartDate] = useState(() => localStorage.getItem(LS_START_DATE) || "");

  // Base de alimentos (editable por usted)
  const [foods, setFoods] = useState(() => loadJSON(LS_FOODS, STARTER_FOODS));

  // Formulario para añadir alimentos
  const [newPhase, setNewPhase] = useState("Menstrual");
  const [newType, setNewType] = useState("Preferir");
  const [newFood, setNewFood] = useState("");
  const [newNote, setNewNote] = useState("");

  // Guardar en localStorage cuando cambian
  useEffect(() => {
    if (startDate) localStorage.setItem(LS_START_DATE, startDate);
  }, [startDate]);

  useEffect(() => {
    saveJSON(LS_FOODS, foods);
  }, [foods]);

  const todayISO = new Date().toISOString().slice(0, 10);

  const info = useMemo(() => {
    if (!startDate) return null;
    const day = getCycleDay(startDate);
    const phase = getPhaseFromDay(day, DEFAULT_CYCLE_LENGTH);
    return { day, phase };
  }, [startDate]);

  const alertas = useMemo(() => {
    if (!info) return [];
    try {
      // Si getAlertasPorDia no existe, lanzará ReferenceError y será capturado aquí.
      return getAlertasPorDia(info.day, DEFAULT_CYCLE_LENGTH) || [];
    } catch (e) {
      console.error("Error en getAlertasPorDia:", e);
      return [];
    }
  }, [info]);

  const foodsForPhase = useMemo(() => {
    if (!info) return { preferir: [], limitar: [] };
    const list = foods.filter((f) => f.phase === info.phase);
    return {
      preferir: list.filter((f) => f.type === "Preferir"),
      limitar: list.filter((f) => f.type === "Limitar"),
    };
  }, [foods, info]);

  function addFood() {
    const trimmed = newFood.trim();
    if (!trimmed) return;

    setFoods((prev) => [
      ...prev,
      { phase: newPhase, type: newType, food: trimmed, note: newNote.trim() },
    ]);

    setNewFood("");
    setNewNote("");
  }

  function resetFoods() {
    setFoods(STARTER_FOODS);
  }

  function clearAll() {
    setStartDate("");
    localStorage.removeItem(LS_START_DATE);
    // Los alimentos se mantienen (si quiere borrar también, lo agregamos luego)
  }

  const appShell = {
    width: "min(720px, 92vw)",
    margin: "0 auto",
    padding: "16px 12px",
    textAlign: "center",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 8px 22px rgba(0,0,0,0.10)",
    backdropFilter: "blur(6px)",
  };

  const h2Style = {
    margin: "0 0 6px 0",
    fontSize: "clamp(18px, 4.5vw, 22px)",
    lineHeight: 1.15,
  };

  const pStyle = {
    margin: "0 0 12px 0",
    fontSize: "clamp(14px, 3.8vw, 16px)",
    lineHeight: 1.35,
    opacity: 0.85,
  };



  // ✅ ESTAS SON LAS VARIABLES QUE TE FALTABAN (SOLO ESTO ARREGLA LA PÁGINA EN BLANCO)
  const labelStyle = {
    display: "grid",
    gap: 6,
    textAlign: "center",
    justifyItems: "center",
    fontSize: 14,
    lineHeight: 1.25,
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.95)",
    outline: "none",
    fontSize: 16,
  };

  const btnPrimary = {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "#1f3a5f",
    color: "white",
    fontSize: 15,
    cursor: "pointer",
  };

  const h3Style = {
    margin: "0 0 8px 0",
    fontSize: 16,
    color: "#1f3a5f",
    letterSpacing: "0.2px",
  };

  const ulStyle = {
    margin: 0,
    paddingLeft: 18,
  };

  const liStyle = {
    marginBottom: 6,
    lineHeight: 1.25,
  };

  return (
    <div className="app-bg">
      <div className="app-overlay">
        <div style={appShell}>
          <h1
            style={{
              marginBottom: 6,
              fontFamily: "'Pacifico', cursive",
              color: "#1f3a5f",
              letterSpacing: "1px",
            }}
          >
            Control Hormonal Dulce
          </h1>

          <p style={{ marginTop: 0, opacity: 0.75 }}>
            Privado
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr", marginTop: 16 }}>
        {/*  Fecha inicio */}
        <section className="card">
          <h2 className="h2">Fecha de inicio del Ciclo </h2>
          <p style={pStyle}>Introduzca la fecha en la que le llegó la menstruazión (Día 1 del ciclo).</p>

          <label style={labelStyle}>
            Fecha de inicio
            <input
              type="date"
              value={startDate}
              max={todayISO}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={clearAll} style={btnPrimary}>
              Eliminar Fecha
            </button>
          </div>
        </section>

        {/*  Fase actual */}
        <section className="card" style={cardStyle}>
          <h2 style={h2Style}> ¿En qué fase del ciclo menstrual estoy actualmente?</h2>

          {!info ? (
            <p style={pStyle}>Ingrese una fecha de inicio para calcular su fase.</p>
          ) : (
            <>
              <p style={{ ...pStyle, fontSize: 18 }}>
                Hoy usted está en la fase: <b>{info.phase}</b>
              </p>

              <p style={pStyle}>
                Día del ciclo N.º <b>{info.day}</b> (Estimando un ciclo menstrual de {DEFAULT_CYCLE_LENGTH} días)
              </p>

              <div style={{ marginTop: 16 }}>
                <h3 style={{ marginBottom: 8 }}> Sugerencias para hoy </h3>

                {alertas.length === 0 ? (
                  <p style={{ opacity: 0.7 }}>Hoy no se prevén molestias relevantes.</p>
                ) : (
                  alertas.map((a, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <p style={{ marginBottom: 4 }}>
                        <b>{a.title}</b> <span style={{ opacity: 0.6 }}>({a.when})</span>
                      </p>

                      <h3
                        style={{
                          margin: "10px 0 6px 0",
                          textAlign: "center",
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        Posibles Molestias - Recomendaciones
                      </h3>

                      <p style={{ margin: "0 0 10px 0", textAlign: "center", opacity: 0.9 }}>
                        {a.symptoms.join(", ")}
                      </p>

                      <ul style={{ paddingLeft: 18, margin: 0 }}>
                        {a.tips.map((tip, j) => (
                          <li key={j}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>

        {/*  Alimentos por fase */}
        <section className="card" style={cardStyle}>
          <h2 style={h2Style}> Alimentos recomendados según su fase</h2>
          <p style={{ fontStyle: "italic", opacity: 0.8, marginBottom: 12 }}>
            Estos alimentos ayudan a mantener la energía y el equilibrio hormonal.
          </p>

          {!info ? (
            <p style={pStyle}>Primero introduzca la fecha de inicio del periodo.</p>
          ) : (
            <div className="twoCols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <h3 style={h3Style}>Preferir</h3>
                {foodsForPhase.preferir.length === 0 ? (
                  <p style={pStyle}>No hay alimentos cargados.</p>
                ) : (
                  <ul style={ulStyle}>
                    {foodsForPhase.preferir.map((f, idx) => (
                      <li key={idx} style={liStyle}>
                        <b>{f.food}</b>{" "}
                        {f.note ? <span style={{ opacity: 0.75 }}>· {f.note}</span> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 style={h3Style}>Limitar</h3>
                {foodsForPhase.limitar.length === 0 ? (
                  <p style={pStyle}>No hay alimentos cargados.</p>
                ) : (
                  <ul style={ulStyle}>
                    {foodsForPhase.limitar.map((f, idx) => (
                      <li key={idx} style={liStyle}>
                        <b>{f.food}</b>{" "}
                        {f.note ? <span style={{ opacity: 0.75 }}>· {f.note}</span> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

      </div>

      <footer style={{ marginTop: 18, opacity: 0.7, fontSize: 12 }}>
        Recomendación: si desea mayor precisión, la app puede calcular su promedio real cuando usted registre 3–6 ciclos.
      </footer>
    </div>
  );
}

/** Estilos */
