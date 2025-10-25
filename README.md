# MiGasto - Aplicación de Gestión de Gastos Personales

Una aplicación web moderna y completa para registrar, visualizar y analizar tus gastos personales.

## 🚀 Características

- ✅ Registro de gastos con categorías
- 📊 Gráficos interactivos de análisis
- 💾 Persistencia de datos con localStorage
- 🌓 Modo oscuro/claro
- 📱 Diseño responsivo
- 📈 Estadísticas y análisis detallados

## 🛠️ Stack Tecnológico

- **React** - Framework frontend
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Recharts** - Gráficos
- **React Router** - Navegación
- **Lucide React** - Iconos

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ExpenseForm.jsx
│   ├── ExpenseList.jsx
│   ├── ExpenseItem.jsx
│   ├── Navbar.jsx
│   ├── ThemeToggle.jsx
│   └── Charts/
│       ├── CategoryChart.jsx
│       └── TimeChart.jsx
├── pages/
│   ├── Home.jsx
│   └── ChartsPage.jsx
├── utils/
│   └── storage.js
├── App.jsx
└── main.jsx
```

## 🎯 Uso

1. **Agregar gastos**: Usa el formulario en la página principal
2. **Ver análisis**: Navega a la sección de gráficos
3. **Editar/Eliminar**: Usa los botones en cada gasto
4. **Cambiar tema**: Usa el botón de modo oscuro/claro

## 📊 Categorías Disponibles

- Comida
- Transporte
- Ocio
- Salud
- Educación
- Servicios
- Compras
- Otros

---

Desarrollado con ❤️ usando React y Tailwind CSS
