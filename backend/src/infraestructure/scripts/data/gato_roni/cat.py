import pandas as pd
import random
import os

# Archivos base requeridos
ST_FILE = 'students_dni.csv'
TE_FILE = 'teachers.csv'
CO_FILE = 'courses.csv'
CT_FILE = 'course_topics.csv'
RUTA_SALIDA = "../"
SEMESTRE = "2025-I"

def guardar_en_padre(df, nombre_archivo):
    ruta_final = os.path.join(RUTA_SALIDA, nombre_archivo)
    df.to_csv(ruta_final, index=False)
    print(f"Generado: {ruta_final}")

if not all(os.path.exists(f) for f in [ST_FILE, TE_FILE, CO_FILE, CT_FILE]):
    print("Error: Faltan archivos base.")
    exit()

df_st = pd.read_csv(ST_FILE)
df_te = pd.read_csv(TE_FILE)
df_co_base = pd.read_csv(CO_FILE)
df_topics_base = pd.read_csv(CT_FILE)

# 1. USERS
users = [["user-1", "admin@unsa.edu.pe", "admin123", "administrador", "Super", "Admin", "1990-01-01", "true"]]
for i, r in df_te.iterrows():
    users.append([f"user-p-{i+1}", r['email'], "prof123", "profesor", r['first_name'], r['last_name'], "1980-01-01", "true"])
for i, r in df_st.iterrows():
    users.append([f"user-s-{i+1}", r['email'], "est123", "estudiante", r['first_name'], r['last_name'], "2002-01-01", "true"])
guardar_en_padre(pd.DataFrame(users, columns=["id","email","password","role","name","surname","birthdate","status"]), 'users.csv')

# 2. PROFILES
guardar_en_padre(pd.DataFrame([[f"tp-{i+1}", f"user-p-{i+1}", r['specialty']] for i, r in df_te.iterrows()], columns=["id","user_id","specialization"]), 'teacher_profiles.csv')
s_prof_list = [[f"sp-{i+1}", f"user-s-{i+1}", str(r['cui'])] for i, r in df_st.iterrows()]
guardar_en_padre(pd.DataFrame(s_prof_list, columns=["id","user_id","studentCode"]), 'student-profiles.csv')

# 3. COURSES
df_co_base['type'] = 'teoria_labo' 
guardar_en_padre(df_co_base[['id','code','name','credits','type']], 'courses.csv')

# 4. GROUPS
theory = []
course_map = {}
course_codes = df_co_base['code'].tolist()
course_ids = df_co_base['id'].tolist()
for i, r in df_te.iterrows():
    idx = i % len(course_codes)
    t_id = f"theory-{i+1}"
    theory.append([t_id, course_codes[idx], r['email'], SEMESTRE, "A"])
    course_map[t_id] = course_ids[idx]
guardar_en_padre(pd.DataFrame(theory, columns=["id","course_code","professor_email","semester","groupLetter"]), 'theory_groups.csv')

labs = [[f"lab-{i+1}", t[1], t[2], "1", 40, 0] for i, t in enumerate(theory)]
guardar_en_padre(pd.DataFrame(labs, columns=["id","course_code","professor_email","groupLetter","capacity","currentEnrollment"]), 'lab_groups.csv')

# 5. ENROLLMENTS
enroll = [[f"enr-{i+1}", s[2], theory[i % len(theory)][0], labs[i % len(theory)][0]] for i, s in enumerate(s_prof_list)]
guardar_en_padre(pd.DataFrame(enroll, columns=["id","student_code","theoryGroupId","labGroupId"]), 'enrollments.csv')

# 6. CLASSROOMS
aulas_teoria = ["101", "102", "103", "201", "202", "203", "301", "302", "303"]
rooms_data = [[f"r-{n}", n, "teoria", 100] for n in aulas_teoria]
for i in range(1, 7): rooms_data.append([f"l-{i}", f"Laboratorio {i}", "labo", 40])
guardar_en_padre(pd.DataFrame(rooms_data, columns=["id","name","type","capacity"]), 'classrooms.csv')

# 7. SCHEDULES
days = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"]
times = [("07:00", "08:40"), ("08:50", "10:30"), ("10:40", "12:20"), ("14:00", "15:40"), ("15:50", "17:30")]
sch = []
for i, t in enumerate(theory):
    room_name = aulas_teoria[i % len(aulas_teoria)]
    sch.append([f"sch-{i+1}", room_name, SEMESTRE, days[(i//5)%5], times[i%5][0], times[i%5][1], t[0], labs[i][0]])
guardar_en_padre(pd.DataFrame(sch, columns=["id","classroom_name","semester","day","startTime","endTime","theoryGroupId","labGroupId"]), 'class_schedules.csv')

# 8. GRADES & WEIGHTS
guardar_en_padre(pd.DataFrame([[f"w-{t[0]}-1", t[0], "parcial_1", 33] for t in theory], columns=["id","theoryGroupId","type","weight"]), 'grade_weights.csv')
guardar_en_padre(pd.DataFrame([[f"g-{i+1}", e[0], "parcial_1", random.randint(10, 20)] for i, e in enumerate(enroll)], columns=["id","enrollmentId","type","score"]), 'grades.csv')

# 9. ATTENDANCE
guardar_en_padre(pd.DataFrame([[f"att-{i+1}", e[0], "2025-04-29", "presente", "teoria"] for i, e in enumerate(enroll)], columns=["id", "enrollmentId", "date", "status", "classType"]), 'attendance.csv')

# 10. COURSE CONTENTS (Traducción de Status y Recorte de 255 caracteres)
contents = []
cc_id_counter = 1
status_map = {"PENDING": "pendiente", "COMPLETED": "completado"}

for t in theory:
    t_id = t[0]
    c_id_num = course_map[t_id]
    topics = df_topics_base[df_topics_base['courseId'] == c_id_num]
    for _, row in topics.iterrows():
        final_status = status_map.get(row['state'], "pendiente")
        # Recorte de seguridad para VARCHAR(255)
        name = str(row['topicName'])
        safe_name = (name[:252] + '...') if len(name) > 255 else name
        contents.append([f"cc-{cc_id_counter}", t_id, row['week'], safe_name, final_status])
        cc_id_counter += 1
guardar_en_padre(pd.DataFrame(contents, columns=["id","theoryGroupId","week","topicName","status"]), 'course_contents.csv')

# 11. RESERVATIONS
res = [["res-1", "l-1", "user-p-1", SEMESTRE, "reservado", "2025-06-01", "18:00", "20:00", "Reserva de laboratorio"]]
guardar_en_padre(pd.DataFrame(res, columns=["id","classroomId","professorId","semester","status","date","startTime","endTime","notes"]), 'room-reservations.csv')