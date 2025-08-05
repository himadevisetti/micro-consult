import { useEffect, useState } from 'react';

type ExportLog = {
  id: string;
  filename: string;
  clientName: string;
  retainerType: string;
  timestamp: string;
};

export default function DownloadsPage() {
  const [exports, setExports] = useState<ExportLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/export-logs');
        const data = await res.json();
        setExports(data);
      } catch (error) {
        console.error('Failed to fetch export logs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h2>🗂️ Export Log Viewer</h2>
      {loading ? (
        <p>Loading export logs...</p>
      ) : exports.length === 0 ? (
        <p>No exports found yet.</p>
      ) : (
        <ul>
          {exports.map((entry) => (
            <li key={entry.id} style={{ marginBottom: '1rem' }}>
              <strong>{entry.filename}</strong>
              <br />
              Client: {entry.clientName}
              <br />
              Retainer Type: {entry.retainerType}
              <br />
              <em>{new Date(entry.timestamp).toLocaleString()}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
