namespace Common.Models
{
    public class UserWithToken : User
    {
        public string AccessToken { get; set; }

        public UserWithToken(User user)
        {
            this.Id = user.Id;
            this.Username = user.Username;
            this.Email = user.Email;
            this.PasswordHash = user.PasswordHash;
            this.FirstName = user.FirstName;
            this.LastName = user.LastName;
            this.DateOfBirth = user.DateOfBirth;
            this.Address = user.Address;
            this.UserType = user.UserType;
            this.ProfilePicturePath = user.ProfilePicturePath;

        }
    }
}
