from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import psycopg2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conn = psycopg2.connect(
    dbname="legendaryleads",
    user="postgres",
    password="yourpassword",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@app.get("/search")
def search(request: Request):
    params = dict(request.query_params)
    clauses = []
    values = []
    for key, val in params.items():
        if val:
            clauses.append(f"{key} ILIKE %s")
            values.append(f"%{val}%")
    query = "SELECT name, username, category, location, followers, email FROM leads"
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " LIMIT 50"
    cursor.execute(query, values)
    rows = cursor.fetchall()
    return [
        {
            "name": r[0], "username": r[1], "category": r[2],
            "location": r[3], "followers": r[4], "email": r[5]
        }
        for r in rows
    ]

@app.post("/chat")
def chat(chat: ChatRequest):
    prompt = chat.messages[-1].content.lower()
    filters = {}
    if "florida" in prompt:
        filters["state"] = "FL"
    if "gym" in prompt:
        filters["category"] = "gym"
    if "over 10k followers" in prompt:
        filters["minFollowers"] = "10000"
    return {
        "reply": "Got it! Filtering leads based on your request.",
        "filters": filters
    }
