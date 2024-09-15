import React,{ useState, useEffect } from 'react';
import '../style/dashboardNav.css'
import '../style/profile.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCar,faCheckCircle,faTaxi  } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';



const DashboardAdmin = ({ user }) => {
    const [viewOption, setView] = useState('editProfile');
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [address, setAddress] = useState('');
    

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [rides, setRides] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [avgRating,setAvgRating] = useState({});
   

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setDateOfBirth(convertDateTimeToDateOnly(user.dateOfBirth));
            setAddress(user.address);
        }
    }, [user]);

    if (!user) {
        return <div>No user data available</div>;
    }


    const handleEditProfile = async () => {
        try {
            setView('editProfile');
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


    const fetchDrivers = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_GET_USERS);
            const filteredDrivers = response.data.filter(user => user.userType === 2)
        
            setDrivers(filteredDrivers);
            filteredDrivers.forEach(driver => {
                getDriverRating(driver.id);
            });
            
        } catch (error) {
            console.error('Error fetching all rides:', error);
        }
    };

    const handleVerification = async () => {
        try {
            setView('verification');
            fetchDrivers();
        } catch (error) {
            console.error("Error verificationShow", error);
        }
    };

    const fetchAllRides = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_ALL_RIDES);
            setRides(response.data);
        } catch (error) {
            console.error('Error fetching all rides:', error);
        }
    };

    const getDriverRating = async (driverId) => {
        try {
            const response = await axios.get(process.env.REACT_APP_AVG_RATING,{
                params: { driverId: driverId }
            });
            const formattedRating = parseFloat(response.data).toFixed(2);
            setAvgRating(prevRatings => ({
                ...prevRatings,
                [driverId]: formattedRating
            }));
            console.log(avgRating)


        } catch (error) {
            console.error('Error fetching all rides:', error);
        }
    };

    const handleBlockButton = async (driverId) => {
        try {
            const response = await axios.post(process.env.REACT_APP_BLOCK_DRIVER,null,{
                params: { driverId: driverId }
            });
            console.log(response.data);
            fetchDrivers();
        } catch (error) {
            console.error('Error block driver:', error);
        }
    }

    const handleUnblockButton = async (driverId) => {
        try {
            const response = await axios.post(process.env.REACT_APP_UNBLOCK_DRIVER,null,{
                params: { driverId: driverId }
            });
            console.log(response.data);
            fetchDrivers();
        } catch (error) {
            console.error('Error unblock driver:', error);
        }
    }

    const handleAcceptButton = async (driverId) => {
        try {
            const response = await axios.post(process.env.REACT_APP_DRIVER_APPROVE,null,{
                params: { driverId: driverId }
            });
            console.log(response.data);
            fetchDrivers();
        } catch (error) {
            console.error('Error Accept driver:', error);
        }
    }

    const handleRejectButton = async (driverId) => {
        try {
            const response = await axios.post(process.env.REACT_APP_DRIVER_REJECT,null,{
                params: { driverId: driverId }
            });
            console.log(response.data);
            fetchDrivers();
        } catch (error) {
            console.error('Error unblock driver:', error);
        }
    }
    
    

    const handleAllRides = async () => {
        try {
            setView('allRides');
            fetchAllRides();
                      
        } catch (error) {
            console.error("Error allRides", error);
        }
    };

    const statusMap = {
        0: "Created",
        1: "WaitingForAccept",
        2: "InProgress",
        3: "Completed",
        4: "Cancelled"
    };

    const verificationStatus = {
        0: "Pending",
        1: "Approved",
        2: "Rejected"
    };

    return (
       <div> 
        <div id="nav-bar">
            <input id="nav-toggle" type="checkbox"/>
            <div id="nav-header"><a id="nav-title" href="/" target="_blank"rel="noreferrer noopener"><FontAwesomeIcon icon={faTaxi} className="fas" />Taxi</a>
                <label for="nav-toggle"><span id="nav-toggle-burger"></span></label>
                <hr/>
            </div>
            <div id="nav-content">
                <div class="nav-button" onClick={handleEditProfile}><FontAwesomeIcon icon={faUser} className="fas" /><span>Profile</span></div>
                <div class="nav-button" onClick={handleVerification}><FontAwesomeIcon icon={faCheckCircle} className="fas" /><span>Verification</span></div>
                <div class="nav-button" onClick={handleAllRides}><FontAwesomeIcon icon={faCar} className='fas' /><span>All rides</span></div>
            </div>
            <input id="nav-footer-toggle" type="checkbox"/>
            <div id="nav-footer">
                <div id="nav-footer-heading">
                    <div id="nav-footer-avatar"><img src={`http://localhost:9062/api/Images/${user.profilePicturePath}`} alt="avatar"/></div>
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



            ) : viewOption === "verification" ? (
                <div className='customProfile-div ride-list' style={{ width: '35%', backgroundColor: '#18283b', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', boxSizing: 'border-box', borderRadius: '10px' }}>
                    {drivers.map(driver => (
                    <div key={driver.id} className="ride-item">
                        
                        <div className='ride-info'>
                        <img src={`http://localhost:9062/api/Images/${driver.profilePicturePath}`} alt="User" style={{ width: '150px', height: '150px', borderRadius: '50%' ,marginLeft:'35%' }} />
                            <h2>{driver.firstName} {driver.lastName}</h2>
                            <h3>DriverID: {driver.id}</h3>
                            <h3>Status: {verificationStatus[driver.verificationStatus]}</h3>
                            {driver.verificationStatus === 0 ? (
                                <>
                                <button className='edit-button' style={{backgroundColor:'green'}} onClick={() => handleAcceptButton(driver.id)}>Accept</button>  
                                <button className='edit-button' style={{backgroundColor:'red'}} onClick={() => handleRejectButton(driver.id)}>Reject</button> 
                                </>
                            ):(<></>)}
                                
                            <h3>Average rating: {avgRating[driver.id]}</h3>
                        </div>
                        {driver.isBlocked ? (
                            <button className='edit-button' style={{backgroundColor:'green',marginLeft:'80%'}} onClick={() => handleUnblockButton(driver.id)}>Unblock</button>
                        ): (
                            <button className='edit-button' style={{backgroundColor:'red',marginLeft:'80%'}} onClick={() => handleBlockButton(driver.id)}>Block</button>
                        )}
                        
                        <hr className="ride-separator"/>
                    </div>
            ))}
                </div>
            ): viewOption === "allRides" ? (
                <div className='customProfile-div ride-list' style={{ width: '35%', backgroundColor: '#18283b', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', boxSizing: 'border-box', borderRadius: '10px' }}>
                {rides.map(ride => (
                    <div key={ride.id} className="ride-item">
                        <div className='ride-info'>
                            <h3>Ride ID: {ride.id}</h3>
                            <h3>DriverID: {ride.driverId}</h3>
                            <h3>UserID: {ride.userId}</h3>
                            <h3>Ride from {ride.startAddress} to {ride.endAddress}</h3>
                            <h3>Date: {convertDateTimeToDateOnly(ride.createdAt)}</h3>
                            <h3>Price: {ride.estimatedCost}$</h3>
                            <h3>Status: {statusMap[ride.status]}</h3>
                        </div>
                        <hr className="ride-separator"/>
                    </div>
            ))}
                </div>
            ) : null}
            </div>
        </div>
     </div>
    );
};

export default DashboardAdmin;
