import { useEffect, useState } from "react";
import { useLoader } from "../context/LoaderContext";
import type { UpdateVisitRequest, Visit } from "../types/Visit";

const OUTCOME_OPTIONS = [
  "Interested",
  "Needs time",
  "Not interested",
  "No show",
];

const NEXT_ACTION_OPTIONS = [
  "Send price sheet",
  "Second visit with wife",
  "Second visit with Family",
  "Call on Monday",
  "Call on Tuesday",
  "Call on Wednesday",
  "Call on Thursday",
  "Call on Friday",
  "Call on Saturday",
  "Call on Sunday",
];

export default function Dashboard() {
  const { showLoader, hideLoader } = useLoader();
  const [executives, setExecutives] = useState<string[]>([]);
  const [selectedExecutive, setSelectedExecutive] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [error, setError] = useState("");
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [editOutcome, setEditOutcome] = useState("");
  const [editNextAction, setEditNextAction] = useState("");
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadExecutives = async () => {
      showLoader();
      setError("");

      try {
        const response = await fetch("/api/visits/executives");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setExecutives(await response.json());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load executives.",
        );
      } finally {
        hideLoader();
      }
    };

    void loadExecutives();
  }, [showLoader, hideLoader]);

  const loadVisits = async () => {
    if (!selectedExecutive) {
      setVisits([]);
      return;
    }

    showLoader();
    setError("");

    try {
      const params = new URLSearchParams({ executive: selectedExecutive });
      if (selectedDate) params.set("date", selectedDate);

      const response = await fetch(`/api/visits?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setVisits(await response.json());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard data.",
      );
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    void loadVisits();
  }, [selectedExecutive, selectedDate]);

  const openEditModal = (visit: Visit) => {
    setEditingVisit(visit);
    setEditOutcome(visit.outcome);
    setEditNextAction(visit.nextAction);
    setEditError("");
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setEditingVisit(null);
    setEditError("");
  };

  const saveVisit = async () => {
    if (!editingVisit) return;

    if (!OUTCOME_OPTIONS.includes(editOutcome)) {
      setEditError("Please select a valid outcome.");
      return;
    }

    if (!NEXT_ACTION_OPTIONS.includes(editNextAction)) {
      setEditError("Please select a valid next action.");
      return;
    }

    const payload: UpdateVisitRequest = {
      outcome: editOutcome,
      nextAction: editNextAction,
    };

    setIsSaving(true);
    setEditError("");
    showLoader();

    try {
      const response = await fetch(
        `/api/visits/${encodeURIComponent(editingVisit.visitId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP ${response.status}`);
      }

      setEditingVisit(null);
      await loadVisits();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Unable to update visit.",
      );
    } finally {
      hideLoader();
      setIsSaving(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const response = await fetch("/api/visits/download");

      if (!response.ok) {
        throw new Error("Failed to download CSV.");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "visits.csv";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV download failed:", error);
    }
  };

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <h1>Visits Dashboard</h1>
        </div>
      </header>

      <section
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
          marginBottom: "10px",
        }}
      >
        <button
          type="button"
          onClick={handleDownloadCsv}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Download Latest CSV
        </button>
      </section>

      <section className="filters">
        <label>
          Executive
          <select
            value={selectedExecutive}
            onChange={(event) => {
              setSelectedExecutive(event.target.value);
              setSelectedDate("");
            }}
          >
            <option value="">Select an executive</option>
            {executives.map((executive) => (
              <option key={executive} value={executive}>
                {executive}
              </option>
            ))}
          </select>
        </label>

        <label>
          Visit date
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              disabled={!selectedExecutive}
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                title="Clear date"
                style={{ marginLeft: "8px" }}
              >
                Clear Date
              </button>
            )}
          </div>
        </label>
      </section>

      {error && <p className="error">Backend connection failed: {error}</p>}

      {!selectedExecutive && !error && (
        <div className="empty-state">
          Select an executive to view dashboard data.
        </div>
      )}

      {selectedExecutive && !error && visits.length === 0 && (
        <div className="empty-state">
          No visits found for the selected filters.
        </div>
      )}

      {selectedExecutive && visits.length > 0 && (
        <section className="table-card">
          <div className="table-header">
            <h2>{selectedExecutive}</h2>
            <span>{visits.length} visit(s)</span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Visit ID</th>
                  <th>Lead ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Project</th>
                  <th>Config</th>
                  <th>Visit At</th>
                  <th>Executive</th>
                  <th>Outcome</th>
                  <th>Next Action</th>
                  <th>Ai Brief</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.visitId}>
                    <td>{visit.visitId}</td>
                    <td>{visit.leadId}</td>
                    <td>{visit.customerName}</td>
                    <td>{visit.phone}</td>
                    <td>{visit.project}</td>
                    <td>{visit.config}</td>
                    <td>{new Date(visit.visitAt).toLocaleString()}</td>
                    <td>{visit.executive}</td>
                    <td>{visit.outcome}</td>
                    <td>{visit.nextAction}</td>
                    <td>{visit.aiBrief}</td>
                    <td className="action-cell">
                      <button
                        type="button"
                        className="edit-button"
                        title={`Edit visit ${visit.visitId}`}
                        aria-label={`Edit visit ${visit.visitId}`}
                        onClick={() => openEditModal(visit)}
                      >
                        ✎
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {editingVisit && (
        <div className="modal-backdrop" onMouseDown={closeEditModal}>
          <div
            className="edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-visit-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="edit-visit-title">Edit Visit</h2>
              <button
                type="button"
                className="modal-close"
                onClick={closeEditModal}
                disabled={isSaving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <label>
                Visit ID
                <input type="text" value={editingVisit.visitId} readOnly />
              </label>

              <label>
                Outcome
                <select
                  value={editOutcome}
                  onChange={(event) => setEditOutcome(event.target.value)}
                >
                  <option value="">Select outcome</option>
                  {OUTCOME_OPTIONS.map((outcome) => (
                    <option key={outcome} value={outcome}>
                      {outcome}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Next Action
                <select
                  value={editNextAction}
                  onChange={(event) => setEditNextAction(event.target.value)}
                >
                  <option value="">Select next action</option>
                  {NEXT_ACTION_OPTIONS.map((nextAction) => (
                    <option key={nextAction} value={nextAction}>
                      {nextAction}
                    </option>
                  ))}
                </select>
              </label>

              {editError && <p className="modal-error">{editError}</p>}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={closeEditModal}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={saveVisit}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
