using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class RideRequestDTO
    {
        public int UserId { get; set; } // ID korisnika koji kreira vožnju
        public string StartAddress { get; set; } // Početna adresa
        public string EndAddress { get; set; } // Krajnja adresa


    }
}
