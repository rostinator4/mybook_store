import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const EditBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBookDetails = async () => {
            const { data, error } = await supabase
                .from('Library')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setTitle(data.title);
                setAuthor(data.author);
            }
        };
        fetchBookDetails();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('Library')
            .update({ title, author })
            .eq('id', id);

        if (!error) {
            alert("Archive updated.");
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="add-book-container">
            <form className="add-book-form" onSubmit={handleUpdate}>
                <h2>Edit Manuscript</h2>
                <div className="input-group">
                    <label>Book Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="input-group">
                    <label>Author</label>
                    <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Updating..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default EditBook;