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
        Task<Ride> ConfirmRide(int rideId);
        Task AddRideToPendingList(Ride ride);
        Task AcceptRide(int driverId, int rideId);
        Task RateDriver(int driverId, int rating,int rideId,int userId);
        Task<decimal> GetDriverAverageRating(int driverId);
        Task BlockDriver(int driverId);
        Task UnblockDriver(int driverId);


    }
}
