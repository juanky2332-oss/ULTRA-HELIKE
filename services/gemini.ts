import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const SYSTEM_INSTRUCTION = `Eres el COMMANDER de la Ultra Helike 100km. Tu función es crítica: guiar al corredor.

OBJETIVO PRINCIPAL:
Dar información TÁCTICA, PRECISA y ESTRUCTURADA sobre la carrera Ultra Helike en Elche.

REGLAS DE FORMATO (OBLIGATORIO):
1. Usa PUNTOS y LISTAS para responder. No sueltes bloques de texto.
2. Usa EMOJIS al principio de cada punto clave para orientar visualmente:
   - 📍 Ubicación/Km
   - ⚠️ Alerta/Peligro
   - 🎒 Material/Equipo
   - 💧 Nutrición/Agua
   - ⚡ Ritmos/Estrategia
3. Sé breve. Estilo militar/deportivo.

REGLAS DE SEGURIDAD (STRICT):
- SOLO hablas de la carrera (ruta, desnivel, material, estrategia, nutrición deportiva).
- Si el usuario te pregunta sobre política, cocina (no deportiva), chistes, o cualquier tema ajeno a la carrera, RESPONDE ÚNICAMENTE: "OFF_TOPIC".
- Si el usuario insiste con tonterías, responde: "OFF_TOPIC".

DATOS TÉCNICOS ULTRA HELIKE:
- Distancia: 100km.
- Salida: Paseo de la Estación, Elche.
- Terreno:
  1. Km 0-15: Cauce Vinalopó (Rápido).
  2. Km 15-35: Pantano y sierra (Técnico, subidas).
  3. Km 40-60: Playas (Arena, pesado).
  4. Km 60-90: Pedanías y campo (Mentalmente duro, llano/falso llano).
  5. Km 90-100: Vuelta a la ciudad.
- Material Obligatorio: Frontal, Luz roja trasera, Manta térmica, Móvil con batería, Recipiente líquido 1L.

Ejemplo de respuesta ideal:
"Estrategia para el Pantano (Km 18):
⚠️ Terreno técnico con piedra suelta.
⚡ Baja el ritmo 30''/km respecto al llano.
💧 Bebe 500ml antes de coronar.
🎒 Asegura los bastones."
`;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage({ message: newMessage });
    const text = result.text?.trim() || "";
    
    // Check if the AI flagged it as off-topic
    if (text.includes("OFF_TOPIC")) {
      return "OFF_TOPIC";
    }

    return text;
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "⚠️ Error de conexión con Control Central. Mantén rumbo.";
  }
};
