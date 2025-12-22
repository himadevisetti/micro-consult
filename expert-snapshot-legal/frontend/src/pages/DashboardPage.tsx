// src/pages/DashboardPage.tsx

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/DashboardPage.module.css";
import AppHeader from "../components/AppHeader";
import { getDecodedToken } from "@/utils/authToken";
import type { DocumentRow } from "@/types/DocumentRow";
import { logDebug, logWarn, logError } from "@/utils/logger";
import { downloadWithAuth } from "@/utils/downloadWithAuth";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Decode token once to get customerId
  const decoded = getDecodedToken();
  const customerId = decoded?.customerId;

  // 🔹 Ref guard to prevent double fetch in React StrictMode
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const fetchDocs = async () => {
      if (!customerId) {
        logWarn("dashboard.noCustomerId");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`/api/dashboard/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            navigate("/login");
            return;
          }
          throw new Error(`Dashboard fetch failed: ${res.statusText}`);
        }

        const data = await res.json();

        if (data.success && Array.isArray(data.documents)) {
          logDebug("dashboard.success", { count: data.documents.length });
          setDocuments(data.documents);
        } else {
          logWarn("dashboard.invalidPayload", {
            success: data.success,
            hasDocuments: Array.isArray(data.documents),
          });
        }
      } catch (err) {
        logError("dashboard.fetchError", {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [customerId, navigate]);

  // 🔹 Download handler calls the backend /api/download route
  const handleDownload = (doc: DocumentRow) => {
    if (!doc.id || !doc.customerId) {
      logError("dashboard.download.missingIdentifiers", { doc });
      alert("Missing document identifiers");
      return;
    }

    const url = `/api/download/${doc.customerId}/${doc.id}`;
    logDebug("dashboard.download", { id: doc.id, fileName: doc.fileName });

    // 🔹 Use centralized utility for auth + blob download
    downloadWithAuth(url, doc.fileName, navigate);
  };

  // 🔹 Home button navigates to landing page
  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className={styles.pageWrapper}>
      <AppHeader
        showHomeButton={true}
        mainHeading="Your Documents"
        onHomeClick={handleHomeClick}
      />

      <main className={styles.dashboardMain}>
        {loading ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p>No documents found within retention period.</p>
        ) : (
          <table className={styles.docTable}>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size (KB)</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.fileName}</td>
                  <td>{doc.fileSize ? Math.round(doc.fileSize / 1024) : "-"}</td>
                  <td>{new Date(doc.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.downloadButton}
                      onClick={() => handleDownload(doc)}
                    >
                      ⬇️ Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
