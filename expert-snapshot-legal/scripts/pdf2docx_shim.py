#!/usr/bin/env python3
import sys, fitz

# Normalize PyMuPDF API
if not hasattr(fitz.Rect, "get_area"):
    if hasattr(fitz.Rect, "getArea"):
        # Old API
        fitz.Rect.get_area = fitz.Rect.getArea
    else:
        # New API: synthesize get_area from width/height
        def _rect_get_area(self):
            try:
                return self.width * self.height
            except Exception:
                return abs((self.x1 - self.x0) * (self.y1 - self.y0))
        fitz.Rect.get_area = _rect_get_area

from pdf2docx.main import main

if __name__ == "__main__":
    sys.exit(main())
