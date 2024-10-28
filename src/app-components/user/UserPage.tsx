import { FormEvent, useState, useEffect } from "react";
import "./UserPage.css";
import { useToast } from "../../components/ToastProvider";
import { invoke } from "@tauri-apps/api/core";

class User {
    user_id: string;
    user_name: string;
    user_role: string;
    user_password: string;
    
    constructor(user_id: string, user_name: string, user_role: string, user_password: string) {
        this.user_id = user_id;
        this.user_name = user_name;
        this.user_role = user_role;
        this.user_password = user_password;
    }
}

export default function UserPage() {
    const userLogin = localStorage.getItem("loginName");
    const userRole = localStorage.getItem("userRole");
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedOption, setSelectedOption] = useState('changePassword');
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState('');
    const { showMessage } = useToast();

    const changePassword = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (newPassword !== confirmPassword) {
                showMessage("Password mismatch");
                return;
            }
            const userExists = await invoke("login_user", { login: userLogin, password: oldPassword });
            if (userExists) {
                await invoke("change_user_password", { login: userLogin, password: oldPassword, newPassword: newPassword });
                showMessage("Changed successfully");
            } else {
                showMessage("Invalid old password");
            }
        } catch (error) {
            showMessage("Error changing password: " + error);
        }
    };

    const fetchUsers = async () => {
        try {
            const result = await invoke<User[]>("get_all_users");
            setUsers(result);
            setFilteredUsers(result);
        } catch (error) {
            showMessage("Error fetching users: " + error);
        }
    };

    useEffect(() => {
        if (selectedOption === 'adminPage' && userRole === 'Admin') {
            fetchUsers();
        }
    }, [selectedOption, userRole]);

    useEffect(() => {
        setFilteredUsers(
            users.filter(user =>
                user.user_name.toLowerCase().includes(filter.toLowerCase()) ||
                user.user_role.toLowerCase().includes(filter.toLowerCase())
            )
        );
    }, [filter, users]);

    return (
        <div className="user-page">
            <h1 className="user-page-welcome">Hi {userLogin}!</h1>
            <div className="radio-buttons">
                <label>
                    <input
                        type="radio"
                        name="pageOption"
                        value="changePassword"
                        checked={selectedOption === 'changePassword'}
                        onChange={() => setSelectedOption('changePassword')}
                    />
                    Change Password
                </label>
                {userRole === 'Admin' && (
                    <label>
                        <input
                            type="radio"
                            name="pageOption"
                            value="adminPage"
                            checked={selectedOption === 'adminPage'}
                            onChange={() => setSelectedOption('adminPage')}
                        />
                        Admin Page
                    </label>
                )}
            </div>

            {selectedOption === 'changePassword' ? (
                <div className="change-password-wrapper">
                    <form onSubmit={changePassword} className="change-password-block">
                        <div className="password">
                            <label htmlFor="oldPassword">Old password:</label>
                            <input
                                type="password"
                                id="oldPassword"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>
                        <div className="password">
                            <label htmlFor="newPassword">New password:</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="password">
                            <label htmlFor="confirmPassword">Confirm password:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button className="submit-change-password" type="submit">Confirm change</button>
                    </form>
                </div>
            ) : null}

            {selectedOption === 'adminPage' && userRole === 'Admin' ? (
                <div className="admin-page">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Password</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.user_id}>
                                        <td>{user.user_id}</td>
                                        <td>{user.user_name}</td>
                                        <td>{user.user_role}</td>
                                        <td>{user.user_password}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="filter-container">
                        <h2>Filter Users</h2>
                        <div className="filter">
                            <label htmlFor="filter">Search by name or role:</label>
                            <input
                                type="text"
                                id="filter"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
