# CRM Empresarial 🚀

Sistema de gestión de relaciones con clientes (CRM) multi-departamental con distribución automática de leads.

## 🌟 Características

- **Distribución Automática de Leads**: Sistema round-robin que distribuye leads equitativamente entre asesores comerciales
- **Multi-Departamental**: Módulos específicos para Ventas, Call Center, Marketing y Legal
- **Roles de Usuario**: Control de acceso basado en roles (Admin, Supervisor, Marketing, Ventas, Legal)
- **Diseño Moderno**: Interfaz con glassmorphism, animaciones suaves y tema oscuro
- **Gestión Completa**: Leads, clientes, campañas y documentos legales

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

La aplicación estará disponible en `http://localhost:5173`

## 👥 Usuarios de Demostración

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@empresa.com | admin123 | Administrador |
| supervisor@empresa.com | super123 | Supervisor Call Center |
| marketing@empresa.com | market123 | Marketing |
| vendedor1@empresa.com | venta123 | Ejecutivo Comercial |
| vendedor2@empresa.com | venta123 | Ejecutivo Comercial |
| vendedor3@empresa.com | venta123 | Ejecutivo Comercial |
| legal@empresa.com | legal123 | Legal |

## 📋 Módulos

### Dashboard
- Resumen de métricas generales
- Leads recientes
- Distribución de leads por estado

### Call Center (Supervisor)
- Crear leads individuales
- Carga masiva de leads
- Visualización de distribución entre asesores
- Métricas del equipo

### Marketing
- Crear y gestionar campañas
- Generar leads vinculados a campañas
- Analytics de conversión

### Ventas (Ejecutivos Comerciales)
- Buzón de leads asignados
- Filtros por estado
- Actualización de estado de leads
- Gestión de pipeline

### Legal
- Gestión de documentos legales
- Contratos y acuerdos
- Estados de documentos

## 🔧 Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool
- **React Router** - Navegación
- **Lucide React** - Iconos
- **LocalStorage** - Persistencia de datos

## 📊 Sistema de Distribución

Los leads se distribuyen automáticamente usando el algoritmo round-robin:
1. Supervisor o Marketing crea un lead
2. El sistema identifica todos los asesores comerciales activos
3. Asigna el lead al siguiente asesor en rotación
4. Garantiza distribución equitativa

## 🎨 Diseño

- **Tema oscuro** profesional
- **Glassmorphism** para tarjetas y modales
- **Gradientes vibrantes** en elementos clave
- **Animaciones suaves** para mejor UX
- **Responsive** para todos los dispositivos

## 📝 Notas

- Los datos se almacenan en `localStorage` del navegador
- Para producción, se recomienda implementar un backend con base de datos
- Los usuarios demo se crean automáticamente al iniciar la aplicación

## 🔐 Seguridad

- Rutas protegidas por autenticación
- Control de acceso basado en roles
- Validación de permisos en cada módulo

## 📱 Responsive

La aplicación está optimizada para:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

---

Desarrollado con ❤️ usando React + Vite
