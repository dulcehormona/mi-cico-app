import { useEffect, useMemo, useState } from "react";
// import { getAlertasPorDia } from "./sintomas";


/** Configuración básica del ciclo */
const DEFAULT_CYCLE_LENGTH = 30; // días
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
  { phase: "Menstrual", type: "Preferir", food: "Lentejas", note: "hierro / energía" },
  { phase: "Menstrual", type: "Preferir", food: "Espinaca", note: "hierro / folatos" },
  { phase: "Menstrual", type: "Preferir", food: "Salmón", note: "omega-3" },
  { phase: "Menstrual", type: "Preferir", food: "Jengibre (infusión)", note: "antiinflamatorio" },
  { phase: "Menstrual", type: "Limitar", food: "Alcohol", note: "inflamación" },
  { phase: "Menstrual", type: "Limitar", food: "Azúcar alta", note: "picos / fatiga" },

  // FOLICULAR
  { phase: "Folicular", type: "Preferir", food: "Brócoli", note: "soporte metabólico" },
  { phase: "Folicular", type: "Preferir", food: "Avena", note: "energía sostenida" },
  { phase: "Folicular", type: "Preferir", food: "Frutos rojos", note: "antioxidantes" },

  // OVULATORIA
  { phase: "Ovulatoria", type: "Preferir", food: "Nueces", note: "grasas buenas" },
  { phase: "Ovulatoria", type: "Preferir", food: "Semillas de lino o chía", note: "omega-3 / fibra" },
  { phase: "Ovulatoria", type: "Preferir", food: "Vegetales variados", note: "antioxidantes" },

  // LÚTEA
  { phase: "Lútea", type: "Preferir", food: "Quinoa", note: "saciedad / minerales" },
  { phase: "Lútea", type: "Preferir", food: "Batata", note: "carbo complejo" },
  { phase: "Lútea", type: "Preferir", food: "Cacao puro", note: "magnesio" },
  { phase: "Lútea", type: "Limitar", food: "Ultraprocesados", note: "antojos / sal" },
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

  return (
    <div className="app-bg">
      <div className="app-overlay">
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 18, fontFamily: "system-ui" }}>
          <h1
            style={{
              marginBottom: 6,
              fontFamily: "'Pacifico', cursive",
              fontSize: 36,
              color: "#1f3a5f",
              letterSpacing: "1px",
            }}
          >
            Control Hormonal Dulce
          </h1>

          <p style={{ marginTop: 0, opacity: 0.75 }}>
            Privado · Sin nube · Datos solo en este dispositivo
          </p>
        </div>
      </div>




      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr", marginTop: 16 }}>
        {/*  Fecha inicio */}
        <section className="card" style={cardStyle}>
          <h2 style={h2Style}> Fecha de inicio del periodo</h2>
          <p style={pStyle}>Introduzca la fecha en la que le llegó el periodo (día 1 del ciclo).</p>

          <label style={labelStyle}>
            Fecha de inicio:
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
              Limpiar fecha
            </button>
          </div>
        </section>

        {/*  Fase actual */}
        <section className="card" style={cardStyle}>
          <h2 style={h2Style}> Su fase actual</h2>

          {!info ? (
            <p style={pStyle}>Ingrese una fecha de inicio para calcular su fase.</p>
          ) : (
            <>
              <p style={{ ...pStyle, fontSize: 18 }}>
                Hoy usted está en la fase: <b>{info.phase}</b>
              </p>

              {/* ✅ IMPORTANTE: el <div> ya NO está dentro de <p> */}
              <p style={pStyle}>
                Día del ciclo: <b>{info.day}</b> (estimado con ciclo de {DEFAULT_CYCLE_LENGTH} días)
              </p>

              <div style={{ marginTop: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Alertas y consejos del día</h3>

                {alertas.length === 0 ? (
                  <p style={{ opacity: 0.7 }}>Hoy no se prevén molestias relevantes.</p>
                ) : (
                  alertas.map((a, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <p style={{ marginBottom: 4 }}>
                        <b>{a.title}</b> <span style={{ opacity: 0.6 }}>({a.when})</span>
                      </p>

                      <p style={{ marginBottom: 6 }}>
                        <b>Posibles síntomas:</b> {a.symptoms.join(", ")}
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

              <p style={{ ...pStyle, opacity: 0.7 }}>
                Nota: este cálculo es orientativo. Luego podemos personalizar la duración de su ciclo y fases.
              </p>
            </>
          )}
        </section>

        {/*  Alimentos por fase */}
        <section className="card" style={cardStyle}>
          <h2 style={h2Style}> Alimentos recomendados según su fase</h2>
          <p style={{ fontStyle: "italic", opacity: 0.8, marginBottom: 12 }}>
            Estos alimentos ayudan a mantener la energía, la saciedad y el equilibrio hormonal.
          </p>

          {!info ? (
            <p style={pStyle}>Primero introduzca la fecha de inicio del periodo.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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

        {/*  Base de datos editable */}
        <section className="card" style={cardStyle}>
          <h2 style={h2Style}> Su base privada de alimentos (editable)</h2>
          <p style={pStyle}>Aquí usted añade o ajusta alimentos por fase. Quedan guardados solo en este dispositivo.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={labelStyle}>
              Fase:
              <select value={newPhase} onChange={(e) => setNewPhase(e.target.value)} style={inputStyle}>
                {PHASES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Tipo:
              <select value={newType} onChange={(e) => setNewType(e.target.value)} style={inputStyle}>
                <option value="Preferir">Preferir</option>
                <option value="Limitar">Limitar</option>
              </select>
            </label>

            <label style={labelStyle}>
              Alimento:
              <input
                value={newFood}
                onChange={(e) => setNewFood(e.target.value)}
                placeholder="Ej. sardinas, yogur, garbanzos..."
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Nota (opcional):
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ej. magnesio / antiinflamatorio"
                style={inputStyle}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={addFood} style={btnPrimary}>Añadir</button>
            <button onClick={resetFoods} style={btnPrimary}>Restablecer lista inicial</button>
          </div>
        </section>
      </div>

      <footer style={{ marginTop: 18, opacity: 0.7, fontSize: 12 }}>
        Recomendación: si desea mayor precisión, la app puede calcular su promedio real cuando usted registre 3–6 ciclos.
      </footer>
    </div>
  );
}

/** Estilos */
const cardStyle = {
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 14,
  padding: 14,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(4px)",
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  textAlign: "center",
};

const h2Style = {
  margin: "0 0 8px 0",
  fontSize: 22,
  fontFamily: "'Pacifico', cursive",
  color: "#1f3a5f",
};

const h3Style = {
  margin: "10px 0 6px 0",
  fontSize: 18,
  fontFamily: "'Pacifico', cursive",
  color: "#1f3a5f",
};

const pStyle = { margin: "6px 0" };
const labelStyle = { display: "flex", flexDirection: "column", gap: 6, fontSize: 14 };
const inputStyle = { padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" };
const ulStyle = { margin: 0, paddingLeft: 18 };
const liStyle = { marginBottom: 6 };

const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 12,
  border: 0,
  background: "#CFA7A2",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "rgba(255,255,255,0.9)",
  color: "#2F2A28",
  fontWeight: 600,
  cursor: "pointer",
};




