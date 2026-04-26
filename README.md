# 🏔️ Kultour — Descubre La Paz

Plataforma web para descubrir eventos y lugares en La Paz, Bolivia.

---

## 📁 Estructura

```
kultour/
├── backend/          # Node.js + Express + Prisma
└── frontend/         # React + TypeScript + Tailwind
```

---

## 🚀 Setup Rápido

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

---

## ⚙️ Backend

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Edita .env con tu DATABASE_URL y JWT_SECRET
```

### 3. Configurar base de datos
```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas (primera vez)
npm run db:push

# O usar migraciones (recomendado para producción)
npm run db:migrate

# Cargar datos de prueba
npm run db:seed
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
# Servidor en http://localhost:4000
```

### 5. Verificar
```
GET http://localhost:4000/health
```

---

## 🎨 Frontend

### 1. Instalar dependencias
```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Asegúrate que VITE_API_URL apunte al backend
```

### 3. Iniciar desarrollo
```bash
npm run dev
# App en http://localhost:5173
```

---

## 🗃️ Variables de Entorno

### Backend `.env`
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/kultour_db"
JWT_SECRET="tu_secreto_super_seguro_aqui"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=Kultour
```

---

## 🔑 Cuentas de prueba (seed)

| Rol         | Email                  | Contraseña     |
|-------------|------------------------|----------------|
| Admin       | admin@kultour.bo       | admin123       |
| Organizador | eventos@noche.bo       | organizer123   |
| Usuario     | juan@gmail.com         | user123        |

---

## 🔗 API Endpoints

| Método | Ruta                    | Auth         | Descripción              |
|--------|-------------------------|--------------|--------------------------|
| POST   | /api/auth/register      | -            | Registro de usuario      |
| POST   | /api/auth/login         | -            | Login                    |
| GET    | /api/auth/me            | JWT          | Perfil propio            |
| GET    | /api/events             | -            | Listar eventos           |
| GET    | /api/events/featured    | -            | Eventos destacados       |
| GET    | /api/events/:id         | -            | Detalle de evento        |
| POST   | /api/events             | ORGANIZER    | Crear evento             |
| PUT    | /api/events/:id         | ORGANIZER    | Actualizar evento        |
| DELETE | /api/events/:id         | ORGANIZER    | Cancelar evento          |
| GET    | /api/places             | -            | Listar lugares           |
| GET    | /api/places/featured    | -            | Lugares destacados       |
| GET    | /api/places/:id         | -            | Detalle de lugar         |
| POST   | /api/places             | ORGANIZER    | Crear lugar              |
| GET    | /api/suggestions        | -            | Sugerencias filtradas    |
| GET    | /api/cities             | -            | Listar ciudades          |

---

## 🧩 Pantallas implementadas (Parte 1)

- ✅ Landing Page (hero, beneficios, cómo funciona, preview)
- ✅ Explore (eventos + lugares + filtros + búsqueda)
- ✅ Detalle de evento
- ✅ Mapa interactivo (Leaflet)
- ✅ Sugerencias personalizadas
- ✅ Dashboard de organizador (crear evento, mis eventos)
- ✅ 404

---

## 📦 Parte 2 (próxima entrega)

- Detalle de lugar
- Modal de auth (login/register)
- Perfil de usuario
- Búsqueda global
- Notificaciones toast completas
- PWA config
- Dark mode

---

## 🛠️ Tecnologías

### Frontend
- React 18 + TypeScript
- Tailwind CSS (tema custom Kultour)
- Framer Motion (animaciones)
- React Query v5 (data fetching)
- Zustand (estado global auth)
- React Leaflet (mapas)
- React Router v6

### Backend
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT (autenticación)
- bcryptjs (hash de contraseñas)
- Helmet + CORS (seguridad)


📧 Test accounts:
   Admin:     admin@kultour.bo     / admin123
   Organizer: eventos@noche.bo     / organizer123
   User:      juan@gmail.com        / user123
   