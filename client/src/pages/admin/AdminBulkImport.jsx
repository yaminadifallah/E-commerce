import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Download, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../api/axios.js';

const TEMPLATE_HEADERS = ['name', 'description', 'price', 'promotionPrice', 'stock', 'categoryName', 'colorNames', 'featured', 'active'];

// Small CSV parser that handles quoted fields containing commas.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field); field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && next === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] || '').trim(); });
    return obj;
  });
}

function downloadTemplate() {
  const sample = [
    TEMPLATE_HEADERS.join(','),
    'Sample T-Shirt,"A soft, comfortable cotton t-shirt.",1500,1200,25,Women\'s Accessories,"Black,White",true,true',
  ].join('\n');
  const blob = new Blob([sample], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'product-import-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminBulkImport() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      const parsed = parseCSV(evt.target.result);
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (rows.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/admin/products/bulk-import', { products: rows });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm text-mist-dim hover:text-mist">
        <ArrowLeft size={14} /> Back to Products
      </Link>

      <h1 className="mb-2 font-display text-2xl font-semibold text-mist">Bulk Add Products</h1>
      <p className="mb-6 text-sm text-mist-dim">
        Upload a CSV file to create many products at once — much faster than adding them one by one.
      </p>

      <div className="card-surface mb-6 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={downloadTemplate} className="btn-secondary">
            <Download size={16} /> Download CSV Template
          </button>
          <label className="btn-primary cursor-pointer">
            <Upload size={16} /> Choose CSV File
            <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </label>
          {fileName && <span className="text-sm text-mist-dim">{fileName} — {rows.length} row(s) found</span>}
        </div>
        <p className="mt-4 text-xs text-mist-dim">
          Required columns: <code className="text-signal">name</code>, <code className="text-signal">price</code>, <code className="text-signal">categoryName</code> (must match an existing category exactly).
          Optional: description, promotionPrice, stock, colorNames (comma-separated, semicolon-free e.g. "Black,White"), featured, active.
        </p>
      </div>

      {rows.length > 0 && !result && (
        <div className="card-surface mb-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ink-softer text-mist-dim">
              <tr>{TEMPLATE_HEADERS.map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((r, i) => (
                <tr key={i} className="border-t border-ink-line">
                  {TEMPLATE_HEADERS.map((h) => <td key={h} className="max-w-[160px] truncate px-3 py-2 text-mist-dim">{r[h]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 10 && <p className="px-3 py-2 text-xs text-mist-dim">...and {rows.length - 10} more row(s)</p>}
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {rows.length > 0 && !result && (
        <button onClick={handleImport} disabled={submitting} className="btn-primary disabled:opacity-60">
          {submitting ? 'Importing...' : `Import ${rows.length} Product(s)`}
        </button>
      )}

      {result && (
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 size={18} />
            <p className="font-medium">{result.createdCount} product(s) created successfully.</p>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-amber">
                <AlertTriangle size={16} />
                <p className="text-sm font-medium">{result.errors.length} row(s) had errors:</p>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-mist-dim">
                {result.errors.map((e, i) => (
                  <li key={i}>Row {e.row}: {e.message}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Link to="/admin/products" className="btn-primary">View Products</Link>
            <button onClick={() => { setRows([]); setResult(null); setFileName(''); }} className="btn-secondary">
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
