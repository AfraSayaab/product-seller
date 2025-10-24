'use client';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const [me, setMe] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/profile').then(r => r.json()).then(setMe);
    }, []);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        const form = new FormData(e.currentTarget);
        const payload: any = {};
        form.forEach((v, k) => payload[k] = v || null);
        const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const json = await res.json();
        setSaving(false);
        if (json.success) { setMe(json); alert('Saved'); } else { alert(json.error || 'Failed'); }
    }

    if (!me) return <div className="p-6">Loading...</div>;
    const data = me.data || {};

    const Field = ({ name, label, type = 'text' }: { name: string, label: string, type?: string }) => (
        <label className="block">
            <span className="text-sm">{label}</span>
            <input name={name} defaultValue={data[name] || ''} type={type} className="w-full border p-2 rounded" />
        </label>
    );

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Edit Profile</h1>
            <form onSubmit={onSubmit} className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field name="firstName" label="First Name" />
                    <Field name="lastName" label="Last Name" />
                    <Field name="nickname" label="Nickname" />
                    <Field name="displayPublicAs" label="Display to Public as" />
                    <Field name="website" label="Website" />
                    <Field name="phone" label="Phone Number" />
                    <Field name="whatsapp" label="Whatsapp Number" />
                    <Field name="publicAddress" label="Public Address" />
                </div>
                <label className="block">
                    <span className="text-sm">Biography</span>
                    <textarea name="biography" defaultValue={data.biography || ''} className="w-full border p-2 rounded min-h-32" />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field name="facebook" label="Facebook" />
                    <Field name="twitter" label="Twitter" />
                    <Field name="linkedin" label="LinkedIn" />
                    <Field name="pinterest" label="Pinterest" />
                    <Field name="behance" label="Behance" />
                    <Field name="dribbble" label="Dribbble" />
                    <Field name="instagram" label="Instagram" />
                    <Field name="youtube" label="YouTube" />
                    <Field name="vimeo" label="Vimeo" />
                    <Field name="flickr" label="Flickr" />
                </div>
                <button className="rounded-2xl py-2 border font-medium" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            </form>
        </main>
    );
}
