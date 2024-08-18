import React from 'react';
import '../style/dashboardNav.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMapMarkerAlt ,faRoad  ,faTaxi  } from '@fortawesome/free-solid-svg-icons';


const DashboardDriver = ({ user }) => {
    
    if (!user) {
        return <div>No user data available</div>;
    }
    return (
        <div id="nav-bar">
            <input id="nav-toggle" type="checkbox"/>
            <div id="nav-header"><a id="nav-title" href="https://codepen.io" target="_blank"rel="noreferrer noopener"><FontAwesomeIcon icon={faTaxi} className="fas" />Taxi</a>
                <label for="nav-toggle"><span id="nav-toggle-burger"></span></label>
                <hr/>
            </div>
            <div id="nav-content">
                <div class="nav-button"><FontAwesomeIcon icon={faUser} className="fas" /><span>Profile</span></div>
                <div class="nav-button"><FontAwesomeIcon icon={faMapMarkerAlt } className="fas" /><span>New rides</span></div>
                <div class="nav-button"><FontAwesomeIcon icon={faRoad } className='fas' /><span>My rides</span></div>
            </div>
            <input id="nav-footer-toggle" type="checkbox"/>
            <div id="nav-footer">
                <div id="nav-footer-heading">
                    <div id="nav-footer-avatar"><img src={`http://localhost:9062/api/Images/${user.profilePicturePath}`} alt="avatar" /></div>
                    <div id="nav-footer-titlebox"><a id="nav-footer-title" href="https://codepen.io/uahnbu/pens/public" target="_blank" rel="noreferrer noopener">{user.username}</a>
                        <span id="nav-footer-subtitle">
                           {user.userType === 0 ? 'Administrator' : 
                            user.userType === 1 ? 'User' : 
                            user.userType === 2 ? 'Driver' : 'Unknown'}
                        </span>
                    </div>
                    <label for="nav-footer-toggle"><i class="fas fa-caret-up"></i></label>
                </div>
                <div id="nav-footer-content">
                    <h1 className='fas'>{user.firstName} {user.lastName}</h1>
                </div>
            </div>
        </div>
    );
};

export default DashboardDriver;
