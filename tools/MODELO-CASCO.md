# Modelo del casco

`casco.glb` es una versión optimizada, **no el archivo original**.

- **Original (fuente de verdad):** `D:\Dev\GB Consultores\casco_3D.glb` — 1626 KB, textura 4096×4096.
- **Servido aquí:** 813 KB, textura 1024×1024.

El modelo trae un atlas de 4096×4096 (888 KB, más de la mitad del peso del archivo) para un objeto decorativo de fondo que en pantalla nunca supera ~550 px. A 1024 la diferencia es invisible —medido: desviación de tono de 0.18/255 por canal— y el GLB baja a la mitad, que es lo que domina el coste en conexiones lentas.

Para regenerarlo desde el original tras cualquier cambio del modelo:

```bash
node tools/optimizar-glb.mjs "D:/Dev/GB Consultores/casco_3D.glb" public/models/casco.glb 1024
```

El script conserva geometría y accessors intactos; solo reencoda la textura embebida.
