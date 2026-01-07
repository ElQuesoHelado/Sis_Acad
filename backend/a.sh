#!/bin/bash

API_URL="http://localhost:5000"
TEST_ENDPOINT="api/secretary/enrollment-period"

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAxLTQwMDAtODAwMC0wMDAwMDAwMDAwNTMiLCJyb2xlIjoic2VjcmV0YXJpYSIsImlhdCI6MTc2Nzc5OTgwMCwiZXhwIjoxNzY3ODAzNDAwfQ.-f3F6mlspUJGICGFVuiAdhXNkj70CaQas3Quw7u3_po"

curl -X GET "$API_URL/$TEST_ENDPOINT" -H 'accept: application/json' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" -d '
        {
          "period": {
          "startDate": "2024-01-01T00:00:00.000Z",
         "endDate": "2024-12-31T23:59:59.000Z"
        }
 }'
