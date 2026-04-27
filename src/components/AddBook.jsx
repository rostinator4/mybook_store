import { useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path if needed
import { BiExpand } from 'react-icons/bi';
import './AddBook.css'

const AddBook = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [textFile, setTextFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upload Cover Image
            const imgName = `${Date.now()}_${imageFile.name}`;
            const { data: imgData, error: imgErr } = await supabase.storage
                .from('books')
                .upload(`covers/${imgName}`, imageFile);
            if (imgErr) throw imgErr;

            // 2. Upload .txt file
            const txtName = `${Date.now()}_${textFile.name}`;
            const { data: txtData, error: txtErr } = await supabase.storage
                .from('books')
                .upload(`contents/${txtName}`, textFile);
            if (txtErr) throw txtErr;

            // 3. Insert into Database Table
            const { error: dbErr } = await supabase
                .from('Library') // Ensure this matches your table name exactly
                .insert([{
                    title,
                    author,
                    image: imgData.path,     // Stores the path to the cover
                    book_file: txtData.path  // Stores the path to the text file
                }]);
            if (dbErr) throw dbErr;

            alert("Book added successfully!");
            // Reset form
            setTitle('');
            setAuthor('');
            setImageFile(null);
            setTextFile(null);

        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

return (
        <div className="add-book-container"> {/* Container for centering */}
            <form className="add-book-form" onSubmit={handleRegister}>
                <h2>Add to Collection</h2>
                
                <div className="input-group">
                    <label>Book Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Enter title"
                        required 
                    />
                </div>

                <div className="input-group">
                    <label>Author</label>
                    <input 
                        type="text" 
                        value={author} 
                        onChange={(e) => setAuthor(e.target.value)} 
                        placeholder="Enter author"
                        required 
                    />
                </div>
                
                <div className="input-group">
                    <label>Upload Cover Image</label>
                    <input 
                        className="file-input" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setImageFile(e.target.files[0])} 
                        required 
                    />
                </div>

                <div className="input-group">
                    <label>Upload Book (.txt)</label>
                    <input 
                        className="file-input" 
                        type="file" 
                        accept=".txt" 
                        onChange={(e) => setTextFile(e.target.files[0])} 
                        required 
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Registering..." : "Register Book"}
                </button>
            </form>
        </div>
    );
};


export default AddBook;