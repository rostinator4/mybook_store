import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaHeart, FaSortAmountDown, FaCheck, FaTimes } from 'react-icons/fa';
import './Home.css';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('created_at'); // Default sort
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const navigate = useNavigate();

    const fetchBooks = useCallback(async () => {
        try {
            let query = supabase.from('Library').select('*');

            // Logic for different sorting modes
            if (sortBy === 'likes') {
                query = query.order('likes', { ascending: false }); // Most likes first
            } else if (sortBy === 'title') {
                query = query.order('title', { ascending: true }); // A-Z
            } else {
                query = query.order('created_at', { ascending: false }); // Newest first
            }

            const { data, error } = await query;

            if (error) throw error;
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error.message);
        } finally {
            setLoading(false);
        }
    }, [sortBy]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const handleLike = async (id, currentLikes) => {
        const { error } = await supabase
            .from('Library')
            .update({ likes: currentLikes + 1 })
            .eq('id', id);

        if (!error) {
            setBooks(books.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b));
        }
    };

    const executeDelete = async (id, imagePath, filePath) => {
        const confirmed = window.confirm("Are you sure you want to remove this manuscript from the archive?");
        if (!confirmed) return;

        try {
            // 1. Delete from Database
            const { error: dbError } = await supabase.from('Library').delete().eq('id', id);
            if (dbError) throw dbError;

            await supabase.storage.from('books').remove([imagePath, filePath].filter(Boolean));

            // 3. Update local state to reflect change
            setBooks(books.filter(book => book.id !== id));
            setDeleteConfirmId(null);
        } catch (err) {
            alert("Error deleting book: " + err.message);
        }
    };

    if (loading) return <div className="loader">Opening the archives...</div>;

    return (
        <div className="library-container">
            <div className="library-header">
                <h1 className="library-title">The Collection</h1>

                {/* Sorting Dropdown */}
                <div className="sort-container">
                    <FaSortAmountDown />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="created_at">Date Added</option>
                        <option value="title">Alphabetical</option>
                        <option value="likes">Most Popular</option>
                    </select>
                </div>
            </div>
            <div className="book-grid">
                {books.map((book) => {
                    const { data: { publicUrl } } = supabase.storage
                        .from('books')
                        .getPublicUrl(book.image);

                    return (
                        <div key={book.id} className="book-card">
                            <div className="book-cover-wrapper">
                                <img src={publicUrl} alt={book.title} className="book-cover" />

                                {/* NEW: Conditional Rendering for the Overlay */}
                                {deleteConfirmId === book.id ? (
                                    <div className="delete-overlay">
                                        <span>Burn Record?</span>
                                        <div className="delete-overlay-actions">
                                            {/* Note the use of book.book_file here */}
                                            <button className="confirm-btn" onClick={() => executeDelete(book.id, book.image, book.book_file)}>
                                                <FaCheck /> Yes
                                            </button>
                                            <button className="cancel-btn" onClick={() => setDeleteConfirmId(null)}>
                                                <FaTimes /> No
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="card-actions">
                                        <button className="card-action-btn edit" onClick={() => navigate(`/edit/${book.id}`)}>
                                            <FaEdit />
                                        </button>
                                        <button className="card-action-btn delete" onClick={() => setDeleteConfirmId(book.id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="book-info">
                                <h3>{book.title}</h3>
                                <p>{book.author}</p>

                                <div className="book-meta">
                                    {/* The Like Button */}
                                    <button className="like-btn" onClick={() => handleLike(book.id, book.likes || 0)}>
                                        <FaHeart /> <span>{book.likes || 0}</span>
                                    </button>

                                    {/* The Format Date */}
                                    <span className="date-added">
                                        {new Date(book.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <button
                                    className="read-link-btn"
                                    onClick={() => navigate(`/read/${book.id}`)}
                                >
                                    Read Manuscript
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default Home;