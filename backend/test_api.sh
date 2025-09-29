#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "=============================="
echo " 🎬 TEST API CINEMA"
echo "=============================="

# Assicuriamoci che jq sia installato
if ! command -v jq &> /dev/null
then
    echo "❌ jq non trovato. Installa con: sudo pacman -S jq"
    exit 1
fi

# ----------------------------
# GET iniziali
# ----------------------------
echo "🔹 Halls esistenti:"
curl -s "$BASE_URL/halls" | jq

echo "🔹 Movies esistenti:"
curl -s "$BASE_URL/movies" | jq

echo "🔹 Users esistenti:"
curl -s "$BASE_URL/users" | jq

# ----------------------------
# Creiamo dati minimi se non esistono
# ----------------------------
# Hall
HALL_ID=$(curl -s "$BASE_URL/halls" | jq -r '.[0].id')
if [ "$HALL_ID" == "null" ] || [ -z "$HALL_ID" ]; then
  echo "➕ Creo una sala di test..."
  curl -s -X POST "$BASE_URL/halls" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sala Test","hall_type":"3D","capacity":120}' | jq
  HALL_ID=$(curl -s "$BASE_URL/halls" | jq -r '.[0].id')
fi
echo "✅ HALL_ID = $HALL_ID"

# Movie
MOVIE_ID=$(curl -s "$BASE_URL/movies" | jq -r '.[0].id')
if [ "$MOVIE_ID" == "null" ] || [ -z "$MOVIE_ID" ]; then
  echo "➕ Creo un film di test..."
  curl -s -X POST "$BASE_URL/movies" \
  -H "Content-Type: application/json" \
  -d '{"title":"Film Test","description":"Descrizione Test","duration_minutes":120,"release_date":"2025-10-01","role":"Main","foto_locandina":"https://example.com/test.jpg"}' | jq
  MOVIE_ID=$(curl -s "$BASE_URL/movies" | jq -r '.[0].id')
fi
echo "✅ MOVIE_ID = $MOVIE_ID"

# User
USER_ID=$(curl -s "$BASE_URL/users" | jq -r '.[0].id')
if [ "$USER_ID" == "null" ] || [ -z "$USER_ID" ]; then
  echo "➕ Creo un utente di test..."
  curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mario Rossi","email":"mario@example.com","password":"password123","role":"client"}' | jq
  USER_ID=$(curl -s "$BASE_URL/users" | jq -r '.[0].id')
fi
echo "✅ USER_ID = $USER_ID"

# ----------------------------
# Screening
# ----------------------------
echo "➕ Creo una proiezione..."
curl -s -X POST "$BASE_URL/screenings" \
-H "Content-Type: application/json" \
-d "{\"movie_id\":$MOVIE_ID,\"hall_id\":$HALL_ID,\"start_time\":\"2025-10-01 20:00:00\"}" | jq

SCREENING_ID=$(curl -s "$BASE_URL/screenings" | jq -r '.[0].id')
echo "✅ SCREENING_ID = $SCREENING_ID"

# ----------------------------
# Ticket
# ----------------------------
echo "➕ Prenoto un biglietto..."
curl -s -X POST "$BASE_URL/tickets" \
-H "Content-Type: application/json" \
-d "{\"screening_id\":$SCREENING_ID,\"user_id\":$USER_ID,\"seat_number\":\"A1\"}" | jq

# ----------------------------
# GET finali
# ----------------------------
echo "=============================="
echo "📊 Stato finale del DB"
echo "=============================="

echo "🎬 Movies:"
curl -s "$BASE_URL/movies" | jq

echo "🏟️  Halls:"
curl -s "$BASE_URL/halls" | jq

echo "👤 Users:"
curl -s "$BASE_URL/users" | jq

echo "📅 Screenings:"
curl -s "$BASE_URL/screenings" | jq

echo "🎟️  Tickets:"
curl -s "$BASE_URL/tickets" | jq

