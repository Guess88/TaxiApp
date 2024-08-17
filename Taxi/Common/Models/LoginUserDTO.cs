using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class LoginUserDTO
    {
        public string Email { get; set; }
        public string PasswordHash { get; set; }
    }
}
