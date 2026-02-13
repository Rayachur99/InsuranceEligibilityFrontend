import { useState } from "react";
import apiClient from "../api/appclient";
import { useAuth } from "../auth/AuthContext";


const AdminPage = () => {
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("PROVIDER");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PROVIDER_USER");
  const [organizationId, setOrganizationId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { logout } = useAuth();

  const createOrganization = async () => {
    try {
      setError("");
      setMessage("");

      await apiClient.post("/admin/organizations", {
        name: orgName,
        type: orgType,
      });

      setMessage("Organization created");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create organization");
    }
  };

  const createUser = async () => {
    try {
      setError("");
      setMessage("");

      await apiClient.post("/admin/users", {
        username,
        password,
        role,
        organizationId: Number(organizationId),
      });

      setMessage("User created");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Create Organization</h3>
      <input placeholder="Organization Name" onChange={e => setOrgName(e.target.value)} />
      <select onChange={e => setOrgType(e.target.value)}>
        <option value="PROVIDER">PROVIDER</option>
        <option value="PAYER">PAYER</option>
      </select>
      <button onClick={createOrganization}>Create Organization</button>

      <hr />

      <h3>Create User</h3>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <select onChange={e => setRole(e.target.value)}>
        <option value="PROVIDER_USER">PROVIDER_USER</option>
        <option value="PAYER_USER">PAYER_USER</option>
      </select>
      <input
        placeholder="Organization ID"
        onChange={e => setOrganizationId(e.target.value)}
      />

      <button onClick={createUser}>Create User</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};


export default AdminPage;
