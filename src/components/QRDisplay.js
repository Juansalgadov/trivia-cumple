// ============================================================================
// QRDisplay.js — Componente de Código QR
// ============================================================================
//
// Muestra un código QR que los jugadores pueden escanear con su celular
// para entrar directamente a la URL del juego.
// Aunque ya no se usa en el Lobby (el host genera su propio QR),
// este componente queda disponible por si se necesita más adelante.
// ============================================================================
'use client';

import { QRCodeSVG } from 'qrcode.react';
import styles from './QRDisplay.module.css';

/**
 * Muestra un código QR a partir de una URL.
 * @param {string} props.url - La URL que se codifica dentro del QR
 */
export default function QRDisplay({ url }) {
  return (
    <div className={styles.qrContainer}>
      <div className={styles.qrWrapper}>
        <QRCodeSVG
          value={url || 'https://ejemplo.com/join'}
          size={220}
          bgColor="transparent"
          fgColor="#ffffff"
          level="H"  // Nivel de corrección alto: el QR sigue siendo legible aunque esté un poco tapado
          includeMargin={false}
        />
      </div>
      <p className={styles.qrLabel}>Escanea para unirte 📱</p>
      <p className={styles.qrUrl}>{url}</p>
    </div>
  );
}
