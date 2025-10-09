import GEMINI from "../../config/geminiConnection.js"
import { EDUCATOR_CHATBOT_TEMPLATE } from "../../libs/chatBotTemplate.js";

export const handleHealthRequest = (req, res) => {
    res.json({
        "success": true,
        "message": "Health",
    })
}

export const handleChatBotMessage = async (req, res) => {

    const body = await req.body;
    const user_chat_message = body.chat_message;

    const prompt = await EDUCATOR_CHATBOT_TEMPLATE.invoke({ input : user_chat_message });
    const response = await GEMINI.invoke(prompt);

    
    return res.status(200).json({
        'message' : response.content
    })
}