# Carpeta de Personajes

Esta carpeta contiene los personajes guardados de D&D Solitario.

## Estructura
- Los personajes se guardan como archivos JSON individuales
- Cada archivo contiene toda la información del personaje
- Los archivos se pueden importar/exportar fácilmente

## Formato de archivo
Cada personaje se guarda con la siguiente estructura:
```json
{
  "id": "timestamp",
  "name": "Nombre del Personaje",
  "data": {
    // Datos completos del personaje
  },
  "savedAt": "2024-01-01T00:00:00.000Z",
  "lastModified": "2024-01-01T00:00:00.000Z"
}
```

## Notas
- No elimines ni modifiques manualmente los archivos mientras la aplicación esté ejecutándose
- Los personajes se pueden compartir copiando los archivos JSON
- La aplicación detecta automáticamente esta carpeta al iniciar
