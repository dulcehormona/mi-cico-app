/**
 * Devuelve una lista de "alertas" (sintomas + tips) para un día del ciclo.
 * Mantiene un formato estable para que App.jsx lo consuma sin cambios.
 */
export function getAlertasPorDia(day, cycleLength = 30) {
    // Seguridad: si el día no es válido, no devolvemos nada
    if (!Number.isFinite(day) || day < 1 || day > cycleLength) return [];

    // Rangos simples y coherentes con su lógica actual:
    // 1–5 Menstrual, 6–13 Folicular, 14–16 Ovulatoria, 17–cycleLength Lútea
    const isMenstrual = day <= 5;
    const isFolicular = day >= 6 && day <= 13;
    const isOvulatoria = day >= 14 && day <= 16;
    const isLutea = day >= 17 && day <= cycleLength;

    const alertas = [];

    if (isMenstrual) {
        alertas.push({
            title: "Mi cuerpo necesita descanso y mimos",
            when: `Del día 1 al día 7 - Hoy es tu día ${day}`,
            symptoms: ["Cólicos", "Cansancio", "Dolor lumbar", "Dolores de cabeza", "Molestia en los senos", "Inflamación"],
            tips: [
                "La prioridad es reponer el hierro y reducir la inflamación.",
                "Escucha a tu cuerpo y sé amable contigo.",
                "Mantén una hidratación constante y prioriza comidas templadas. Se recomienda reducir o eliminar las carnes rojas; puedes considerar una alimentación vegana durante estos días.",
                "Prioriza alimentos ricos en hierro, así como chocolate fondente, jengibre, zanahoria, manzanas y omega-3.",
                "En caso de dolor, prueba calor local, infusión de menta piperita, aceite de cannabis y descanso, ya que suelen aportar alivio.",
                "Realiza un masaje abdominal aromático y practica yoga u otras actividades con movimientos suaves.",
                "Si presentas flujo abundante, incluye alimentos ricos en hierro y acompáñalos con opciones que aporten vitamina C para mejorar su absorción.",
            ],
        });
    }

    if (isFolicular) {
        alertas.push({
            title: "Esta aumentando nuestra energía",
            when: `Del día 1 al día 13 - Hoy es tu día ${day}`,
            symptoms: ["¿Cómo me siento hoy?", "Mejor ánimo", "Mayor motivación"],
            tips: [
                "El objetivo es apoyar la energía, la digestón y la producción de estrógenos.",
                "Es un buen momento para crear hábitos saludables.",
                "¡Yupi! Estamos llenas de estrógeno; también aumenta la testosterona y, sí, te sientes más sexy.",
                "Mejora la calidad del sueño, podemos concentrarnos mejor y tenemos mayor capacidad para tomar decisiones. ¡Aprovéchalo!.",
                "Es un buen momento para planificar y entrenar ejercicios de fuerza.",
                "Da prioridad a la proteína y la fibra para mantener una energía sostenida.",
                "Puede que tengas menos apetito, pero prioriza verduras crucíferas como soporte metabólico.",
                "Recomendable hacer entrenamiento de fuerza.",
            ],
        });
    }

    if (isOvulatoria) {
        alertas.push({
            title: "Fase fértil - Posibilidad de embarazo",
            when: `Entre los días 14 y 18 - Hoy es tu día ${day}`,
            symptoms: ["Sensibilidad mamaria ligera", "Aumento de libido", "Flujo más elástico", "Dolor leve lateral"],
            tips: [
                "El objetivo es sostener el pico de energía y ayudar al higado a metabolizar hormonas.",
                "¿Sabías que este es el momento de mayor energía física y mental?.",
                "El cuerpo responde mejor al esfuerzo y se recupera con mayor facilidad.",
                "Nuestra biología evolutiva hace que, en esta fase, prestemos más atención a la búsqueda de pareja que a la comida. El cuerpo reconoce que es un momento óptimo para la reproducción, por lo que puede disminuir el apetito y aumentar la fuerza de voluntad..",
                "Aumentan el deseo sexual y la sensibilidad al placer, por lo que es posible experimentar orgasmos más intensos.",
                "El olor corporal (sudor y olor vaginal) puede volverse más atractivo para la pareja de forma natural.",
                "Es normal que las secreciones vaginales sean más abundantes y elásticas durante esta etapa.",
                "Aunque no siempre se perciba, la temperatura corporal aumenta ligeramente.",
                "Algunas mujeres pueden notar una leve molestia en uno de los ovarios, relacionada con la liberación del óvulo.",
                "Para mantener los niveles de energía equilibrados, se recomienda evitar los picos de insulina, priorizando proteínas, grasas saludables y carbohidratos complejos.",
            ],
        });
    }

    if (isLutea) {
        // Sub-rango para síntomas típicos premenstruales
        const nearPeriod = day >= cycleLength - 6; // últimos ~6 días

        alertas.push({
            title: nearPeriod ? "Mi cuerpo me avisa que la menstruación está por llegar!" : "Fase lútea",
            when: nearPeriod
                ? `Aprovecho esta energía ahora, sabiendo que pronto llegará la menstruación! - Hoy es tu día ${day}`
                : `Entre los días 14 y –${cycleLength} -Hoy es tu día ${day}`,
            symptoms: nearPeriod
                ? ["Antojos", "Irritabilidad", "Retención de líquidos", "Hinchazón"]
                : ["Más apetito", "Sueño más sensible", "Ligero malestar en los senos", "Posibles dolores de cabeza"],
            tips: [
                "El objetivo es estabilizar el ánimo, reducir antojos y favorecer la relajación",
                "Todo lo que ocurra en esta etapa dependerá de si hubo concepción o no.",
                "La progesterona aumenta y toma el control del panorama hormonal.",
                "En la primera fase de esta etapa puedes sentirte con mucha energía, en forma y con mayor deseo sexual.",
                "Los síntomas que estás sintiendo son un aviso de tu cuerpo (en caso de que lo hayas olvidado) de que la menstruación llegará pronto.",
                "Los dolores en el vientre se producen por las contracciones del útero, necesarias para que el revestimiento uterino comience a desprenderse.",
                "Durante la semana previa al periodo, es posible experimentar algunos síntomas como mayor antojo de dulces y carbohidratos, debido a una caída de la serotonina.",
            ],
        });
    }

    return alertas;
}


