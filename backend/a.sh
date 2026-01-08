#!/bin/bash

API_URL="http://localhost:5000"
TEST_ENDPOINT="api/secretary/courses"

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAxLTQwMDAtODAwMC0wMDAwMDAwMDAwNTMiLCJyb2xlIjoic2VjcmV0YXJpYSIsImlhdCI6MTc2Nzg1NDAzMiwiZXhwIjoxNzY3ODU3NjMyfQ.7SISZ1cwSe-L6uIYhaO3NMpTQEkhq5_I2B9KG_T1IOc"

curl -X GET "$API_URL/$TEST_ENDPOINT" -H 'accept: application/json' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" -d '
        {
          "period": {
          "startDate": "2024-01-01T00:00:00.000Z",
         "endDate": "2024-12-31T23:59:59.000Z"
        }
 }'
