'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';

export default function CareersAdmin() {
    const router = useRouter();
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('Thika, Kenya');
    const [type, setType] = useState('Full-time');

    useEffect(() => {
        const init = async () => {
            try {
                const adminData = await getCurrentAdmin();
                if (!adminData) {
                    router.push('/admin/login');
                    return;
                }
                await fetchCareers();
            } catch (error) {
                console.error('Error:', error);
                router.push('/admin/login');
            }
        };
        init();
    }, [router]);

    const fetchCareers = async () => {
        try {
            const q = query(collection(db, 'careers'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCareers(data);
        } catch (error) {
            console.error('Error fetching careers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            alert('Please fill in all required fields');
            return;
        }
        setSaving(true);
        try {
            await addDoc(collection(db, 'careers'), {
                title: title.trim(),
                description: description.trim(),
                location,
                type,
                createdAt: serverTimestamp()
            });
            setTitle('');
            setDescription('');
            setLocation('Thika, Kenya');
            setType('Full-time');
            setShowForm(false);
            await fetchCareers();
        } catch (error) {
            console.error('Error adding career:', error);
            alert('Failed to add position');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this position?')) return;
        try {
            await deleteDoc(doc(db, 'careers', id));
            setCareers(careers.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete');
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Manage Careers</h1>
                <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13376a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    {showForm ? 'Cancel' : 'Add Position'}
                </button>
            </div>

            {showForm && (
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--border-light)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>New Position</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Job Title *</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Editor" required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Location</label>
                                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Description *</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role and requirements..." rows={4} required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '8px', fontSize: '1rem', resize: 'vertical', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                        </div>
                        <button type="submit" disabled={saving} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                            {saving ? 'Saving...' : 'Add Position'}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--border-light)' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Open Positions ({careers.length})</h2>
                </div>

                {careers.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-tertiary)' }}>No positions yet. Add your first job position to get started.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>Title</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>Location</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>Type</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {careers.map((career) => (
                                <tr key={career.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{career.title}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{career.location}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', backgroundColor: '#dcfce7', color: '#166534' }}>
                                            {career.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleDelete(career.id)} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
