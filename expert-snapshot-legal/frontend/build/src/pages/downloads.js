import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export default function DownloadsPage() {
    const [exports, setExports] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchLogs() {
            try {
                const res = await fetch('/api/export-logs');
                const data = await res.json();
                setExports(data);
            }
            catch (error) {
                console.error('Failed to fetch export logs:', error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, []);
    return (_jsxs("div", { style: { padding: '2rem', maxWidth: '800px', margin: 'auto' }, children: [_jsx("h2", { children: "\uD83D\uDDC2\uFE0F Export Log Viewer" }), loading ? (_jsx("p", { children: "Loading export logs..." })) : exports.length === 0 ? (_jsx("p", { children: "No exports found yet." })) : (_jsx("ul", { children: exports.map((entry) => (_jsxs("li", { style: { marginBottom: '1rem' }, children: [_jsx("strong", { children: entry.filename }), _jsx("br", {}), "Client: ", entry.clientName, _jsx("br", {}), "Retainer Type: ", entry.retainerType, _jsx("br", {}), _jsx("em", { children: new Date(entry.timestamp).toLocaleString() })] }, entry.id))) }))] }));
}
