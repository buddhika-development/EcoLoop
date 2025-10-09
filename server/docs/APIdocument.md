
# API document
Put all the api route details and the what are the body need to contain. What are the parameters need to pass trough the request bodies, query parameters and authorization headers.

## Educator
Educator responsible for handle the ai related tasks, engagements with the users in normal way like chatbot. There maintain the dicipline of the eco friendly and socia health areas. Not handle any other ares.

*Educator health*

Of course! Here is the information from your markdown file presented in a table format.

| Endpoint | Description | Request body | Response |
| :--- | :--- | :--- |:--- |
| `GET /api/educator` | Checks the health of the educator API router. |  | | `{ "success": true, "message": "Health" }` |
| `POST /api/educator/chat` | Checks the health of the educator API router. | `{ "chat_message": "string chat message", "chat_history": "hitory of chat, array of strings" }` | `{ "time": "content generated time", "message": "Health" }` |