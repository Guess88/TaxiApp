using Common.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Interfaces
{
    public interface IDrive : IService
    {
        Task<Ride> CreateRide(int userId, string startAddress, string endAddress, decimal estimatedCost, TimeSpan estimatedWaitTime);
       

    }
}
