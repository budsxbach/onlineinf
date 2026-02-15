"""
PDF Generator Module
Creates a well-structured PDF from validated content blocks using ReportLab.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white, Color
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, KeepTogether, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
import re


# Color palette
PRIMARY_COLOR = HexColor('#2C3E50')
SECONDARY_COLOR = HexColor('#3498DB')
ACCENT_COLOR = HexColor('#E74C3C')
LIGHT_BG = HexColor('#F8F9FA')
TABLE_HEADER_BG = HexColor('#2C3E50')
TABLE_HEADER_TEXT = white
TABLE_ALT_ROW = HexColor('#F2F3F4')
TABLE_BORDER = HexColor('#BDC3C7')
TEXT_COLOR = HexColor('#2C3E50')
MUTED_COLOR = HexColor('#7F8C8D')


def _create_styles():
    """Create custom paragraph styles for the PDF."""
    styles = getSampleStyleSheet()

    # Title
    styles.add(ParagraphStyle(
        name='DocTitle',
        parent=styles['Title'],
        fontSize=24,
        leading=30,
        textColor=PRIMARY_COLOR,
        spaceAfter=6 * mm,
        alignment=TA_LEFT,
        fontName='Helvetica-Bold',
    ))

    # Heading styles
    heading_configs = [
        ('DocH1', 18, 24, 8 * mm, 3 * mm),
        ('DocH2', 15, 20, 6 * mm, 2 * mm),
        ('DocH3', 13, 17, 5 * mm, 2 * mm),
        ('DocH4', 11, 15, 4 * mm, 1 * mm),
        ('DocH5', 10, 14, 3 * mm, 1 * mm),
        ('DocH6', 9, 13, 3 * mm, 1 * mm),
    ]

    for name, size, leading, space_before, space_after in heading_configs:
        styles.add(ParagraphStyle(
            name=name,
            parent=styles['Heading1'],
            fontSize=size,
            leading=leading,
            textColor=PRIMARY_COLOR,
            spaceBefore=space_before,
            spaceAfter=space_after,
            fontName='Helvetica-Bold',
        ))

    # Body text
    styles.add(ParagraphStyle(
        name='DocBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=15,
        textColor=TEXT_COLOR,
        spaceAfter=3 * mm,
        alignment=TA_JUSTIFY,
        fontName='Helvetica',
    ))

    # List item style
    styles.add(ParagraphStyle(
        name='DocListItem',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=TEXT_COLOR,
        leftIndent=5 * mm,
        fontName='Helvetica',
    ))

    # Table cell styles
    styles.add(ParagraphStyle(
        name='TableHeader',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=TABLE_HEADER_TEXT,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
    ))

    styles.add(ParagraphStyle(
        name='TableCell',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=TEXT_COLOR,
        fontName='Helvetica',
    ))

    # Footer style
    styles.add(ParagraphStyle(
        name='Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=MUTED_COLOR,
        alignment=TA_CENTER,
    ))

    return styles


def _escape_xml(text):
    """Escape special XML characters for ReportLab Paragraph."""
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    return text


def _build_table(table_block, styles, available_width):
    """Build a ReportLab Table from a table content block."""
    rows = table_block['rows']
    has_header = table_block.get('has_header', False)

    if not rows:
        return None

    num_cols = max(len(row) for row in rows)
    if num_cols == 0:
        return None

    # Calculate column widths
    col_width = available_width / num_cols

    # Build table data with Paragraph objects for text wrapping
    table_data = []
    for row_idx, row in enumerate(rows):
        table_row = []
        for col_idx in range(num_cols):
            cell_text = row[col_idx] if col_idx < len(row) else ''
            cell_text = _escape_xml(cell_text)

            if row_idx == 0 and has_header:
                style = styles['TableHeader']
            else:
                style = styles['TableCell']

            table_row.append(Paragraph(cell_text, style))
        table_data.append(table_row)

    # Create table
    col_widths = [col_width] * num_cols
    table = Table(table_data, colWidths=col_widths, repeatRows=1 if has_header else 0)

    # Style the table
    style_commands = [
        # Overall
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, TABLE_BORDER),
    ]

    # Header styling
    if has_header and len(rows) > 0:
        style_commands.extend([
            ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_BG),
            ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, PRIMARY_COLOR),
        ])

    # Alternating row colors
    for i in range(1 if has_header else 0, len(rows)):
        if i % 2 == (0 if has_header else 1):
            style_commands.append(
                ('BACKGROUND', (0, i), (-1, i), TABLE_ALT_ROW)
            )

    table.setStyle(TableStyle(style_commands))
    return table


def _build_list(list_block, styles):
    """Build a ReportLab ListFlowable from a list content block."""
    items = list_block['items']
    if not items:
        return None

    bullet_items = []
    for item in items:
        text = _escape_xml(item['text'])
        indent = item.get('depth', 0)
        style = ParagraphStyle(
            name=f'ListItem_{id(item)}',
            parent=styles['DocListItem'],
            leftIndent=(indent * 10) * mm,
            bulletIndent=(indent * 10) * mm,
        )
        bullet_items.append(
            ListItem(Paragraph(text, style), bulletColor=SECONDARY_COLOR)
        )

    return ListFlowable(
        bullet_items,
        bulletType='bullet',
        bulletFontSize=6,
        bulletColor=SECONDARY_COLOR,
        leftIndent=8 * mm,
        spaceBefore=2 * mm,
        spaceAfter=3 * mm,
    )


def _header_footer(canvas, doc):
    """Draw header and footer on each page."""
    canvas.saveState()
    width, height = A4

    # Footer line
    canvas.setStrokeColor(TABLE_BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, 15 * mm, width - 20 * mm, 15 * mm)

    # Page number
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(MUTED_COLOR)
    canvas.drawCentredString(
        width / 2, 10 * mm,
        f"Seite {doc.page}"
    )

    # Header line (subtle)
    canvas.setStrokeColor(LIGHT_BG)
    canvas.setLineWidth(0.3)
    canvas.line(20 * mm, height - 15 * mm, width - 20 * mm, height - 15 * mm)

    canvas.restoreState()


def generate_pdf(content_blocks, output_path, title=None, file_names=None):
    """
    Generate a PDF from validated content blocks.

    Args:
        content_blocks: List of content block dicts (from validator)
        output_path: Path for the output PDF file
        title: Optional document title
        file_names: Optional list of source file names
    """
    styles = _create_styles()

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title=title or 'Generiertes Dokument',
        author='ODT-zu-PDF Konverter',
    )

    available_width = A4[0] - 40 * mm  # page width minus margins
    story = []

    # Title page elements
    if title:
        story.append(Spacer(1, 15 * mm))
        story.append(Paragraph(_escape_xml(title), styles['DocTitle']))
        story.append(HRFlowable(
            width='100%', thickness=1.5, color=SECONDARY_COLOR,
            spaceBefore=2 * mm, spaceAfter=4 * mm
        ))

    if file_names:
        source_text = "Quelldateien: " + ", ".join(file_names)
        story.append(Paragraph(
            _escape_xml(source_text),
            ParagraphStyle(
                name='SourceInfo',
                parent=styles['DocBody'],
                fontSize=9,
                textColor=MUTED_COLOR,
                spaceAfter=8 * mm,
            )
        ))

    # Build content
    for block in content_blocks:
        block_type = block['type']

        if block_type == 'heading':
            level = block.get('level', 1)
            style_name = f'DocH{min(level, 6)}'
            text = _escape_xml(block['text'])

            # Add a decorative line under H1
            if level == 1:
                story.append(Spacer(1, 3 * mm))

            story.append(Paragraph(text, styles[style_name]))

            if level == 1:
                story.append(HRFlowable(
                    width='40%', thickness=1, color=SECONDARY_COLOR,
                    spaceBefore=1 * mm, spaceAfter=3 * mm
                ))

        elif block_type == 'paragraph':
            text = _escape_xml(block['text'])
            story.append(Paragraph(text, styles['DocBody']))

        elif block_type == 'table':
            table = _build_table(block, styles, available_width)
            if table:
                story.append(Spacer(1, 3 * mm))
                story.append(KeepTogether([table]))
                story.append(Spacer(1, 3 * mm))

        elif block_type == 'list':
            list_flowable = _build_list(block, styles)
            if list_flowable:
                story.append(list_flowable)

    # If no content, add placeholder
    if not story or (len(story) <= 3 and title):
        story.append(Paragraph(
            "Kein Inhalt in den Quelldateien gefunden.",
            styles['DocBody']
        ))

    doc.build(story, onFirstPage=_header_footer, onLaterPages=_header_footer)
    return output_path
