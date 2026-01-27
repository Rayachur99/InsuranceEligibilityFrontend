import { useState } from "react";
import apiClient from "../api/appclient";
import { ServiceCode } from "../constants/servicecodes";
import { SERVICE_CODE_LABELS } from "../utils/serviceCodeLabels";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";


const ProviderPage = () => {
  const [memberId, setMemberId] = useState("");
  const [serviceCode, setServiceCode] = useState<ServiceCode | "">("");
  const [requestDate, setRequestDate] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const checkEligibility = async () => {
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post(
        "/provider/eligibility/check",
        {
          memberExternalId: memberId,
          serviceCode,
          requestDate,
        }
      );

      setResult(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Member not found");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to perform this action");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Unexpected error occurred");
      }
    }
  };

  return (
    <div>
      <h2>Provider Dashboard</h2>

      <h3>Eligibility Check</h3>

      <input
        placeholder="Member External ID"
        value={memberId}
        onChange={(e) => setMemberId(e.target.value)}
      />

      {/* Service Code Dropdown */}
      <select
        value={serviceCode}
        onChange={(e) => setServiceCode(e.target.value as ServiceCode)}
      >
        <option value="">Select Service</option>
        {Object.values(ServiceCode).map((code) => (
          <option key={code} value={code}>
            {SERVICE_CODE_LABELS[code]}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={requestDate}
        onChange={(e) => setRequestDate(e.target.value)}
      />

      <button
        onClick={checkEligibility}
        disabled={!memberId || !serviceCode || !requestDate}
      >
        Check Eligibility
      </button>

      {/* Error Message */}
      {error && (
        <>
          <hr />
          <p style={{ color: "red" }}>{error}</p>
        </>
      )}

      {/* Eligibility Result */}
      {result && (
        <>
          <hr />
          <h3>Eligibility Result</h3>
          <p>Eligible: {String(result.eligible)}</p>
          <p>Prior Auth Required: {String(result.priorAuthRequired)}</p>
          <p>Reason Code: {result.reasonCode}</p>
        </>
      )}
      <button onClick={logout}>Logout</button>

    </div>
  );
};

export default ProviderPage;
