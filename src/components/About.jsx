import './About.css';

const About = () => {
    return (
        <div className="add-book-container">
            <div className="about-card">
                <h2>About the Collection</h2>
                
                <div className="info-group">
                    <label>Why books?</label>
                    <p>
                        I believe, while there are plenty of opportunites to entertain
                        ourselves, like scroooling, but we should not forget about something that really makes us think.
                    </p>
                </div>

                <div className="info-group">
                    <label>Created With</label>
                    <p>
                        This project was developed using React, Vite. The backend is handeled via
                        supabase
                    </p>
                </div>

                <div className="info-group">
                    <label>Design Choices</label>
                    <p>
                        I wanted to create something minimalistic, but still don't know what to do with 
                        header.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;