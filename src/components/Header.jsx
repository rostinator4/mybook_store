import { FaHome, FaPlusSquare, FaBookOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Header.css'

const Header = () => {
    return (
        <div className="header">
            <div className="nav-center">
                
                <Link to="/add" className="nav-link">
                    <FaPlusSquare />
                    <span>Add Book</span>
                </Link>
                
                <Link to="/" className="nav-link">
                    <FaHome />
                    <span>Home</span>
                </Link>
                <Link to="/about" className="nav-link">
                    <FaBookOpen />
                    <span>Library</span>
                </Link>
            </div>
        </div>
    );
}

export default Header;