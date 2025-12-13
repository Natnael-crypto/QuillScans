'use client';

import React, { useState } from 'react';
import {
    User,
    Building2,
    Save,
    Key,
    Shield,
    Trash2,
    Mail,
    AlertTriangle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const countries = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
];

const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'GMT (London)' },
    { value: 'Europe/Paris', label: 'CET (Paris)' },
];

export default function Account() {
    const [profile, setProfile] = useState({
        fullName: 'John Smith',
        email: 'john@company.com',
        company: 'Acme Corporation',
        country: 'us',
        timezone: 'America/New_York'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const handleProfileChange = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    const handleChangePassword = () => {
        console.log('Change password');
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmation === 'DELETE') {
            console.log('Account deleted');
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
                <p className="text-slate-500 mt-1">Manage your profile and preferences</p>
            </div>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-slate-400" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Update your personal and company details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={profile.fullName}
                                onChange={(e) => handleProfileChange('fullName', e.target.value)}
                                leftIcon={<User className="h-5 w-5" />}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                onChange={(e) => handleProfileChange('email', e.target.value)}
                                leftIcon={<Mail className="h-5 w-5" />}
                                disabled
                            />
                            <p className="text-sm text-muted-foreground">Contact support to change email</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company Name</Label>
                            <Input
                                id="company"
                                value={profile.company}
                                onChange={(e) => handleProfileChange('company', e.target.value)}
                                leftIcon={<Building2 className="h-5 w-5" />}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Select
                                value={profile.country}
                                onValueChange={(value) => handleProfileChange('country', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country.value} value={country.value}>
                                            {country.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select
                                value={profile.timezone}
                                onValueChange={(value) => handleProfileChange('timezone', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timezones.map((timezone) => (
                                        <SelectItem key={timezone.value} value={timezone.value}>
                                            {timezone.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button
                        onClick={handleSaveProfile}
                        isLoading={isSaving}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>

            {/* Security Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-slate-400" />
                        Security
                    </CardTitle>
                    <CardDescription>
                        Manage your password and security settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <Key className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">Password</p>
                                <p className="text-sm text-slate-500">Last changed 30 days ago</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={handleChangePassword}>
                            Change Password
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mt-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <Shield className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                                <p className="text-sm text-slate-500">Add an extra layer of security</p>
                            </div>
                        </div>
                        <Button variant="outline">
                            Enable 2FA
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Irreversible and destructive actions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50/50 rounded-xl">
                        <div>
                            <p className="font-medium text-slate-900">Delete Account</p>
                            <p className="text-sm text-slate-500">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
                description="This action cannot be undone"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-800">Warning</p>
                                <p className="text-sm text-red-700 mt-1">
                                    This will permanently delete your account, all documents, and extracted data.
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2 block">
                            Type <span className="font-mono bg-slate-100 px-1 rounded">DELETE</span> to confirm
                        </Label>
                        <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="DELETE"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmation !== 'DELETE'}
                        >
                            Delete My Account
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
