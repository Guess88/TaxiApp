﻿using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public  class updateUserDTO
    {
        public string Username { get; set; }

        public string Email { get; set; }

        public string? Password { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; }
        public IFormFile? ProfilePicture { get; set; }
    }
}
