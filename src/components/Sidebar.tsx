import { useState } from 'react';
import profile1 from '../assets/profle1.png'
import profile2 from '../assets/profile2.png'
import profile4 from '../assets/profile4.png'
import profile5 from '../assets/profile5.png'
import useTheme from '../hooks/useTheme';
import { CloseOutlined } from '@ant-design/icons';

export default function Sidebar({mobileOpen, setMobileOpen}:any) {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const { theme, toggleTheme } = useTheme();
  // const [mobileOpen, setMobileOpen] = useState(false);
  const handleMenuClick = (menu:any) => {
    setActiveMenu(menu);
    if (mobileOpen) setMobileOpen(false);
  };


  return (
  
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      {/* <h2 className="sidebar-title">Task Manager</h2> */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <p className="section-title">Menu</p>
       <button
          className="burger-btn"
          aria-label="Open sidebar"
          onClick={handleMenuClick}
        >
      <CloseOutlined  style={{fontSize:"18px", paddingBottom:"10px", }}/>
      </button></div>
      <nav className="sidebar-nav">
        <ul>
          <li className={`menu-item ${activeMenu === "Dashboard" ? "active" : ""}`}
            onClick={() => handleMenuClick("Dashboard")}>
            <span className="menu-icon">🏠</span>
            Dashboard
          </li>
          <li className={`menu-item ${activeMenu === "Projects" ? "active" : ""}`}
            onClick={() => handleMenuClick("Projects")}>
            <span className="menu-icon">📁</span>
            Projects
          </li>
          <li className={`menu-item ${activeMenu === "Today's Task" ? "active" : ""}`}
            onClick={() => handleMenuClick("Today's Task")}>
            <span className="menu-icon">🗓️</span>
            Today's Task
          </li>
          <li className={`menu-item ${activeMenu === "All Task" ? "active" : ""}`}
            onClick={() => handleMenuClick("All Task")}>
            <span className="menu-icon">✅</span>
            All Task
          </li>
          <li className={`menu-item ${activeMenu === "Calendar" ? "active" : ""}`}
            onClick={() => handleMenuClick("Calendar")}>
            <span className="menu-icon">📆</span>
            Calendar
          </li>
        </ul>
      </nav>


      {/* Teams Section */}
      <div className="teams-section">
        <p className="section-title">Teams</p>

        <div className="team">
          <p className="team-name"> 💻 DevOps</p>
          <div className="avatars">
            <img src={profile1} alt="User" />
            <img src={profile2} alt="User" />
            <img src={profile4} alt="User" />
          </div>
        </div>

        <div className="team">
          <p className="team-name"> 👥 Multi Tenant</p>
          <div className="avatars">
            <img src={profile4} alt="User" />
            <img src={profile5} alt="User" />
          </div>
        </div>
      </div>

      {/* Theme Switch */}
      <div className="teams-section">
        <p className="section-title">Theme</p>
        <div className="theme-switch">


          <span className="team-name">Dark / Light</span>
          <label className="switch">
            <input type="checkbox"
              onChange={toggleTheme}
              checked={theme === 'dark'} />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Styles */}
      <style>
        {`
          .sidebar {
            width: 220px;
            // background-color: white;
            // color: black;
            padding: 20px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 90vh;
            border-right: 1px solid #ddd
          }

          .sidebar-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
          }

          .sidebar-nav ul {
            list-style: none;
            padding: 0;
          }

          .sidebar-nav li {
            margin-bottom: 6px;
            cursor: pointer;
          }

          .sidebar-nav li:hover {
            text-decoration: underline;
          }

          .teams-section {
            // margin-top: 30px;
             border-top: 1px solid #eee;
              margin-top: auto;
            padding-top: 20px;
          }

          .section-title {
            font-size: 14px;
            margin-bottom: 10px;
            // color: #bab1b1;
            font-weight: 600;
          }

          .team {
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
            align-items: centerl
          }

          .team-name {
            font-size: 13px;
            margin-bottom: 5px;
            font-weight: 500;
          }

        

          .avatars {
  display: flex;
  align-items: center;

}

.avatars img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  background-color: #ccc;
}

.avatars img:first-child {
  margin-left: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  // background-color: #e0f0ff; /* light blue on hover */
}

.menu-item.active {
  // background-color: #d0eaff; /* slightly deeper for active */
}

.menu-icon {
  font-size: 14px;
}


          .theme-switch {
            margin-top: auto;
            // padding-top: 20px;
            // border-top: 1px solid #eee;
          }

          .theme-switch label {
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
          }

          .theme-label {
            user-select: none;
          }
            
          .theme-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  // margin-top: 20px;
}

.theme-label {
  font-size: 14px;
  user-select: none;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  border-radius: 20px;
  transition: background-color 0.2s ease;
}

.slider::before {
  content: "";
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  top: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

/* Checked state */
.switch input:checked + .slider {
  background-color: #2196f3;
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

          @media (max-width: 768px) {
            .sidebar {
              width: 100%;
              height: auto;
              flex-direction: row;
              flex-wrap: wrap;
            }

            .sidebar-nav {
              flex: 1;
            }

            .theme-switch {
              border-top: none;
              padding-top: 10px;
            }
          }

          .sidebar {
  // width: 220px;
  padding: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  // height: 100vh;
  background: var(--sidebar-bg, #fff);
  transition: transform 0.25s ease;
}

/* ---------- Mobile off‑canvas ---------- */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%); /* hidden by default */
    z-index: 999;                 /* above everything */
    box-shadow: 2px 0 6px rgba(0,0,0,.15);
   
  }
  .sidebar.open {
    transform: translateX(0);     /* slide in */
    width: 70%;
    //  background-color: 2px 0 6px rgba(0,0,0,.15);
  }

  /* Hamburger button */
 

/* ---------- Desktop hamburger hidden ---------- */
@media (min-width: 769px) {
  .burger-btn {
    display: none;
  }
}

        `}
      </style>
    </aside>
  
  );
}
