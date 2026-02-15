"""
Content Validator Module
Checks and corrects content extracted from ODT files for logic and consistency.
"""

import re
from datetime import datetime


class ValidationResult:
    """Stores validation results and corrections."""

    def __init__(self):
        self.corrections = []
        self.warnings = []
        self.info = []

    def add_correction(self, original, corrected, reason):
        self.corrections.append({
            'original': original,
            'corrected': corrected,
            'reason': reason
        })

    def add_warning(self, message):
        self.warnings.append(message)

    def add_info(self, message):
        self.info.append(message)

    @property
    def has_corrections(self):
        return len(self.corrections) > 0

    def summary(self):
        lines = []
        if self.corrections:
            lines.append(f"{len(self.corrections)} Korrekturen vorgenommen:")
            for c in self.corrections:
                lines.append(f"  - {c['reason']}")
        if self.warnings:
            lines.append(f"{len(self.warnings)} Warnungen:")
            for w in self.warnings:
                lines.append(f"  - {w}")
        if self.info:
            lines.append(f"{len(self.info)} Hinweise:")
            for i in self.info:
                lines.append(f"  - {i}")
        return '\n'.join(lines) if lines else "Keine Probleme gefunden."


def fix_whitespace(text):
    """Fix excessive whitespace, preserving intentional line breaks."""
    # Replace multiple spaces with single space
    text = re.sub(r'[ \t]+', ' ', text)
    # Remove spaces at start/end of lines
    text = re.sub(r'^ +| +$', '', text, flags=re.MULTILINE)
    # Replace 3+ consecutive newlines with 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def fix_punctuation(text):
    """Fix common punctuation issues."""
    # Space before punctuation (remove)
    text = re.sub(r'\s+([.,;:!?])', r'\1', text)
    # Missing space after punctuation
    text = re.sub(r'([.,;:!?])([A-Za-zÄÖÜäöüß])', r'\1 \2', text)
    # Double punctuation
    text = re.sub(r'\.{2}(?!\.)', '.', text)
    text = re.sub(r',{2,}', ',', text)
    text = re.sub(r';;+', ';', text)
    # Fix quotation marks - normalize
    text = re.sub(r'["""]', '"', text)
    text = re.sub(r"['']", "'", text)
    return text


def fix_capitalization(text):
    """Fix basic capitalization issues (start of sentences)."""
    # Capitalize first letter of text
    if text and text[0].islower():
        text = text[0].upper() + text[1:]
    # Capitalize after sentence-ending punctuation
    text = re.sub(
        r'([.!?]\s+)([a-zäöü])',
        lambda m: m.group(1) + m.group(2).upper(),
        text
    )
    return text


def validate_date_formats(text, result):
    """Check and normalize date formats in text."""
    # Detect various date patterns
    # DD.MM.YYYY
    date_pattern = r'\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b'
    matches = re.finditer(date_pattern, text)

    for match in matches:
        day, month, year = match.groups()
        day_int = int(day)
        month_int = int(month)
        year_int = int(year)

        # Normalize 2-digit years
        if year_int < 100:
            year_int = 2000 + year_int if year_int < 50 else 1900 + year_int

        # Validate ranges
        if month_int < 1 or month_int > 12:
            result.add_warning(
                f"Ungültiger Monat in Datum: {match.group(0)}"
            )
        elif day_int < 1 or day_int > 31:
            result.add_warning(
                f"Ungültiger Tag in Datum: {match.group(0)}"
            )
        else:
            try:
                datetime(year_int, month_int, day_int)
            except ValueError:
                result.add_warning(
                    f"Ungültiges Datum: {match.group(0)}"
                )

        # Normalize to DD.MM.YYYY
        normalized = f"{int(day):02d}.{int(month):02d}.{year_int}"
        if normalized != match.group(0):
            text = text.replace(match.group(0), normalized, 1)
            result.add_correction(
                match.group(0), normalized,
                f"Datumsformat normalisiert: {match.group(0)} -> {normalized}"
            )

    return text


def validate_numbers(text, result):
    """Check number formatting consistency."""
    # Detect numbers with mixed decimal separators
    # German convention: 1.000,50
    # Check for likely wrong decimal separator usage
    wrong_decimal = re.findall(r'\b\d+\.\d{2}\b', text)
    for num in wrong_decimal:
        # Could be a decimal number using wrong separator
        if ',' not in num and not re.match(r'\d{1,2}\.\d{1,2}\.\d{2,4}', num):
            result.add_info(
                f"Dezimalzahl '{num}' - prüfe ob Komma statt Punkt gemeint ist"
            )

    return text


def validate_table(table_block, result):
    """Validate table content for consistency."""
    rows = table_block['rows']
    if not rows:
        return table_block

    # Check for empty cells in header
    if table_block.get('has_header') and rows:
        header = rows[0]
        empty_headers = sum(1 for h in header if not h.strip())
        if empty_headers > 0:
            result.add_warning(
                f"Tabelle hat {empty_headers} leere Spaltenüberschrift(en)"
            )

    # Check numeric columns for consistency
    if len(rows) > 1:
        num_cols = len(rows[0])
        for col_idx in range(num_cols):
            col_values = [row[col_idx] for row in rows[1:] if col_idx < len(row)]
            numeric_count = sum(
                1 for v in col_values
                if re.match(r'^[\d.,\-\s€$%]+$', v.strip()) and v.strip()
            )
            total_nonempty = sum(1 for v in col_values if v.strip())

            if total_nonempty > 0 and numeric_count > 0:
                if numeric_count < total_nonempty and numeric_count > total_nonempty * 0.5:
                    result.add_warning(
                        f"Spalte {col_idx + 1}: Gemischte numerische/Text-Werte gefunden"
                    )

    # Clean up cell content
    for i, row in enumerate(rows):
        for j, cell in enumerate(row):
            cleaned = fix_whitespace(cell)
            if cleaned != cell:
                rows[i][j] = cleaned
                result.add_correction(
                    cell, cleaned,
                    f"Tabellenzelle [{i+1},{j+1}]: Leerzeichen bereinigt"
                )

    table_block['rows'] = rows
    return table_block


def validate_heading_hierarchy(content, result):
    """Check that heading levels follow a logical hierarchy."""
    last_level = 0
    for block in content:
        if block['type'] == 'heading':
            level = block['level']
            if last_level > 0 and level > last_level + 1:
                result.add_warning(
                    f"Überschrift '{block['text']}' springt von Ebene {last_level} "
                    f"zu Ebene {level} (Ebene {last_level + 1} fehlt)"
                )
                # Auto-correct: reduce level to be at most one more than previous
                corrected_level = last_level + 1
                result.add_correction(
                    f"Ebene {level}", f"Ebene {corrected_level}",
                    f"Überschriftenebene korrigiert: '{block['text']}' "
                    f"von Ebene {level} auf {corrected_level}"
                )
                block['level'] = corrected_level
            last_level = block['level']
    return content


def validate_content(content):
    """
    Validate and correct a list of content blocks.

    Args:
        content: List of content blocks from odt_reader.read_odt()

    Returns:
        Tuple of (corrected_content, ValidationResult)
    """
    result = ValidationResult()

    # Check heading hierarchy
    content = validate_heading_hierarchy(content, result)

    for block in content:
        if block['type'] == 'paragraph':
            original = block['text']
            text = block['text']

            # Apply text corrections
            text = fix_whitespace(text)
            text = fix_punctuation(text)
            text = fix_capitalization(text)
            text = validate_date_formats(text, result)
            text = validate_numbers(text, result)

            if text != original:
                if original not in [c['original'] for c in result.corrections]:
                    result.add_correction(
                        original[:50] + '...' if len(original) > 50 else original,
                        text[:50] + '...' if len(text) > 50 else text,
                        "Text bereinigt (Leerzeichen/Interpunktion)"
                    )
                block['text'] = text

        elif block['type'] == 'heading':
            original = block['text']
            text = fix_whitespace(block['text'])
            text = fix_punctuation(text)

            # Headings should not end with a period
            if text.endswith('.'):
                text = text[:-1]
                result.add_correction(
                    original, text,
                    f"Punkt am Ende der Überschrift entfernt: '{original}'"
                )

            if text != original and not any(
                c['original'] == original for c in result.corrections
            ):
                result.add_correction(
                    original, text,
                    f"Überschrift bereinigt: '{original}'"
                )
            block['text'] = text

        elif block['type'] == 'table':
            block = validate_table(block, result)

        elif block['type'] == 'list':
            for item in block['items']:
                original = item['text']
                text = fix_whitespace(item['text'])
                text = fix_punctuation(text)
                if text != original:
                    result.add_correction(
                        original[:40] + '...' if len(original) > 40 else original,
                        text[:40] + '...' if len(text) > 40 else text,
                        "Listeneintrag bereinigt"
                    )
                    item['text'] = text

    # Check for duplicate content blocks
    seen_texts = set()
    duplicates = []
    for i, block in enumerate(content):
        if block['type'] in ('paragraph', 'heading'):
            text = block['text'].strip().lower()
            if text and len(text) > 20 and text in seen_texts:
                duplicates.append(i)
                result.add_warning(
                    f"Doppelter Inhalt gefunden: '{block['text'][:50]}...'"
                )
            seen_texts.add(text)

    # Remove exact duplicates (keep first occurrence)
    for idx in reversed(duplicates):
        content.pop(idx)
        result.add_correction(
            "Doppelter Block", "Entfernt",
            "Doppelten Absatz entfernt"
        )

    # Check for empty document
    if not content:
        result.add_warning("Dokument ist leer oder enthält keinen erkennbaren Inhalt")

    return content, result
