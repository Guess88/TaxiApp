import React,{ useState, useEffect } from 'react';
import '../style/dashboardNav.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMapMarkerAlt ,faRoad  ,faTaxi  } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import TimerComponent from './timerComponent';


const DashboardDriver = ({ user }) => {
    
    const [viewOption, setView] = useState('editProfile');
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [address, setAddress] = useState('');
    const [verStatus, setVerStatus]=useState(0);
    

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [rides, setRides] = useState([]);
    const [pendingRides, setPendingRides] = useState([]);
    const [showTimer, setShowTimer] = useState(false);

   

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setDateOfBirth(convertDateTimeToDateOnly(user.dateOfBirth));
            setAddress(user.address);
            setVerStatus(user.verificationStatus)
        }
    }, [user]);

    if (!user) {
        return <div>No user data available</div>;
    }


    const handleEditProfile = async () => {
        try {
            setView('editProfile');
            console.log(user);
        } catch (error) {
            console.error("Error editProfile", error);
        }
    };

    const handleEditButton = () => {
        setIsEditing(true);
    };

    const handleCancelButton = () => {
        setIsEditing(false);
        setAddress(user.address);
        setDateOfBirth(user.dateOfBirth);
        setEmail(user.email);
        setUsername(user.username);
        setFirstName(user.firstName);
        setLastName(user.lastName);        
        setOldPassword('');
        setNewPassword('');
        setRepeatNewPassword('');
    };

    const handleSaveButton = async () => {
        if (newPassword !== repeatNewPassword) { // Provera da li se lozinke poklapaju
            alert('Passwords do not match');
            return;
          }
      
         
          user.username = username;
          user.email = email;
          user.passwordHash = newPassword;//Posalje se prvo samo password, pa se hesuje na backendu
          user.firstName = firstName;
          user.lastName = lastName;
          user.dateOfBirth = dateOfBirth;
          user.address = address;

          const formData = new FormData();
            formData.append('Username', username);
            formData.append('Email', email);

            if(newPassword !== null && newPassword !== ""){
                formData.append('Password', newPassword);
                console.log(newPassword);
            }

            formData.append('FirstName', firstName);
            formData.append('LastName', lastName);
            const dateParts = dateOfBirth.split('-');
            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // 'YYYY-MM-DD'
            const formattedDateOfBirth = new Date(formattedDate).toISOString().split('T')[0];

            formData.append('DateOfBirth', formattedDateOfBirth);

            formData.append('Address', address);

            if (profilePicture) {
                formData.append('ProfilePicture', profilePicture);
                const basePath = 'Common\\Photos\\';
                const profilePictureFileName = profilePicture.name 
                const filePath = `${basePath}${profilePictureFileName}`;
                user.profilePicturePath = filePath;
            }
      
          try {
                await axios.put(process.env.REACT_APP_UPDATE_USER, formData, {
                headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (error) {
            console.error('Update user failed:', error.response ? error.response.data : error.message);
          }
    };

  

    const convertDateTimeToDateOnly = (dateTime) => {
        const dateObj = new Date(dateTime);
    
        // Get the date components
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const day = dateObj.getDate();
    
        // Format the date as 'DD-MM-YYYY'
        return `${day.toString().padStart(2, '0')}-${(month + 1).toString().padStart(2, '0')}-${year}`;
    }


      

    const fetchAllPendingRides = async() =>{
        try {
            const response = await axios.get(process.env.REACT_APP_PENDING_RIDES); 
            setPendingRides(response.data);
        } catch (error) {
            console.error('Error fetching all rides:', error);
        }
    }

    const handleNewRides = async () => {
        try {
            setView('newRides');
            fetchAllPendingRides();
        } catch (error) {
            console.error("Error newRides show", error);
        }
    };
    
    
    const handleAcceptRideButton = async (rideId) => {
        try {
           const response = await axios.post(process.env.REACT_APP_ACCEPT_RIDE,null,{
                params: { 
                    rideId: rideId,
                    driverId: user.id
                 }
           });
           console.log(response.data);
           fetchAllPendingRides();
           setShowTimer(true);
        } catch (error) {
            console.error("Error acceptRideButton", error);
        }
    };

    const fetchAllRides = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_ALL_RIDES);
            const filteredRides = response.data.filter(ride => {
                console.log("Ride driverId:", ride.driverId);
                console.log("Ride status:", ride.status);
                console.log("User ID:", user.id);
                return ride.driverId === user.id && ride.status === 3;
            });
            
            console.log("Filtered Rides:", filteredRides);
            setRides(filteredRides);
        } catch (error) {
            console.error('Error fetching all rides:', error);
        }
    };

    const handleMyRides = async () => {
        try {
            setView('myRides');
            fetchAllRides();
        } catch (error) {
            console.error("Error allRides", error);
        }
    };

    const parseTimeSpanToMilliseconds = (timeSpan) => {
        const [hours, minutes, seconds] = timeSpan.split(':').map(Number);
        return ((hours * 60 * 60) + (minutes * 60) + seconds) * 1000;
      };

      const formatTime = (time) => {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      };

      const handleRideStatusChange = (newStatus) => {
        console.log(newStatus);
     };

    

    return (
        <div>
       {verStatus === 0 ? (
             <div  style={{ width: '25%', backgroundColor: '#18283b',position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',padding: '20px',boxSizing: 'border-box',borderRadius: '10px'}}>
               <h1>Waiting for verification</h1>
            </div>
        ) : verStatus === 1 ? (
            <div>
                <div id="nav-bar">
            <input id="nav-toggle" type="checkbox"/>
            <div id="nav-header"><a id="nav-title" href="/" target="_blank"rel="noreferrer noopener"><FontAwesomeIcon icon={faTaxi} className="fas" />Taxi</a>
                <label for="nav-toggle"><span id="nav-toggle-burger"></span></label>
                <hr/>
            </div>
            <div id="nav-content">
                <div class="nav-button" onClick={handleEditProfile}><FontAwesomeIcon icon={faUser} className="fas" /><span>Profile</span></div>
                <div class="nav-button" onClick={handleNewRides}><FontAwesomeIcon icon={faMapMarkerAlt } className="fas" /><span>New rides</span></div>
                <div class="nav-button" onClick={handleMyRides}><FontAwesomeIcon icon={faRoad } className='fas' /><span>My rides</span></div>
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
        <div style={{  display: 'flex', flexDirection: 'column' }}>
            <div  style={{ height: '100%', display: 'flex' }}>

               
            {viewOption === "editProfile" ? (
                 <div  style={{ width: '25%', backgroundColor: '#18283b',position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',padding: '20px',boxSizing: 'border-box',borderRadius: '10px'}}>
                 <div>
                     <div className="custom-style">Edit profile</div>
                     <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <img src={`http://localhost:9062/api/Images/${user.profilePicturePath}`} alt="User" style={{ width: '100px', height: '100px', marginBottom: '20px', borderRadius: '50%'  }} />
                     </div>
                     {isEditing ? (
                         <div className='customView-div' style={{ marginLeft: '30px'}}>
                             <input type="file" onChange={(e) => setProfilePicture(e.target.files[0])} />
                         </div>
                     ) : (
                         <div></div>
                     )}
                     <div style={{ marginLeft: '30px' }}>
                         <div className='customProfile-div'>Username</div>
                         {isEditing ? (
                             <input className='custom-input' type='text' value={username} onChange={(e) => setUsername(e.target.value)} />
                         ) : (
                             <div className='customView-div'>{username}</div>
                         )}
                         <hr className='customProfile-hr' />
                         <div className='customProfile-div'>First name</div>
                         {isEditing ? (
                             <input className='custom-input' type='text' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                         ) : (
                             <div className='customView-div'>{firstName}</div>
                         )}
                         <hr className='customProfile-hr' />
                         <div className='customProfile-div'>Last name</div>
                         {isEditing ? (
                             <input className='custom-input' type='text' value={lastName} onChange={(e) => setLastName(e.target.value)} />
                         ) : (
                             <div className='customView-div'>{lastName}</div>
                         )}
                         <hr className='customProfile-hr' />
                         <div className='customProfile-div'>Address</div>
                         {isEditing ? (
                             <input className='custom-input' type='text' value={address} onChange={(e) => setAddress(e.target.value)} />
                         ) : (
                             <div className='customView-div'>{address}</div>
                         )}
                         <hr className='customProfile-hr' />
                         <div className='customProfile-div'>Birthday</div>
                         {isEditing ? (
                             <input className='custom-input' type='text' value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                         ) : (
                             <div className='customView-div'>{dateOfBirth}</div>
                         )}
                         <hr className='customProfile-hr' />
                         <div className='customProfile-div'>Email</div>
                         {isEditing ? (
                             <input className='custom-input' type='email' value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '250px' }} />
                         ) : (
                             <div className='customView-div'>{email}</div>
                         )}
                         <hr className='customProfile-hr' />
                         
                         {isEditing ? (
                             <div className='customProfile-div'>Old password
                                <input className='custom-input' type='password' value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                             </div>
                         ) : (
                             <div>
                                 
                             </div>
                         )}
                        <div className='customProfile-container'>
                         {isEditing ? (
                            <div className='customProfile-div'>New password
                                <input className='custom-input' type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                         ) : (
                             <div>
                                
                             </div>
                         )}
                         
                         {isEditing ? (
                            <div className='customProfile-div'>Repeat new password
                             <input className='custom-input' type='password' value={repeatNewPassword} onChange={(e) => setRepeatNewPassword(e.target.value)} />
                            </div>
                         ) : (
                             <div>
                                 
                             </div>
                         )}
                         </div>
                         <hr className='customProfile-hr' />
                         <br />
                            {isEditing ? (
                                <div>
                                    <button className='edit-button' onClick={handleSaveButton} >Save</button>
                                    <button className='edit-button' onClick={handleCancelButton} style={{marginLeft:180}}>Cancel</button>
                                </div>
                            ) : (
                                <div>
                                    <button className='edit-button' onClick={handleEditButton}>Edit</button>
                                </div>
                            )}
                         
                     </div>
                 </div>
             </div>



            ) : viewOption === "newRides" ? (
                <div className='customProfile-div ride-list' style={{ width: '35%', backgroundColor: '#18283b', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', boxSizing: 'border-box', borderRadius: '10px' }}>
                    {pendingRides.length > 0 ? (
                        pendingRides.map(ride => (
                            <div key={ride.id} className="ride-item">
                                <div className='ride-info'>
                                    <h3>Ride from {ride.startAddress} to {ride.endAddress}</h3>
                                    <h3>Price: {ride.estimatedCost}$</h3>
                                    <h3>Time to get to the customer: {formatTime(parseTimeSpanToMilliseconds(ride.estimatedWaitTime))} minutes.</h3>
                                    {user.isBlocked ? (
                                        <button className='edit-button' style={{backgroundColor:'gray', marginLeft:'80%'}} disabled>Blocked</button>
                                    ) : (
                                        <button className='edit-button' style={{backgroundColor:'green', marginLeft:'80%'}} onClick={() => handleAcceptRideButton(ride.id)}>Accept</button>
                                    )}
                                    {showTimer && (
                                         <div style={{ width: '30%', backgroundColor: '#18283b', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', boxSizing: 'border-box', borderRadius: '10px' }}>
                                         {/* Content for status 1 */}
                                        
                                        <TimerComponent rideId={ride.id} estimatedWaitTime={ride.estimatedWaitTime} estimatedTravelTime={ride.estimatedTravelTime} onRideStatusChange={handleRideStatusChange}/></div>
                                    )}
                                </div>
                                <hr className="ride-separator"/>
                            </div>
                        ))
                    ) : (
                        <h2 style={{marginLeft:'150px'}}>No pending rides available.</h2>
                    )}
                </div>


            ): viewOption === "myRides" ? (
                <div className='customProfile-div ride-list' style={{ width: '35%', backgroundColor: '#18283b', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', boxSizing: 'border-box', borderRadius: '10px' }}>
                    {rides.length > 0 ? (
                        rides.map(ride => (
                            <div key={ride.id} className="ride-item">
                                <div className='ride-info'>
                                    <h3>Ride from {ride.startAddress} to {ride.endAddress}</h3>
                                    <h3>Date: {convertDateTimeToDateOnly(ride.createdAt)}</h3>
                                    <h3>Price: {ride.estimatedCost}$</h3>
                                </div>
                                <hr className="ride-separator"/>
                            </div>
                        ))
                    ) : (
                        <h2 style={{marginLeft:'180px'}}>No rides available.</h2>
                    )}
                </div>
            ) : null}
            </div>
        </div>
            </div>
        ) : verStatus === 2 ? (
            <div  style={{ width: '25%', backgroundColor: '#18283b',position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',padding: '20px',boxSizing: 'border-box',borderRadius: '10px'}}>
               <h1>You are rejected!</h1>
            </div>
        ) : (
            <></>
        )}
        
     </div>
    );
};

export default DashboardDriver;
