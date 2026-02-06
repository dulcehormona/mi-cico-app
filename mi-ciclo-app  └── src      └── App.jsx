import { useEffect, useMemo, useState } from "react";

// ===================
// Utilità date
// ===================
function toISODate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function daysBetween(startISO, endDate = new Date()) {
    const start = new Date(startISO + "T00:00:00");
    const end = new Date(toISODate(endDate) + "T00:00:00");
    const ms = end.getTime() - start.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function phaseForDay(dayInCycle, periodLen, ovulationDay) {
    if (dayInCycle <= periodLen) return "Fase menstrual";
    if (dayInCycle === ovulationDay) return "Fase ovulatoria";
    if (dayInCycle < ovulationDay) return "Fase folicular";
    return "Fase lútea";
}

// ===================
// Salvataggio locale (privato)
// ===================
const STORAGE_KEY = "mi-ciclo-datos";

function leerDatos() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function guardarDatos(datos) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    } catch {
        // se lo storage è pieno o bloccato, non blocchiamo l'app
    }
}

// ===================
// Recomendaciones (generali)
// ===================
const RECS = {
    "Fase menstrual": {
        dieta:
            "Prioriza hierro e hidratación: legumbres, espinaca, proteínas (si consumes), cítricos, sopas y caldos. Reduce ultraprocesados y alcohol.",
        actividad:
            "Bajo impacto: caminar, estiramientos, yoga suave. Enfoque en descanso y recuperación.",
    },
    "Fase folicular": {
        dieta:
            "Energía en aumento: carbohidratos complejos + proteína: avena, arroz, patata, huevos/legumbres, verduras.",
        actividad:
            "Buen momento para progresar: fuerza técnica, cardio moderado, intervalos suaves.",
    },
    "Fase ovulatoria": {
        dieta:
            "Equilibrio y antioxidantes: frutas/verduras coloridas, omega-3 (pescado azul/nueces/semillas), fibra. Evita picos de azúcar.",
        actividad:
            "Rendimiento alto: fuerza, sesiones más intensas si te sientes bien (HIIT controlado).",
    },
    "Fase lútea": {
        dieta:
            "Estabilidad: proteína + fibra + grasas buenas. Magnesio/B6 (frutos secos, cacao amargo, plátano, legumbres). Reduce sal/azúcar si hay retención o antojos.",
        actividad:
            "Modera intensidad: fuerza moderada, pilates, cardio estable. Últimos días: más recuperación.",
    },
};

export default function App() {
    const hoyISO = toISODate(new Date());

    // Stato iniziale (valori di default)
    const [fechaUltimaRegla, setFechaUltimaRegla] = useState(hoyISO);
    const [duracionCiclo, setDuracionCiclo] = useState(28);
    const [duracionRegla, setDuracionRegla] = useState(5);
    const [duracionLutea, setDuracionLutea] = useState(14);

    // 1) Carica dati salvati (una sola volta)
    useEffect(() => {
        const datos = leerDatos();
        if (datos) {
            if (datos.fechaUltimaRegla) setFechaUltimaRegla(datos.fechaUltimaRegla);
            if (typeof datos.duracionCiclo === "number") setDuracionCiclo(datos.duracionCiclo);
            if (typeof datos.duracionRegla === "number") setDuracionRegla(datos.duracionRegla);
            if (typeof datos.duracionLutea === "number") setDuracionLutea(datos.duracionLutea);
        }
    }, []);

    // 2) Salva dati ad ogni modifica
    useEffect(() => {
        guardarDatos({
            fechaUltimaRegla,
            duracionCiclo,
            duracionRegla,
            duracionLutea,
        });
    }, [fechaUltimaRegla, duracionCiclo, duracionRegla, duracionLutea]);

    const resultado = useMemo(() => {
        const diff = daysBetween(fechaUltimaRegla);
        const diaCiclo = ((diff % duracionCiclo) + duracionCiclo) % duracionCiclo + 1; // 1..N
        const diaOvulacion = Math.max(1, duracionCiclo - duracionLutea); // stima semplice
        const fase = phaseForDay(diaCiclo, duracionRegla, diaOvulacion);

        const proxRegla = duracionCiclo - diaCiclo + 1;

        return {
            diaCiclo,
            diaOvulacion,
            fase,
            proxRegla,
            rec: RECS[fase],
        };
    }, [fechaUltimaRegla, duracionCiclo, duracionRegla, duracionLutea]);

    return (
        <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
            <h1 style={{ marginBottom: 6 }}>Control <Hormonal><Dulce></Dulc></Hormonal> (Privado)</h1>
            <p style={{ marginTop: 0, opacity: 0.75 }}>
                Datos guardados en tu dispositivo. Recomendaciones generales: no sustituyen consejo médico.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label>
                    Fecha de inicio de la última menstruación
                    <input
                        type="date"
                        value={fechaUltimaRegla}
                        onChange={(e) => setFechaUltimaRegla(e.target.value)}
                        style={{ width: "100%", padding: 10, marginTop: 6 }}
                    />
                </label>

                <label>
                    Duración promedio del ciclo (días)
                    <input
                        type="number"
                        min="20"
                        max="45"
                        value={duracionCiclo}
                        onChange={(e) => setDuracionCiclo(Number(e.target.value))}
                        style={{ width: "100%", padding: 10, marginTop: 6 }}
                    />
                </label>

                <label>
                    Duración de la menstruación (días)
                    <input
                        type="number"
                        min="2"
                        max="10"
                        value={duracionRegla}
                        onChange={(e) => setDuracionRegla(Number(e.target.value))}
                        style={{ width: "100%", padding: 10, marginTop: 6 }}
                    />
                </label>

                <label>
                    Duración fase lútea (días)
                    <input
                        type="number"
                        min="10"
                        max="16"
                        value={duracionLutea}
                        onChange={(e) => setDuracionLutea(Number(e.target.value))}
                        style={{ width: "100%", padding: 10, marginTop: 6 }}
                    />
                </label>
            </div>

            <div style={{ marginTop: 18, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
                <h2 style={{ marginTop: 0 }}>Estado actual</h2>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li><b>Día del ciclo:</b> {resultado.diaCiclo} / {duracionCiclo}</li>
                    <li><b>Ovulación estimada:</b> día {resultado.diaOvulacion}</li>
                    <li><b>Fase:</b> {resultado.fase}</li>
                    <li><b>Próxima menstruación (estimación):</b> en {resultado.proxRegla} días</li>
                </ul>
            </div>

            <div style={{ marginTop: 12, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
                <h2 style={{ marginTop: 0 }}>Recomendaciones</h2>
                <p style={{ marginBottom: 8 }}><b>Dieta:</b> {resultado.rec.dieta}</p>
                <p style={{ margin: 0 }}><b>Actividad física:</b> {resultado.rec.actividad}</p>
            </div>
        </div>
    );
}
