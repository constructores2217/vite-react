# SOFTCON-MYS-CONSTRU-WM

Sistema de gestión y control para WM CONSTRUCTORA - Cerebro de Control Central

## 📋 Descripción

SOFTCON-MYS-CONSTRU-WM es un sistema integral de gestión de proyectos de construcción que permite el control centralizado de obras, inventarios, presupuestos y actividades de campo. El sistema cuenta con diferentes vistas especializadas para administradores, personal de campo y proveedores.

### Características Principales

- **Dashboard Administrativo**: KPIs en tiempo real, gráficos de avance físico vs financiero
- **Gestión de Proyectos**: Control de presupuestos, gastos reales y porcentajes de avance
- **Inventario de Materiales**: Control de stock y bodegas por proyecto
- **Registro de Actividades**: Seguimiento de tareas de campo
- **Reportes PDF**: Generación automática de reportes ejecutivos y por proyecto
- **Notificaciones en Tiempo Real**: Sistema de alertas con Supabase Realtime
- **Importación Masiva**: Carga de datos mediante archivos CSV

## 🚀 Instalación

### Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta de Supabase (para base de datos y funciones en tiempo real)

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/softcon-mys-constru-wm.git
cd softcon-mys-constru-wm
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_KEY=tu_supabase_anon_key
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

5. Compilar para producción:
```bash
npm run build
```

6. Previsualizar la compilación de producción:
```bash
npm run preview
```

## 🏗️ Configuración Inicial del Repositorio

Para inicializar un nuevo repositorio desde cero:

```bash
git init
git add .
git commit -m "Lanzamiento oficial SOFTCON-MYS-CONSTRU-WM"
git remote add origin https://github.com/tu-usuario/softcon-mys-constru-wm.git
git push -u origin main
```

## 📊 Estructura de la Base de Datos

El sistema requiere las siguientes tablas en Supabase:

### `proyectos`
- `id` (uuid, primary key)
- `nombre` (text)
- `presupuesto_total` (numeric)
- `gasto_real_acumulado` (numeric)
- `porcentaje_avance_fisico` (numeric)
- `estado` (text)

### `inventario_materiales`
- `id` (uuid, primary key)
- `proyecto_id` (uuid, foreign key -> proyectos)
- `nombre_material` (text)
- `codigo_sku` (text)
- `cantidad_actual` (numeric)
- `unidad_medida` (text)

### `notificaciones`
- `id` (uuid, primary key)
- `mensaje` (text)
- `tipo` (text)
- `created_at` (timestamp)

## 👥 Roles de Usuario

### Administrador
- Acceso completo al dashboard con KPIs
- Visualización de gráficos de avance
- Generación de reportes PDF
- Control de inventario
- Importación de datos CSV

### Campo
- Registro de actividades en terreno
- Marcado de tareas completadas
- Vista simplificada de proyectos

### Proveedor
- Registro de materiales recibidos
- Ingreso de cantidades y códigos SKU
- Asignación a proyectos específicos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18.2
- **Build Tool**: Vite 5.0
- **Estilos**: Tailwind CSS 3.4
- **Base de Datos**: Supabase
- **Gráficos**: Recharts 2.10
- **Generación PDF**: jsPDF + jsPDF-AutoTable
- **Iconos**: Lucide React

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción

## 🔐 Seguridad

- Las credenciales de Supabase deben mantenerse en variables de entorno
- Nunca comitear el archivo `.env` al repositorio
- Utilizar las políticas de seguridad de Supabase (Row Level Security) para proteger los datos

## 📖 Manual de Usuario

El sistema incluye un manual de usuario integrado accesible desde la interfaz principal mediante el botón "Manual de Usuario".

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de WM CONSTRUCTORA.

## 📞 Contacto

Para soporte o consultas sobre el sistema SOFTCON-MYS-CONSTRU-WM, contactar al equipo de desarrollo de WM CONSTRUCTORA.

---

**Cerebro WM v1.0** - Sistema de Control Central para Construcción
