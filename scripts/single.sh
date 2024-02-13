#!/bin/bash

# Inserts a new user

API=http://127.0.0.1:3000/server/api/app/noauth/signup
EMAIL=test@cazuapp.dev

curl -d '{"lang": "en", "email":"'$EMAIL'", "password": "password", "first":"Test", "last": "User", "phone_code": 1, "phone": 12345}' -H "Content-Type: application/json" -X POST $API -A "CazuClient"

