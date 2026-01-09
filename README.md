# Warframe Market Estimator API

API REST en **NestJS** que permite buscar ítems de Warframe Market usando texto libre y obtener estimaciones de costos en Platinum basadas en órdenes reales del mercado.

## 🎯 ¿Qué Problema Resuelve?

Esta API resuelve dos necesidades principales para jugadores de Warframe:

1. **Búsqueda sin conocer slugs**  
   Los usuarios no necesitan conocer los identificadores técnicos (slugs) de Warframe Market. Simplemente escriben texto normal como "gauss prime" o "wisp" y obtienen resultados relevantes con nombres legibles y sus respectivos slugs.

2. **Cálculo de costos para armar sets/builds**  
   Permite calcular cuánto cuesta comprar conjuntos completos o piezas individuales usando precios reales del mercado, incluyendo recomendaciones de vendedores confiables.

## ✨ Características

- 🔍 **Búsqueda inteligente de ítems** con texto libre
- 💰 **Estimación de costos** basada en órdenes reales del mercado
- 👤 **Recomendación de vendedores** por reputación y disponibilidad
- 🎮 **Plataforma:** PC
- 💎 **Moneda:** Platinum
- 📊 **Fuente de datos:** Warframe Market API v2
- ⚡ **Cache inteligente** para optimizar consultas

## 🏗️ Arquitectura

### CatalogModule
- Descarga y mantiene catálogo de ítems de Warframe Market
- Cache in-memory con TTL de 24h
- Búsqueda optimizada con ranking inteligente:
  - Prioriza sets de Warframes
  - Luego componentes y blueprints
  - Finalmente mods, skins y cosméticos

### EstimatorModule
- Procesa solicitudes de estimación de costos
- Consulta órdenes activas por ítem
- Filtra y selecciona vendedores recomendados
- Calcula subtotales y total general

## 🚀 Instalación

### Requisitos
- Node.js (v16 o superior)
- pnpm (recomendado) o npm

### Clonar el repositorio
```bash
git clone https://github.com/Kwasin02/estimator-warframe.git
cd estimator-warframe
```

### Instalar dependencias
```bash
pnpm install
```

## 💻 Ejecución

```bash
# Modo desarrollo
pnpm run start:dev

# Modo producción
pnpm run build
pnpm run start:prod
```

La API estará disponible en `http://localhost:3000`

## 📖 Uso de la API

### 1. Buscar ítems

Busca ítems usando texto libre sin necesidad de conocer el slug exacto.

**Endpoint:** `GET /catalog/search`

**Query Parameters:**
- `q` (requerido): Texto de búsqueda

**Ejemplo:**
```bash
curl "http://localhost:3000/catalog/search?q=gauss"
```

**Respuesta:**
```json
{
  "results": [
    {
      "slug": "gauss_prime_set",
      "name": "Gauss Prime Set",
      "tags": ["prime", "set", "warframe"]
    },
    {
      "slug": "gauss_prime_blueprint",
      "name": "Gauss Prime Blueprint",
      "tags": ["prime", "blueprint", "component"]
    }
  ]
}
```

### 2. Estimar costos

Calcula el costo total en Platinum para comprar una lista de ítems.

**Endpoint:** `POST /estimator/estimate`

**Body:**
```json
{
  "items": [
    {
      "slug": "gauss_prime_set",
      "quantity": 1
    },
    {
      "slug": "wisp_prime_chassis",
      "quantity": 2
    }
  ]
}
```

**Respuesta:**
```json
{
  "total": 450,
  "currency": "platinum",
  "itemsEstimate": [
    {
      "slug": "gauss_prime_set",
      "quantity": 1,
      "unitPrice": 250,
      "subtotal": 250,
      "seller": {
        "username": "TennoTrader",
        "reputation": 98,
        "status": "ingame"
      }
    },
    {
      "slug": "wisp_prime_chassis",
      "quantity": 2,
      "unitPrice": 100,
      "subtotal": 200,
      "seller": {
        "username": "PrimeSeller",
        "reputation": 95,
        "status": "online"
      }
    }
  ],
  "unavailable": []
}
```

## 🧪 Testing

```bash
# Tests unitarios
pnpm run test

# Tests e2e
pnpm run test:e2e

# Cobertura
pnpm run test:cov
```

## 🛠️ Stack Tecnológico

- **Framework:** NestJS
- **Lenguaje:** TypeScript
- **HTTP Client:** Axios
- **Validación:** class-validator, class-transformer
- **Testing:** Jest

## 📊 Flujo de Datos

1. Usuario busca "gauss prime" → API consulta catálogo local
2. API retorna resultados con slugs
3. Usuario solicita estimación con slugs
4. API consulta órdenes activas en Warframe Market
5. API filtra vendedores por estado y reputación
6. API calcula costos y retorna estimación

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🔗 Enlaces Útiles

- [Warframe Market](https://warframe.market/)
- [Warframe Market API Documentation](https://docs.warframe.market/)
- [NestJS Documentation](https://docs.nestjs.com)

---

**Desarrollado con ❤️ para la comunidad de Warframe**
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
