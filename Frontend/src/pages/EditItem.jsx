import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditItem = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ name: '', price: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('token');

    // 1. Fetch Product Data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${productId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Failed to fetch product');
                }

                if (result.data.isSold) {
                    setError("This item is sold and cannot be edited.");
                } else {
                    setFormData({
                        name: result.data.name,
                        price: result.data.price,
                        description: result.data.description
                    });
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, token]);

    // 2. Submit Changes
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`http://localhost:5000/api/users/ItemEdit/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                // This catches your backend's 400, 403, and 404 responses
                throw new Error(result.message || 'Update failed');
            }

            setSuccess(result.message);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: '400px', margin: '20px auto' }}>
            <h2>Edit Product</h2>
            
            {error && <p style={{ color: 'red', background: '#fee', padding: '10px' }}>{error}</p>}
            {success && <p style={{ color: 'green', background: '#efe', padding: '10px' }}>{success}</p>}

            {(!error || success) && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <input 
                        type="number" 
                        placeholder="Price"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                    <textarea 
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                    <button type="submit" style={{ cursor: 'pointer' }}>Save Changes</button>
                    <button type="button" onClick={() => navigate(-1)}>Cancel</button>
                </form>
            )}
        </div>
    );
};

export default EditItem;