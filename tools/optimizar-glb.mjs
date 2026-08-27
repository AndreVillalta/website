/**
 * Reduce la textura embebida del GLB del casco.
 *
 * El modelo viene con un atlas de 4096x4096 (~909 KB de los 1.63 MB del
 * archivo) para un objeto decorativo que en pantalla nunca pasa de ~550 px.
 * Bajarlo a 1024 es invisible a ese tamano y recorta mas de la mitad del peso
 * total, que es lo que domina el coste en conexiones lentas.
 *
 * Escribe a un archivo nuevo: el original no se toca.
 *
 * Uso: node tools/optimizar-glb.mjs <entrada.glb> <salida.glb> [lado]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const [, , entrada, salida, ladoArg] = process.argv;
if (!entrada || !salida) {
  console.error('uso: node tools/optimizar-glb.mjs <entrada.glb> <salida.glb> [lado]');
  process.exit(1);
}
const LADO = Number(ladoArg) || 1024;

const buf = readFileSync(entrada);
if (buf.toString('utf8', 0, 4) !== 'glTF') throw new Error('no es un GLB');

const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));

const binChunkStart = 20 + jsonLen;
const binLen = buf.readUInt32LE(binChunkStart);
const binStart = binChunkStart + 8;
const bin = buf.subarray(binStart, binStart + binLen);

const imagen = json.images?.[0];
if (imagen?.bufferView === undefined) throw new Error('el GLB no tiene una imagen embebida');

const bv = json.bufferViews[imagen.bufferView];
const off = bv.byteOffset ?? 0;

// Este script asume que la textura es el ultimo bufferView del BIN: asi se
// reemplaza truncando y volviendo a anexar, sin recalcular los offsets de los
// demas. Si algun dia deja de serlo, hay que reordenar antes de tocar nada.
const esUltimo = json.bufferViews.every((otro, i) =>
  i === imagen.bufferView || (otro.byteOffset ?? 0) + otro.byteLength <= off,
);
if (!esUltimo) throw new Error('la textura no es el ultimo bufferView; este script no cubre ese caso');

const original = bin.subarray(off, off + bv.byteLength);
const meta = await sharp(original).metadata();

const redimensionada = await sharp(original)
  .resize(LADO, LADO, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toBuffer();

// --- Reconstruir el GLB ---------------------------------------------------
bv.byteLength = redimensionada.length;
const nuevoBinSinPadding = Buffer.concat([bin.subarray(0, off), redimensionada]);
json.buffers[0].byteLength = nuevoBinSinPadding.length;

const pad = (n, a) => (a - (n % a)) % a;

const jsonTexto = Buffer.from(JSON.stringify(json), 'utf8');
const jsonPad = Buffer.alloc(pad(jsonTexto.length, 4), 0x20); // espacios
const jsonChunk = Buffer.concat([jsonTexto, jsonPad]);

const binPad = Buffer.alloc(pad(nuevoBinSinPadding.length, 4), 0x00);
const binChunk = Buffer.concat([nuevoBinSinPadding, binPad]);

const total = 12 + 8 + jsonChunk.length + 8 + binChunk.length;
const salidaBuf = Buffer.alloc(total);
let p = 0;
salidaBuf.write('glTF', p); p += 4;
salidaBuf.writeUInt32LE(2, p); p += 4;
salidaBuf.writeUInt32LE(total, p); p += 4;
salidaBuf.writeUInt32LE(jsonChunk.length, p); p += 4;
salidaBuf.write('JSON', p); p += 4;
jsonChunk.copy(salidaBuf, p); p += jsonChunk.length;
salidaBuf.writeUInt32LE(binChunk.length, p); p += 4;
salidaBuf.write('BIN\0', p); p += 4;
binChunk.copy(salidaBuf, p);

writeFileSync(salida, salidaBuf);

const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log(`textura: ${meta.width}x${meta.height} ${kb(original.length)} -> ${LADO}px ${kb(redimensionada.length)}`);
console.log(`GLB:     ${kb(buf.length)} -> ${kb(salidaBuf.length)}  (-${(100 * (1 - salidaBuf.length / buf.length)).toFixed(0)}%)`);
