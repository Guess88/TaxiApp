using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class RatingDTO
    {
        public int DriverId { get; set; }
        public int Rating { get; set; }
        public int RideId { get; set; }
        public int UserId { get; set; }
    }
}
