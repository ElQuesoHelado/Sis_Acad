#!/bin/bash

# URL base de tu API
API_URL="http://localhost:5000/api"

# Tu Token JWT (Pégalo aquí después de hacer login como SECRETARIA)
SECRETARY_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAxLTQwMDAtODAwMC0wMDAwMDAwMDAwNTMiLCJyb2xlIjoic2VjcmV0YXJpYSIsImlhdCI6MTc2Nzc4NDA1NSwiZXhwIjoxNzY3Nzg3NjU1fQ.YlibPRrvZ_YYZGllLQ5lIjCBYha--ZalWnM1enjQ4bs"

# Tu Token JWT (Pégalo aquí después de hacer login como ADMIN)
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAxLTQwMDAtODAwMC0wMDAwMDAwMDAwMTMiLCJyb2xlIjoiYWRtaW5pc3RyYWRvciIsImlhdCI6MTc2Nzc4NDA3NiwiZXhwIjoxNzY3Nzg3Njc2fQ.9vd2HdtDkuo0WcMbQEvAPKXKMMyopybDhBEoaNGwcM8"

# IDs para probar la creación de laboratorios
# Debes sacar estos UUIDs de tu base de datos o de los endpoints de listado
TEST_COURSE_ID="00000000-0004-4000-8000-000000000001"
TEST_PROFESSOR_ID="00000000-0002-4000-8000-000000000001"
TEST_CLASSROOM_ID="00000000-0005-4000-8000-000000000001"

# ==========================================
# COLORES PARA OUTPUT
# ==========================================
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== INICIANDO PRUEBAS DE ENDPOINTS DE SECRETARÍA Y ADMIN ===${NC}\n"

# ==========================================
# 1. GESTIÓN DE PLAZOS (SECRETARIA)
# ==========================================
echo -e "${GREEN}1. [SECRETARY] Establecer Plazo de Inscripción${NC}"
curl -X POST "$API_URL/secretary/enrollment-deadline" \
  -H "Authorization: Bearer $SECRETARY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deadline": "2024-12-31T23:59:59Z"
  }' | jq .
echo -e "\n"

echo -e "${GREEN}2. [SECRETARY] Consultar Plazo de Inscripción${NC}"
curl -X GET "$API_URL/secretary/enrollment-deadline" \
  -H "Authorization: Bearer $SECRETARY_TOKEN" | jq .
echo -e "\n"

# ==========================================
# 2. GESTIÓN DE LABORATORIOS (SECRETARIA)
# ==========================================
echo -e "${GREEN}3. [SECRETARY] Crear Grupo de Laboratorio${NC}"
curl -X POST "$API_URL/secretary/labs" \
  -H "Authorization: Bearer $SECRETARY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$TEST_COURSE_ID\",
    \"professorId\": \"$TEST_PROFESSOR_ID\",
    \"groupLetter\": \"A\",
    \"capacity\": 20
  }" | jq .
echo -e "\n"

echo -e "${GREEN}4. [SECRETARY] Listar Todos los Laboratorios${NC}"
curl -X GET "$API_URL/secretary/labs" \
  -H "Authorization: Bearer $SECRETARY_TOKEN" | jq .
echo -e "\n"

# ==========================================
# 3. VISUALIZACIÓN DE SALONES (SECRETARIA)
# ==========================================
echo -e "${GREEN}5. [SECRETARY] Ver Horario de Salón (Clases + Reservas)${NC}"
# Nota: Asegúrate de enviar el query param ?semester=
curl -X GET "$API_URL/secretary/classrooms/$TEST_CLASSROOM_ID/schedule?semester=2024-I" \
  -H "Authorization: Bearer $SECRETARY_TOKEN" | jq .
echo -e "\n"

# ==========================================
# 4. FUNCIONALIDAD DE ADMIN (SOLO LECTURA)
# ==========================================
echo -e "${BLUE}=== CAMBIANDO A ROL DE ADMINISTRADOR ===${NC}\n"

echo -e "${GREEN}6. [ADMIN] Listar Todos los Laboratorios (Solo lectura)${NC}"
curl -X GET "$API_URL/admin/labs" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
echo -e "\n"

echo -e "${GREEN}7. [ADMIN] Ver Horario de Salón${NC}"
curl -X GET "$API_URL/admin/classrooms/$TEST_CLASSROOM_ID/schedule?semester=2024-I" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
echo -e "\n"

echo -e "${BLUE}=== PRUEBAS FINALIZADAS ===${NC}"
