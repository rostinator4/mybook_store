import { useEffect, useState, navigate } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './Home.css';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('Library') // Ensure this matches your table name exactly
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, imagePath, filePath) => {
        const confirmed = window.confirm("Are you sure you want to remove this manuscript from the archive?");
        if (!confirmed) return;

        try {
            // 1. Delete from Database
            const { error: dbError } = await supabase.from('Library').delete().eq('id', id);
            if (dbError) throw dbError;

            // 2. Delete files from Storage (Optional but best practice)
            await supabase.storage.from('books').remove([imagePath, filePath]);

            // 3. Update local state to reflect change
            setBooks(books.filter(book => book.id !== id));
        } catch (err) {
            alert("Error deleting book: " + err.message);
        }
    };

    if (loading) return <div className="loader">Opening the archives...</div>;

    return (
        <div className="library-container">
            <h1 className="library-title">The Collection</h1>
            <div className="book-grid">
                {books.map((book) => {
                    const { data: { publicUrl } } = supabase.storage
                        .from('books')
                        .getPublicUrl(book.image);
                    return (
                        <div key={book.id} className="book-card">
                            <div className="book-cover-wrapper">
                                <div className="book-cover-wrapper">
                                    <img src={publicUrl} alt={book.title} className="book-cover" />

                                    {/* Action Overlay */}
                                    <div className="card-actions">
                                        <button className="action-btn edit" onClick={() => navigate(`/edit/${book.id}`)}>
                                            <FaEdit />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(book.id, book.image, book.file_path)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="book-info">
                                <h3>{book.title}</h3>
                                <p>{book.author}</p>
                                <a
                                    href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/books/${book.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="read-link"
                                >
                                    Read Manuscript
                                </a>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default Home;