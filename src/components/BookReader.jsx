import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { supabase } from '../supabaseClient';
import { FaHeart, FaEdit, FaTrash } from 'react-icons/fa';
import './BookReader.css';

const BookReader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const bookRef = useRef();
    const [book, setBook] = useState(null);
    const [pages, setPages] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const Page = React.forwardRef((props, ref) => {
        return (
            <div className={`page-surface ${props.className || ''}`} ref={ref}>
                {props.children}
            </div>
        );
    });

    // Setting a display name is best practice for forwardRef components in React
    Page.displayName = 'Page';

    useEffect(() => {
        const loadBookData = async () => {
            // 1. Fetch Book
            const { data: bookData, error: bookError } = await supabase
                .from('Library')
                .select('*')
                .eq('id', id)
                .single();

            if (bookError || !bookData) return;
            setBook(bookData);

            // 2. Fetch Text (Fixed to use getPublicUrl so it never hits Vite's index.html)
            try {
                const { data: { publicUrl } } = supabase.storage
                    .from('books')
                    .getPublicUrl(bookData.book_file);

                const response = await fetch(publicUrl);

                if (response.ok) {
                    const text = await response.text();

                    const words = text.split(' ');
                    const chunkedPages = [];
                    let currentPage = "";

                    words.forEach(word => {
                        if ((currentPage + word).length > 640) {
                            chunkedPages.push(currentPage.trim());
                            currentPage = word + " ";
                        } else {
                            currentPage += word + " ";
                        }
                    });

                    if (currentPage.trim()) chunkedPages.push(currentPage.trim());
                    setPages(chunkedPages);
                }
            } catch (err) {
                console.error("Text fetch error:", err);
                setPages(["Error loading manuscript."]);
            }

            // 3. Fetch Comments
            const { data: commentData } = await supabase
                .from('Comments')
                .select('*')
                .eq('book_id', id)
                .order('created_at', { ascending: true });

            if (commentData) setComments(commentData);
        };

        loadBookData();
    }, [id]);

    const handleLike = async () => {
        if (!book) return;
        const newLikes = (book.likes || 0) + 1;
        const { error } = await supabase.from('Library').update({ likes: newLikes }).eq('id', id);
        if (!error) setBook({ ...book, likes: newLikes });
    };

    const handleDelete = async () => {
        if (!book) return;
        if (!window.confirm("Burn this manuscript? This action cannot be undone.")) return;
        const { error } = await supabase.from('Library').delete().eq('id', id);
        if (!error) {
            await supabase.storage.from('books').remove([book.image, book.book_file]);
            navigate('/');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const { data, error } = await supabase.from('Comments').insert([{ book_id: id, content: newComment }]).select();
        if (!error && data) {
            setComments([...comments, data[0]]);
            setNewComment('');
        }
    };

    const coverUrl = book ? supabase.storage.from('books').getPublicUrl(book.image).data.publicUrl : '';

    if (!book || pages.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1c1c1c', color: '#f4f1ea' }}>
                <p style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>Binding the pages...</p>
            </div>
        );
    }

    return (
        <div className="reader-page">
            <div className="manuscript-header">
                <h1>{book.title}</h1>
                <p className="author-name">{book.author}</p>
            </div>

            <div className="flipbook-wrapper">
                <HTMLFlipBook
                    width={450}
                    height={600}
                    size="fixed"
                    maxShadowOpacity={0.5}
                    showCover={true}
                    className="manuscript-book"
                    ref={bookRef}
                >
                    {/* --- FRONT COVER --- */}
                    <Page className="page-cover">
                        <img
                            src={coverUrl}
                            alt="Book Cover"
                            className="full-cover-image"
                        />
                    </Page>

                    {/* --- INSIDE PAGES --- */}
                    {pages.map((content, index) => (
                        <Page key={index}>
                            <div className="page-margin">
                                <div className="text-content">{content}</div>
                                <div className="page-number">- {index + 1} -</div>
                            </div>
                        </Page>
                    ))}

                    {/* --- BACK COVER --- */}
                    <Page className="page-cover page-back">
                        <div className="cover-inner back-cover-inner">
                            <p>The Private Collection</p>
                        </div>
                    </Page>
                </HTMLFlipBook>
            </div>

            {/* Actions and Comments are now grouped under the book */}
            <div className="reader-bottom-section">
                <div className="action-bar">
                    <button className="action-btn like" onClick={handleLike}>
                        <FaHeart /> <span>{book.likes || 0} Likes</span>
                    </button>
                    <button className="action-btn edit" onClick={() => navigate(`/edit/${id}`)}>
                        <FaEdit /> <span>Edit</span>
                    </button>
                    <button className="action-btn delete" onClick={handleDelete}>
                        <FaTrash /> <span>Delete</span>
                    </button>
                </div>

                <section className="comments-section">
                    <h3>Margin Notes</h3>
                    <div className="comments-list">
                        {comments.length === 0 && <p className="no-notes">No notes exist for this manuscript yet.</p>}
                        {comments.map((c) => (
                            <div key={c.id} className="comment-item">
                                <span className="comment-date">
                                    {new Date(c.created_at).toLocaleDateString()}
                                </span>
                                <p>{c.content}</p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddComment} className="comment-form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Transcribe a thought..."
                        />
                        <button type="submit" disabled={!newComment.trim()}>Post Note</button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default BookReader;