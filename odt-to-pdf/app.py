"""
ODT-zu-PDF Konverter - Flask Web Application
Upload .odt files, validate content, and generate a combined PDF.
"""

import os
import uuid
import shutil
from datetime import datetime
from flask import Flask, request, render_template, send_file, jsonify, after_this_request
from werkzeug.utils import secure_filename

from odt_reader import read_odt, get_odt_metadata
from validator import validate_content, ValidationResult
from pdf_generator import generate_pdf

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB max
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')

ALLOWED_EXTENSIONS = {'odt'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def ensure_upload_dir():
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/convert', methods=['POST'])
def convert():
    ensure_upload_dir()

    if 'files' not in request.files:
        return jsonify({'error': 'Keine Dateien hochgeladen.'}), 400

    files = request.files.getlist('files')
    if not files or all(f.filename == '' for f in files):
        return jsonify({'error': 'Keine Dateien ausgewählt.'}), 400

    # Validate file types
    for f in files:
        if not f.filename or not allowed_file(f.filename):
            return jsonify({
                'error': f'Ungültige Datei: {f.filename}. Nur .odt Dateien sind erlaubt.'
            }), 400

    # Create unique session directory
    session_id = str(uuid.uuid4())[:8]
    session_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    os.makedirs(session_dir, exist_ok=True)

    try:
        # Save uploaded files
        saved_files = []
        file_names = []
        for f in files:
            filename = secure_filename(f.filename)
            if not filename:
                filename = f'dokument_{len(saved_files) + 1}.odt'
            filepath = os.path.join(session_dir, filename)
            f.save(filepath)
            saved_files.append(filepath)
            file_names.append(filename)

        # Sort files by name for consistent ordering
        paired = sorted(zip(file_names, saved_files))
        file_names = [p[0] for p in paired]
        saved_files = [p[1] for p in paired]

        # Read and parse all ODT files
        all_content = []
        all_results = ValidationResult()
        file_reports = []

        for filepath, filename in zip(saved_files, file_names):
            try:
                content = read_odt(filepath)
                metadata = get_odt_metadata(filepath)

                # Validate content
                content, result = validate_content(content)

                # Add file separator heading if multiple files
                if len(saved_files) > 1:
                    doc_title = metadata.get('title', filename.replace('.odt', ''))
                    all_content.append({
                        'type': 'heading',
                        'level': 1,
                        'text': doc_title
                    })

                all_content.extend(content)

                # Merge results
                all_results.corrections.extend(result.corrections)
                all_results.warnings.extend(result.warnings)
                all_results.info.extend(result.info)

                file_reports.append({
                    'filename': filename,
                    'blocks': len(content),
                    'corrections': len(result.corrections),
                    'warnings': len(result.warnings),
                })

            except Exception as e:
                file_reports.append({
                    'filename': filename,
                    'error': str(e),
                })
                all_results.warnings.append(
                    f"Fehler beim Lesen von '{filename}': {str(e)}"
                )

        if not all_content:
            return jsonify({
                'error': 'Kein Inhalt in den hochgeladenen Dateien gefunden.',
                'reports': file_reports,
                'validation': all_results.summary(),
            }), 400

        # Get document title
        custom_title = request.form.get('title', '').strip()
        if custom_title:
            doc_title = custom_title
        elif len(file_names) == 1:
            doc_title = file_names[0].replace('.odt', '')
        else:
            doc_title = f'Zusammengeführtes Dokument ({len(file_names)} Dateien)'

        # Generate PDF
        output_filename = f'dokument_{session_id}.pdf'
        output_path = os.path.join(session_dir, output_filename)
        generate_pdf(all_content, output_path, title=doc_title, file_names=file_names)

        # Clean up after sending
        @after_this_request
        def cleanup(response):
            try:
                shutil.rmtree(session_dir, ignore_errors=True)
            except Exception:
                pass
            return response

        return send_file(
            output_path,
            as_attachment=True,
            download_name=f'{doc_title}.pdf',
            mimetype='application/pdf'
        )

    except Exception as e:
        shutil.rmtree(session_dir, ignore_errors=True)
        return jsonify({'error': f'Fehler bei der Verarbeitung: {str(e)}'}), 500


@app.route('/validate', methods=['POST'])
def validate_only():
    """Validate files without generating PDF - returns validation report."""
    ensure_upload_dir()

    if 'files' not in request.files:
        return jsonify({'error': 'Keine Dateien hochgeladen.'}), 400

    files = request.files.getlist('files')
    if not files or all(f.filename == '' for f in files):
        return jsonify({'error': 'Keine Dateien ausgewählt.'}), 400

    session_id = str(uuid.uuid4())[:8]
    session_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    os.makedirs(session_dir, exist_ok=True)

    try:
        file_reports = []
        total_corrections = 0
        total_warnings = 0

        for f in files:
            if not f.filename or not allowed_file(f.filename):
                file_reports.append({
                    'filename': f.filename or 'unbekannt',
                    'error': 'Keine .odt Datei'
                })
                continue

            filename = secure_filename(f.filename)
            filepath = os.path.join(session_dir, filename)
            f.save(filepath)

            try:
                content = read_odt(filepath)
                content, result = validate_content(content)

                block_counts = {}
                for block in content:
                    t = block['type']
                    block_counts[t] = block_counts.get(t, 0) + 1

                file_reports.append({
                    'filename': filename,
                    'blocks': len(content),
                    'structure': block_counts,
                    'corrections': len(result.corrections),
                    'correction_details': result.corrections[:10],
                    'warnings': result.warnings[:10],
                    'info': result.info[:10],
                })
                total_corrections += len(result.corrections)
                total_warnings += len(result.warnings)

            except Exception as e:
                file_reports.append({
                    'filename': filename,
                    'error': str(e),
                })

        return jsonify({
            'files': file_reports,
            'total_files': len(files),
            'total_corrections': total_corrections,
            'total_warnings': total_warnings,
        })

    finally:
        shutil.rmtree(session_dir, ignore_errors=True)


if __name__ == '__main__':
    ensure_upload_dir()
    app.run(debug=True, host='0.0.0.0', port=5000)
