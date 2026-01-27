import { useEffect, useRef, useState } from "react";
import apiClient from "../api/appclient";
import { ServiceCode } from "../constants/servicecodes";
import { SERVICE_CODE_LABELS } from "../utils/serviceCodeLabels";
import { useAuth } from "../auth/AuthContext";

type RuleMode = "CREATE" | "EDIT";

type CoverageRule = {
  serviceCode: ServiceCode;
  covered: boolean;
  priorAuthRequired: boolean;
  minAge?: number;
  maxAge?: number;
};

const PayerPage = () => {
  const { logout } = useAuth();

  // --------------------
  // Plan
  // --------------------
  const [planCode, setPlanCode] = useState("");
  const [planName, setPlanName] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");

  // --------------------
  // Coverage Rules
  // --------------------
  const [rulePlanCode, setRulePlanCode] = useState("");
  const [existingRules, setExistingRules] = useState<CoverageRule[]>([]);
  const [ruleMode, setRuleMode] = useState<RuleMode>("CREATE");
  const [editingService, setEditingService] = useState<ServiceCode | null>(null);

  const [selectedServices, setSelectedServices] = useState<ServiceCode[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [covered, setCovered] = useState(true);
  const [priorAuth, setPriorAuth] = useState(false);
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  // --------------------
  // Member
  // --------------------
  const [memberId, setMemberId] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [memberPlanCode, setMemberPlanCode] = useState("");
  const [coverageStart, setCoverageStart] = useState("");
  const [coverageEnd, setCoverageEnd] = useState("");

  // --------------------
  // Dropdown handling
  // --------------------
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [isDropdownOpen]);

  // --------------------
  // Helpers
  // --------------------
  const resetRuleForm = () => {
    setRuleMode("CREATE");
    setEditingService(null);
    setSelectedServices([]);
    setCovered(true);
    setPriorAuth(false);
    setMinAge("");
    setMaxAge("");
  };

  const toggleService = (code: ServiceCode) => {
    setSelectedServices(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  // --------------------
  // API Calls
  // --------------------
  const createPlan = async () => {
    await apiClient.post("/payer/plans", {
      planCode,
      planName,
      validFrom,
      validTo,
    });
    alert("Plan created");
  };

  const loadRules = async () => {
  if (!rulePlanCode.trim()) {
    alert("Please enter a plan code first");
    return;
  }

  try {
    const res = await apiClient.get(
      `/payer/plans/${rulePlanCode}/rules`
    );
    setExistingRules(res.data);
  } catch (err: any) {
    if (err.response?.status === 404) {
      setExistingRules([]);
      alert("No coverage rules found for this plan");
    } else {
      alert("Failed to load coverage rules");
    }
  }
};

  const createRulesBulk = async () => {
    if (selectedServices.length === 0) {
      alert("Select at least one service");
      return;
    }

    try {
      await apiClient.post(`/payer/plans/${rulePlanCode}/rules/bulk`, {
        rules: selectedServices.map(code => ({
          serviceCode: code,
          covered,
          priorAuthRequired: priorAuth,
          ...(minAge && { minAge: Number(minAge) }),
          ...(maxAge && { maxAge: Number(maxAge) }),
        })),
      });

      alert("Coverage rules created");
      resetRuleForm();
      loadRules();
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert(
          "One or more selected services already exist. " +
          "Please edit existing coverage rules instead."
        );
        return;
      }if (err.response?.status === 404) {
    alert("plan id doesn't exist...");
    return;
  }
      throw err;
    }
  };

  const updateRule = async () => {
    if (!editingService) return;

    await apiClient.put(
      `/payer/plans/${rulePlanCode}/rules/${editingService}`,
      {
        covered,
        priorAuthRequired: priorAuth,
        ...(minAge && { minAge: Number(minAge) }),
        ...(maxAge && { maxAge: Number(maxAge) }),
      }
    );

    alert("Coverage rule updated");
    resetRuleForm();
    loadRules();
  };

  const startEdit = (rule: CoverageRule) => {
    setRuleMode("EDIT");
    setEditingService(rule.serviceCode);
    setCovered(rule.covered);
    setPriorAuth(rule.priorAuthRequired);
    setMinAge(rule.minAge?.toString() ?? "");
    setMaxAge(rule.maxAge?.toString() ?? "");
    setIsDropdownOpen(false);
  };

  const enrollMember = async () => {
    await apiClient.post("/payer/members", {
      memberExternalId: memberId,
      fullName,
      age: Number(age),
      planCode: memberPlanCode,
      coverageStartDate: coverageStart,
      coverageEndDate: coverageEnd,
    });
    alert("Member enrolled");
  };

  // --------------------
  // Derived
  // --------------------
  const coveredServices = new Set(existingRules.map(r => r.serviceCode));

  // --------------------
  // UI
  // --------------------
  return (
    <div>
      <h2>Payer Dashboard</h2>

      <h3>Create Insurance Plan</h3>
      <input placeholder="Plan Code" onChange={e => setPlanCode(e.target.value)} />
      <input placeholder="Plan Name" onChange={e => setPlanName(e.target.value)} />
      <input type="date" onChange={e => setValidFrom(e.target.value)} />
      <input type="date" onChange={e => setValidTo(e.target.value)} />
      <button onClick={createPlan}>Create Plan</button>

      <hr />

      <h3>Coverage Rules</h3>
      <input
        placeholder="Plan Code"
        value={rulePlanCode}
        onChange={e => setRulePlanCode(e.target.value)}
      />
      <button onClick={loadRules}>Load Coverage Rules</button>

      {existingRules.length > 0 && (
        <>
          <h4>Existing Rules</h4>
          <ul>
            {existingRules.map(rule => (
              <li key={rule.serviceCode}>
                {SERVICE_CODE_LABELS[rule.serviceCode]}
                <button onClick={() => startEdit(rule)}>Edit</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {ruleMode === "CREATE" && (
        <div ref={dropdownRef} style={{ position: "relative", width: "320px" }}>
          <div
            style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
            onClick={() => setIsDropdownOpen(p => !p)}
          >
            {selectedServices.length === 0
              ? "Select Services"
              : selectedServices.map(c => SERVICE_CODE_LABELS[c]).join(", ")}
          </div>

          {isDropdownOpen && (
            <div style={{ border: "1px solid #ccc", background: "#fff" }}>
              {Object.values(ServiceCode).map(code => (
                <label key={code} style={{ display: "flex", padding: "6px" }}>
                  <input
                    type="checkbox"
                    disabled={coveredServices.has(code)}
                    checked={selectedServices.includes(code)}
                    onChange={() => toggleService(code)}
                  />
                  <span style={{ marginLeft: "8px" }}>
                    {SERVICE_CODE_LABELS[code]}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <label>
        Covered
        <input type="checkbox" checked={covered} onChange={e => setCovered(e.target.checked)} />
      </label>

      <label>
        Prior Auth
        <input type="checkbox" checked={priorAuth} onChange={e => setPriorAuth(e.target.checked)} />
      </label>

      <input placeholder="Min Age" type="number" onChange={e => setMinAge(e.target.value)} />
      <input placeholder="Max Age" type="number" onChange={e => setMaxAge(e.target.value)} />

      {ruleMode === "CREATE" ? (
        <button onClick={createRulesBulk}>Create Coverage Rules</button>
      ) : (
        <button onClick={updateRule}>Update Coverage Rule</button>
      )}

      <hr />

      <h3>Enroll Member</h3>
      <input placeholder="Member External ID" onChange={e => setMemberId(e.target.value)} />
      <input placeholder="Full Name" onChange={e => setFullName(e.target.value)} />
      <input placeholder="Age" onChange={e => setAge(e.target.value)} />
      <input placeholder="Plan Code" onChange={e => setMemberPlanCode(e.target.value)} />
      <input type="date" onChange={e => setCoverageStart(e.target.value)} />
      <input type="date" onChange={e => setCoverageEnd(e.target.value)} />
      <button onClick={enrollMember}>Enroll Member</button>

      <hr />

      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default PayerPage;
