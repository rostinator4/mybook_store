import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './Home.css';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

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
                                <img src={publicUrl} alt={book.title} className="book-cover" />
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