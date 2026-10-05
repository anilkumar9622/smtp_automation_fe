// import React from 'react';
// import profileLogo from '../assets/profile.png'
import { AlignRightOutlined } from '@ant-design/icons';
import logo from "../assets/logo.png";
// import './App.css'
import { LockOutlined, LogoutOutlined } from "@ant-design/icons";
import { NavLink, useNavigate } from "react-router-dom";
import { message } from 'antd';
export default function Header({toggleSidebar}:any) {
  const date = new Date();
    const dateString = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  });

    const timeString = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

   const navigate = useNavigate();

const handleLogout = () => {
  // clear auth
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  message.success("Logged out successfully 👋");

  navigate("/");
};
  return (
     <header className="header">
   
      <div className="header-left">

       {/* <div style={{display:'flex', justifyContent:"center", alignItems:"center"}}
       >
        <img src={profileLogo} alt="profile" className="profile-img bg-outline" style={{marginRight:"8px"}} />
        <span className="profile-name">SMTP Automation</span>
        </div>  */}
        <div className="brands">
            <img src={logo} alt="logo" width={130} height={40}/>
            {/* <span>TechinfoAK</span> */}
          </div>
          <button
          className="burger-btn"
          aria-label="Open sidebar"
          onClick={toggleSidebar}
        >
        {/* <FiMenu size={24} /> */}
        <AlignRightOutlined style={{fontSize:"20px"}}/>
      </button>
      </div>


      <div className="header-center">
        <nav className="header-nav">
          <NavLink to="/template" className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
            CMS Template
          </NavLink>
          <NavLink to="/email-details" className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
            Email Details
          </NavLink>
        </nav>
      </div>


      <div className="header-right">
        <div className="time">
          <span className="clock">{timeString}</span>
          <span className="date">{dateString}</span>
        </div>
        {/* <button className="icon-btn bg-outline">📩</button>
        <button className="icon-btn bg-outline">🔔</button> */}
        <div className="header-actions">
          <button type="button" className="header-action-btn" title="Change Password" aria-label="Change Password" onClick={() => navigate("/reset-password")}>
            <LockOutlined />
            <span>Change Password</span>
          </button>
          <button type="button" className="header-action-btn logout" title="Logout" aria-label="Logout" onClick={handleLogout}>
            <LogoutOutlined />
            <span>Logout</span>
          </button>
        </div>
      </div>
      <style>
        {`
   
        .header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 20px;
  // background-color: #fff;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
 
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 150px;
}

.profile-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-name {
  font-weight: 500;
}

.header-center {
  flex: 2;
  text-align: center;
  min-width: 250px;
}

.header-nav {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.header-nav-link {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  color: #555;
  text-decoration: none;
  white-space: nowrap;
}

.header-nav-link:hover {
  background: rgba(0, 0, 0, 0.04);
}

.header-nav-link.active {
  background: #1890ff;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: right;
  flex: 1;
  justify-content: flex-end;
  min-width: 200px;
}

.time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  white-space: nowrap;
  padding-right: 20px;
  border-right: 1px solid #eee;
  font-size: 13px;
  // color: #333;
}

.clock {
  font-weight: bold;
  font-size: 14px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
  .bg-outline{
     width: 36px;
     height: 36px;
     border-radius: 50%;
    border: 1px solid #ddd;

  }

/* Responsive layout */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-center {
    width: 100%;
    text-align: left;
    margin: 10px 0;
  }

  .header-nav {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .header          { flex-direction: row; }          /* stay in a single line */
  .header-left     { width:100%; }                   /* full‑width row 1 */
  .header-center   { width:100%; margin:10px 0; }    /* row 2 */
  .header-right    { width:100%; justify-content:space-between; } /* row 3 */

  .burger-btn {
    display: inline-flex;
    margin-left: auto;       /* pushes it flush right within header-left */
    background: none;
    border: none;
  }
}
  @media (min-width: 769px) {
  .burger-btn { display: none; }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: #fff;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.header-action-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.header-action-btn.logout {
  color: #ff4d4f;
  border-color: #ffccc7;
}

.header-action-btn.logout:hover {
  background: #fff1f0;
  border-color: #ff4d4f;
  color: #ff4d4f;
}

@media (max-width: 1100px) {
  .header-action-btn span { display: none; }
  .header-action-btn { padding: 0 10px; }
}

/* Icon spacing fix */
.menu-icon {
  margin-right: 5px;
  font-size: 16px;
}

        `}
      </style>
    </header>
  );
}
