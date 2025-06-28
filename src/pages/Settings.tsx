import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [profileMsg, setProfileMsg] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMsg(null);
        setProfileLoading(true);
        try {
            await authService.updateProfile(name, avatar);
            setProfileMsg('Profile updated successfully!');
        } catch (err: any) {
            setProfileMsg(err.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMsg(null);
        setPasswordLoading(true);
        try {
            await authService.changePassword(currentPassword, newPassword);
            setPasswordMsg('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            setPasswordMsg(err.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            minLength={6}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {passwordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                    {passwordMsg && <p className="mt-2 text-sm text-gray-600">{passwordMsg}</p>}
                </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Avatar URL</label>
                        <input
                            type="text"
                            value={avatar}
                            onChange={e => setAvatar(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    {profileMsg && <p className="mt-2 text-sm text-gray-600">{profileMsg}</p>}
                </form>
            </div>
        </div>
    );
}; 