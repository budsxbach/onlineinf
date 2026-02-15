"""
ODT Reader Module
Parses .odt files and extracts structured content (text, headings, tables, lists).
"""

from odf.opendocument import load
from odf.text import H, P, List, ListItem, Span
from odf.table import Table, TableRow, TableCell
from odf.draw import Frame, Image
import re

# odfpy's element constructors are factory functions; get qnames from instances
_H_QNAME = H(outlinelevel=1, text='').qname
_P_QNAME = P(text='').qname
_TABLE_QNAME = Table().qname
_LIST_QNAME = List().qname


def _get_text_content(element):
    """Recursively extract text content from an ODF element."""
    parts = []
    if hasattr(element, 'childNodes'):
        for child in element.childNodes:
            if hasattr(child, 'data'):
                parts.append(child.data)
            elif child.qname == (u'urn:oasis:names:tc:opendocument:xmlns:text:1.0', 'tab'):
                parts.append('\t')
            elif child.qname == (u'urn:oasis:names:tc:opendocument:xmlns:text:1.0', 'line-break'):
                parts.append('\n')
            elif child.qname == (u'urn:oasis:names:tc:opendocument:xmlns:text:1.0', 's'):
                count = child.getAttribute('c') or '1'
                parts.append(' ' * int(count))
            else:
                parts.append(_get_text_content(child))
    return ''.join(parts)


def _get_style_name(element):
    """Get the style name of an element."""
    style = element.getAttribute('stylename')
    return str(style) if style else ''


def _parse_table(table_element):
    """Parse an ODF table into a list of rows (each row is a list of cell texts)."""
    rows = []
    for row in table_element.getElementsByType(TableRow):
        cells = []
        for cell in row.getElementsByType(TableCell):
            repeat = cell.getAttribute('numbercolumnsrepeated')
            cell_text = _get_text_content(cell).strip()
            if repeat:
                for _ in range(int(repeat)):
                    cells.append(cell_text)
            else:
                cells.append(cell_text)
        # Skip completely empty rows
        if any(c.strip() for c in cells):
            rows.append(cells)
    return rows


def _normalize_table(rows):
    """Ensure all rows have the same number of columns."""
    if not rows:
        return rows
    max_cols = max(len(row) for row in rows)
    for row in rows:
        while len(row) < max_cols:
            row.append('')
    # Trim trailing empty columns
    while max_cols > 0 and all(row[max_cols - 1].strip() == '' for row in rows):
        max_cols -= 1
        for row in rows:
            row.pop()
    return rows


def _detect_heading_level(style_name, text):
    """Detect heading level from style name."""
    style_lower = style_name.lower()
    for i in range(1, 7):
        if f'heading_{i}' in style_lower or f'heading{i}' in style_lower or f'Heading_{i}' in style_lower:
            return i
    if 'heading' in style_lower or 'titel' in style_lower or 'title' in style_lower:
        return 1
    if 'untertitel' in style_lower or 'subtitle' in style_lower:
        return 2
    return 0


def _parse_list(list_element, depth=0):
    """Parse a list element into structured list items."""
    items = []
    for item in list_element.getElementsByType(ListItem):
        text = _get_text_content(item).strip()
        if text:
            items.append({'depth': depth, 'text': text})
        # Check for nested lists
        for nested_list in item.getElementsByType(List):
            items.extend(_parse_list(nested_list, depth + 1))
    return items


def read_odt(filepath):
    """
    Read an ODT file and return structured content.

    Returns a list of content blocks, each being a dict with:
      - type: 'heading', 'paragraph', 'table', 'list'
      - For headings: level (int), text (str)
      - For paragraphs: text (str), style (str)
      - For tables: rows (list of lists), has_header (bool)
      - For lists: items (list of dicts with depth and text)
    """
    doc = load(filepath)
    body = doc.body
    content = []

    # The actual content is in office:text (child of office:body)
    text_container = body
    for child in body.childNodes:
        if hasattr(child, 'qname') and child.qname[1] == 'text':
            text_container = child
            break

    for element in text_container.childNodes:
        # Skip non-element nodes
        if not hasattr(element, 'qname'):
            continue

        qname = element.qname

        # Headings
        if qname == _H_QNAME:
            level = element.getAttribute('outlinelevel')
            level = int(level) if level else 1
            text = _get_text_content(element).strip()
            if text:
                content.append({
                    'type': 'heading',
                    'level': level,
                    'text': text
                })

        # Paragraphs
        elif qname == _P_QNAME:
            text = _get_text_content(element).strip()
            style = _get_style_name(element)
            heading_level = _detect_heading_level(style, text)

            if heading_level > 0 and text:
                content.append({
                    'type': 'heading',
                    'level': heading_level,
                    'text': text
                })
            elif text:
                content.append({
                    'type': 'paragraph',
                    'text': text,
                    'style': style
                })

        # Tables
        elif qname == _TABLE_QNAME:
            rows = _parse_table(element)
            rows = _normalize_table(rows)
            if rows:
                content.append({
                    'type': 'table',
                    'rows': rows,
                    'has_header': len(rows) > 1
                })

        # Lists
        elif qname == _LIST_QNAME:
            items = _parse_list(element)
            if items:
                content.append({
                    'type': 'list',
                    'items': items
                })

    return content


def get_odt_metadata(filepath):
    """Extract metadata from an ODT file."""
    doc = load(filepath)
    meta = {}

    if doc.meta:
        for child in doc.meta.childNodes:
            if hasattr(child, 'qname'):
                tag = child.qname[1] if isinstance(child.qname, tuple) else str(child.qname)
                text = _get_text_content(child).strip()
                if text:
                    meta[tag] = text

    return meta
