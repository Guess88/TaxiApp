import React,{ useState, useEffect } from 'react';
import '../style/dashboardNav.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faListAlt ,faPlus ,faTaxi  } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Rating from '@mui/material/Rating';
import TimerComponent from './timerComponent';


const DashboardUser = ({ user }) => {
    
    const [viewOption, setView] = useState('editProfile');
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [address, setAddress] = useState('');
    const [userId,setId] = useState('');
    const [isCreatedRide,setIsCreatedRide] = useState('');
    

    

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePath, setProfilePicturePath] = useState('');


    const [startAddress, setStartAddress] = useState('');
    const [endAddress, setEndAddress] = useState('');
    const [estimatedCost, setEstimatedCost] = useState(null);
    const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
    const [estimatedTravelTime,setEstimatedTravelTime] = useState(null);
    const [rideId, setRideId] = useState('');
    const [rideStatus, setRideStatus] = useState(0);
    const [valueRating, setValueRating] = useState(1);
    const [rides, setRides] = useState([]);
    

   

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setDateOfBirth(convertDateTimeToDateOnly(user.dateOfBirth));
            setAddress(user.address);
            setId(user.id);
            setIsCreatedRide(user.isRideCreated);
            setProfilePicturePath(user.profilePicturePath)
        }
    }, [user]);

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_PREVIOUS_RIDES, {
                    params: { userId: userId }
                });
                setRides(response.data);
            } catch (error) {
                console.error("Error fetching rides:", error);
            }
        };
    
        fetchRides();
    }, [userId]);
    
    
   

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
                setProfilePicturePath(filePath);
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

    const handleNewRide = async () => {
        try {
            setView('newRide');
        } catch (error) {
            console.error("Error verificationShow", error);
        }
    };
    const handlePreviousRide = async () => {
        try {
            setView('previousRide');
        } catch (error) {
            console.error("Error allRides", error);
        }
    };


    //ZA voznje
    const handleCreateRide = async () => {
        try {
            // Call your API to create a new ride
            const response = await axios.post(process.env.REACT_APP_CREATE_RIDE, {userId, startAddress, endAddress, });
            setEstimatedCost(response.data.estimatedCost);
            setEstimatedWaitTime(response.data.estimatedWaitTime);
            
            setRideId(response.data.id);
            setIsCreatedRide(true);
        } catch (error) {
            console.error('Error creating ride:', error);
        }
    };

    const handleConfirmRide = async () => {
        try {
            // Call your API to confirm the ride
            const response = await axios.post(process.env.REACT_APP_CONFIRM_RIDE, rideId,{
                headers: {
                'Content-Type': 'application/json',
                },
            });
            setEstimatedTravelTime(response.data.estimatedTravelTime);
            setRideStatus(response.data.status);
        } catch (error) {
            console.error('Error confirming ride:', error);
        }
    }

    const handleRatingChange = async (event, newValue) => {
        setValueRating(newValue);
        try {
            const data = {
                driverId: 2, // Replace 2 with the actual driverId
                rating: newValue,
                rideId: rideId,
                userId: userId
            };
            await axios.post(process.env.REACT_APP_RATE_DRIVER, data,{ //OVO 2 imeni sa driverId///////////////////////////////////////////
                headers: {
                    'Content-Type': 'application/json',
                    },
            });   
            setIsCreatedRide(false);
            setRideStatus(0);
            
            const responseRides = await axios.get(process.env.REACT_APP_PREVIOUS_RIDES, {
                params: { userId: userId }
            });
            setRides(responseRides.data);
   
            alert('Thank you!');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating');
        }
    };

    const handleRideStatusChange = (newStatus) => {
        setRideStatus(newStatus);
    };


    return (
        <div>
        {rideStatus === 2 ? (
                            <div style={{ width: '30%', backgroundColor: '#18283b', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', boxSizing: 'border-box', borderRadius: '10px' }}>
                                {/* Content for status 1 */}
                                <TimerComponent rideId={rideId} estimatedWaitTime={estimatedWaitTime} estimatedTravelTime={estimatedTravelTime} onRideStatusChange={handleRideStatusChange}/>
                            </div>
        ):(
            <div>
                <div id="nav-bar">
            <input id="nav-toggle" type="checkbox"/>
            <div id="nav-header"><a id="nav-title" href="/" target="_blank"rel="noreferrer noopener"><FontAwesomeIcon icon={faTaxi} className="fas" />Taxi</a>
                <label for="nav-toggle"><span id="nav-toggle-burger"></span></label>
                <hr/>
            </div>
            <div id="nav-content">
                <div className="nav-button" onClick={handleEditProfile} ><FontAwesomeIcon icon={faUser} className="fas" /><span>Profile</span></div>
                <div className="nav-button" onClick={handleNewRide}><FontAwesomeIcon icon={faPlus } className="fas" /><span>New ride</span></div>
                <div className="nav-button" onClick={handlePreviousRide}><FontAwesomeIcon icon={faListAlt } className='fas' /><span>Previous Rides</span></div>
            </div>
            <input id="nav-footer-toggle" type="checkbox"/>
            <div id="nav-footer">
                <div id="nav-footer-heading">
                    <div id="nav-footer-avatar"><img src={`http://localhost:9062/api/Images/${profilePicturePath}`} alt="avatar"/></div>
                    <div id="nav-footer-titlebox"><a id="nav-footer-title" href="https://codepen.io/uahnbu/pens/public" target="_blank" rel="noreferrer noopener">{user.username}</a>
                        <span id="nav-footer-subtitle">
                           {user.userType === 0 ? 'Administrator' : 
                            user.userType === 1 ? 'User' : 
                            user.userType === 2 ? 'Driver' : 'Unknown'}
                        </span>
                    </div>
                    <label for="nav-footer-toggle"><i className="fas fa-caret-up"></i></label>
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
                         <img src={`http://localhost:9062/api/Images/${profilePicturePath}`} alt="User" style={{ width: '100px', height: '100px', marginBottom: '20px', borderRadius: '50%'  }} />
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




            ) : viewOption === "newRide" ? (
                <div>
                    {!isCreatedRide ? (
                        <div  style={{ width: '40%', backgroundColor: '#18283b',position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',padding: '20px',boxSizing: 'border-box',borderRadius: '10px'}}>
                            <div className='customProfile-div'>
                                <h2 style={{marginLeft:'250px'}}>Create new ride</h2>
                                <input 
                                    className='custom-input-create-ride' 
                                    type="text" 
                                    placeholder="Start Address" 
                                    value={startAddress} 
                                    onChange={(e) => setStartAddress(e.target.value)} 
                                />
                                <br/>
                                <br/>
                                
                                <input 
                                    className='custom-input-create-ride'
                                    type="text" 
                                    placeholder="End Address" 
                                    value={endAddress} 
                                    onChange={(e) => setEndAddress(e.target.value)} 
                                />

                                <br/>
                                <br/>
                                <button className='edit-button'style={{marginLeft:'85%'}} onClick={handleCreateRide}>Order</button>
                            </div>
                        </div>
                    ) : (
                        rideStatus === 0 ? (
                            <div style={{ width: '20%', backgroundColor: '#18283b', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', boxSizing: 'border-box', borderRadius: '10px' }}>
                                <div className='customProfile-div'>
                                    <h2 style={{ marginLeft: '15%' }}>{startAddress}-{endAddress}</h2>
                                    <h2>Price: {estimatedCost}$</h2>
                                    <h2>Waiting time: {estimatedWaitTime.split(':')[1]} minutes</h2>
                                    <button className='edit-button' style={{ marginLeft: '75%' }} onClick={handleConfirmRide}>Confirm</button>
                                </div>
                            </div>                      
                        ) : rideStatus === 1 ? (
                            <div style={{ width: '30%', backgroundColor: '#18283b', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', boxSizing: 'border-box', borderRadius: '10px' }}>
                                <div className='customProfile-div'>
                                    <h2 style={{ marginLeft: '10%' }}>{startAddress}-{endAddress}</h2>
                                    <h3>Wait until one of our employees accepts the ride</h3> 
                                    {handleRideStatusChange(2)}  
                                   
                                </div>
                            </div>
                        ) : rideStatus === 3 ? (
                            <div style={{ width: '20%', backgroundColor: '#18283b', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', boxSizing: 'border-box', borderRadius: '10px' }}>
                                <div className='customProfile-div'>
                                    <h3>Rate your driver</h3>
                                    <Rating
                                        value={valueRating}
                                        onChange={handleRatingChange}
                                    />
                                </div>
                            </div>
                        ) : null
                       
                    )}
                </div>


            ): viewOption === "previousRide" ? (
                <div className='customProfile-div ride-list' style={{ width: '30%', backgroundColor: '#18283b', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', boxSizing: 'border-box', borderRadius: '10px' }}>
                    {rides.map(ride => (
                        <div key={ride.id} className="ride-item">
                            <div className='ride-info'>
                                <h3>Ride from {ride.startAddress} to {ride.endAddress}</h3>
                                <h3>Date: {convertDateTimeToDateOnly(ride.createdAt)}</h3>
                                <h3>Price: {ride.estimatedCost}$</h3>
                            </div>
                            <hr/>
                        </div>
                        
                    ))}
                </div>
            ) : null}
            </div>
        </div>
            </div>
        )}
      
     </div>
    );
};


export default DashboardUser;
