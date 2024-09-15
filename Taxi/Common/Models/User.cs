using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public enum UserType
    {
        Administrator,
        User,
        Driver
    }

    public enum DriverVerificationStatus
    {
        Pending,
        Approved,
        Rejected
    }

    [Table("User")]
    public class User
    {

        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; }
        public UserType UserType { get; set; }
        public string ProfilePicturePath { get; set; }

        public bool IsVerificated { get; set; } = false;
        public bool IsBlocked { get; set; } = false;

        public bool IsRideCreated { get; set; } = false;
        public bool IsRideAccepted { get; set; } = false;
        public int RatingCount { get; set; }
        public int RatingTotal { get; set; }
        public DriverVerificationStatus VerificationStatus { get; set; }
    }
}
