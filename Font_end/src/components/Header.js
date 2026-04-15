import { Link } from "react-router-dom";
import "../styles.css";
import { useAuth } from "../pages/Sign_in";

function Header() {
  const { user } = useAuth();
  return (
    <header >
      <nav id="header" className="menu">
        <Link id="reminder" to="/">
          🌿 Reminder
        </Link>

        <Link to="/task">Task</Link>

        <Link to="/calendar">Calendar</Link>

        <Link to="/matrix">Matrix</Link>

        <Link to="/timer">Timer</Link>


        {user ? (
          <Link to="/sign_in" className="header-avatar-pill" title={user.name}>
            <div className="header-avatar-circle-wrap">
              <div className="header-avatar-circle">
                {user.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="header-avatar-dot" />
            </div>
            <span className="header-avatar-name">
              {user.name?.split(' ')[0]}
            </span>
          </Link>
        ) : (
          <Link id="sign-in" to="/sign_in">Sign In</Link>
        )}
      </nav>

    </header>
  );
}

export default Header;
