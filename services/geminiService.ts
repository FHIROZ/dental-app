import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { createBooking } from './calService';
import { GEMINI_MODEL } from '../constants';

// Define the tool for booking appointments
const bookAppointmentTool: FunctionDeclaration = {
  name: "bookAppointment",
  description: "Book a dental appointment for a patient.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "The patient's full name"
      },
      email: {
        type: Type.STRING,
        description: "The patient's email address"
      },
      dateTime: {
        type: Type.STRING,
        description: "The start time for the appointment in ISO 8601 format (e.g., 2023-10-27T10:00:00.000Z). Infer the year and timezone based on context if needed."
      },
      notes: {
        type: Type.STRING,
        description: "Any specific symptoms or reasons for the visit"
      }
    },
    required: ["name", "email", "dateTime"]
  }
};

export const chatWithGemini = async (
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  newMessage: string
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We create a chat session but for simplicity in this stateless service, 
    // we might just generateContent with history. 
    // However, maintaining a chat object is better for multi-turn.
    // For this implementation, we will reconstruct the chat each time to keep it simple or assume the caller manages state.
    
    const chat = ai.chats.create({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: `You are a helpful and professional receptionist for DentalCare Connect. 
        Your goal is to help patients book dental appointments.
        Current Date/Time: ${new Date().toISOString()}.
        
        Rules:
        1. Always be polite and professional.
        2. To book an appointment, you MUST collect the patient's Name, Email, and Desired Date/Time.
        3. If you have all the information, call the 'bookAppointment' tool.
        4. If the tool call is successful, confirm to the user.
        5. Do not make up appointment confirmations without calling the tool.
        `,
        tools: [{ functionDeclarations: [bookAppointmentTool] }],
      },
      history: history
    });

    const result = await chat.sendMessage({ message: newMessage });
    
    // Check for function calls
    const functionCalls = result.functionCalls;
    
    if (functionCalls && functionCalls.length > 0) {
      // Execute the function
      const call = functionCalls[0];
      if (call.name === "bookAppointment") {
        const { name, email, dateTime, notes } = call.args as any;
        const bookingResult = await createBooking(name, email, dateTime, notes);
        
        // Send the result back to Gemini
        // Use sendMessage with functionResponse part instead of sendToolResponse
        const toolResponse = await chat.sendMessage({
            message: [{
                functionResponse: {
                    name: call.name,
                    response: { result: bookingResult },
                    id: call.id
                }
            }]
        });
        
        return toolResponse.text || "Appointment processed.";
      }
    }

    return result.text || "";

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I apologize, but I'm having trouble connecting to the scheduling system right now. Please try using the manual booking form.";
  }
};