// src/pages/UsersPage.jsx

import { useEffect, useState } from "react";
import { getUsers, addUser } from "../api/users";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUser = await addUser(form);
    setUsers([...users, newUser.user]);
  };

  return (
    <div>
      <h1>👤 Users</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} - {u.role}
          </li>
        ))}
      </ul>

      <h2>Add User</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
