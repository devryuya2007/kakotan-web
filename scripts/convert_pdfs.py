#!/usr/bin/env python3
"""Convert all .pdf files in the current directory to text files under a target folder.

Usage:
  python3 scripts/convert_pdfs.py [--outdir texts] [--quiet]

This script uses pdfminer.six (package name: pdfminer.six).
"""
import argparse
import glob
import os
import sys

def extract(pdf_path):
    from pdfminer.high_level import extract_text
    return extract_text(pdf_path)

def main():
    p = argparse.ArgumentParser(description="Convert PDFs to text using pdfminer.six")
    p.add_argument("--outdir", default="texts", help="Output directory for text files")
    p.add_argument("--quiet", action="store_true", help="Minimal output")
    args = p.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    pdfs = sorted(glob.glob("*.pdf"))
    if not pdfs:
        if not args.quiet:
            print("No PDF files found in current directory.")
        return 0

    for pdf in pdfs:
        try:
            text = extract(pdf)
        except Exception as e:
            print(f"WARN: failed to extract {pdf}: {e}", file=sys.stderr)
            continue
        outpath = os.path.join(args.outdir, os.path.basename(pdf).replace('.pdf', '.txt'))
        with open(outpath, 'w', encoding='utf-8') as f:
            f.write(text)
        if not args.quiet:
            print(f"OK: {pdf} -> {outpath} ({os.path.getsize(outpath)} bytes)")

    return 0

if __name__ == '__main__':
    sys.exit(main())
