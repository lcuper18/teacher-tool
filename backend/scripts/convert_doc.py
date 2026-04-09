#!/usr/bin/env python3
"""
Script para convertir archivos .doc a .docx usando LibreOffice headless.
Imprime JSON con la ruta del archivo convertido al stdout.

Usage: python convert_doc.py <ruta_archivo.doc>
"""

import json
import os
import sys
import subprocess
import tempfile
import shutil
from pathlib import Path


# Ruta de LibreOffice (definida en el plan)
LIBREOFFICE_PATH = os.environ.get("LIBREOFFICE_PATH", "/usr/bin/libreoffice")


def convert_doc_to_docx(doc_path: str) -> dict:
    """
    Convierte un archivo .doc a .docx usando LibreOffice headless.

    Args:
        doc_path: Ruta absoluta o relativa al archivo .doc

    Returns:
        dict con success, docx_path o error
    """
    # Validar que el archivo existe
    if not os.path.exists(doc_path):
        return {
            "success": False,
            "error": f"El archivo no existe: {doc_path}",
            "code": "FILE_NOT_FOUND",
        }

    # Validar extensión
    ext = Path(doc_path).suffix.lower()
    if ext != ".doc":
        return {
            "success": False,
            "error": f"El archivo no es un .doc: {ext}",
            "code": "INVALID_EXTENSION",
        }

    # Verificar que LibreOffice existe
    if not os.path.exists(LIBREOFFICE_PATH):
        return {
            "success": False,
            "error": f"LibreOffice no encontrado en: {LIBREOFFICE_PATH}",
            "code": "LIBREOFFICE_NOT_FOUND",
        }

    try:
        # Obtener directorio y nombre base del archivo
        doc_dir = os.path.dirname(os.path.abspath(doc_path))
        doc_basename = Path(doc_path).stem

        # Crear directorio temporal para la conversión si es necesario
        # LibreOffice necesita un directorio de salida
        with tempfile.TemporaryDirectory() as temp_dir:
            # Comando: libreoffice --headless --convert-to docx --outdir <dir> <archivo>
            cmd = [
                LIBREOFFICE_PATH,
                "--headless",
                "--convert-to",
                "docx",
                "--outdir",
                temp_dir,
                doc_path,
            ]

            # Ejecutar LibreOffice
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,  # Timeout de 60 segundos
            )

            if result.returncode != 0:
                return {
                    "success": False,
                    "error": f"Error al convertir archivo: {result.stderr}",
                    "code": "CONVERSION_FAILED",
                }

            # El archivo convertido tendrá el mismo nombre pero extensión .docx
            converted_filename = f"{doc_basename}.docx"
            converted_path = os.path.join(temp_dir, converted_filename)

            if not os.path.exists(converted_path):
                return {
                    "success": False,
                    "error": "La conversión no generó el archivo esperado.",
                    "code": "CONVERSION_FAILED",
                }

            # Mover el archivo convertido al directorio original
            final_docx_path = os.path.join(doc_dir, converted_filename)

            # Si ya existe un archivo con ese nombre, eliminarlo
            if os.path.exists(final_docx_path):
                os.remove(final_docx_path)

            shutil.move(converted_path, final_docx_path)

            return {"success": True, "docx_path": final_docx_path}

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "La conversión excedió el tiempo máximo (60s).",
            "code": "TIMEOUT",
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error durante la conversión: {str(e)}",
            "code": "CONVERSION_ERROR",
        }


def main():
    if len(sys.argv) < 2:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": "Uso: python convert_doc.py <ruta_archivo.doc>",
                    "code": "INVALID_ARGS",
                }
            )
        )
        sys.exit(1)

    doc_path = sys.argv[1]
    result = convert_doc_to_docx(doc_path)

    # Imprimir resultado como JSON
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
